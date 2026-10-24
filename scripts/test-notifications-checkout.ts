/**
 * Store notifications model, dashboard/badge poller, and returning-customer saved details.
 * Run: npx tsx --test scripts/test-notifications-checkout.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildBackupDecisionNotification,
  buildCommissionDecisionNotification,
  storeNotificationId,
} from "../src/lib/notifications/store-notification-model";
import { newlyArrived, startPoller, type PollerEnv } from "../src/lib/notifications/poller";
import {
  MAX_SAVED_ADDRESSES,
  PROFILE_TTL_MS,
  addressKey,
  parseProfile,
  profileStorageKey,
  rememberOrder,
  removeAddress,
  type AddressInput,
} from "../src/lib/checkout/saved-profile";

// ---------------------------------------------------------------- notifications

test("notification ids are deterministic per request + decision", () => {
  assert.equal(
    storeNotificationId("commission_request_decision", "req1", "approved"),
    storeNotificationId("commission_request_decision", "req1", "approved")
  );
  assert.notEqual(
    storeNotificationId("backup_request_decision", "b1", "approved"),
    storeNotificationId("backup_request_decision", "b1", "completed")
  );
  assert.notEqual(
    storeNotificationId("backup_request_decision", "b1", "approved"),
    storeNotificationId("commission_request_decision", "b1", "approved")
  );
  assert.ok(!storeNotificationId("backup_request_decision", "a/b", "approved").includes("/"));
});

test("commission decision notification", () => {
  const ok = buildCommissionDecisionNotification({ requestId: "r1", approved: true, proposedLabel: "3% per order", note: "Agreed" });
  assert.equal(ok.decision, "approved");
  assert.equal(ok.read, false);
  assert.match(ok.title, /approved/);
  assert.match(ok.detail ?? "", /3% per order/);
  assert.equal(ok.note, "Agreed");
  assert.equal(ok.href, "/admin/settings?tab=Commission");
  const no = buildCommissionDecisionNotification({ requestId: "r1", approved: false, proposedLabel: "Rs. 200 per order" });
  assert.equal(no.decision, "rejected");
  assert.match(no.detail ?? "", /current rate stays/);
  assert.equal("note" in no, false);
});

test("backup decision notification never claims more than the decision", () => {
  const approved = buildBackupDecisionNotification({ backupId: "b1", backupType: "export", decision: "approved" });
  assert.match(approved.title, /export request was approved/);
  assert.doesNotMatch(approved.detail ?? "", /completed/);
  const done = buildBackupDecisionNotification({ backupId: "b1", backupType: "import", decision: "completed" });
  assert.match(done.title, /import request was completed/);
  assert.equal(done.href, "/admin/settings?tab=Backup");
});

test("newlyArrived: first poll is only a baseline", () => {
  assert.deepEqual(newlyArrived(null, ["a", "b"]), []);
  assert.deepEqual(newlyArrived(["a"], ["a", "b", "c"]), ["b", "c"]);
  assert.deepEqual(newlyArrived(["a", "b"], ["a"]), []);
});

// ---------------------------------------------------------------- poller

function fakeEnv() {
  let visible = true;
  let tick: (() => void) | null = null;
  let onVis: (() => void) | null = null;
  const env: PollerEnv & { setVisible: (v: boolean) => void; tick: () => void; listeners: () => number; timers: () => number } = {
    setInterval: (fn) => {
      tick = fn;
      return 1;
    },
    clearInterval: () => {
      tick = null;
    },
    isVisible: () => visible,
    onVisibilityChange: (fn) => {
      onVis = fn;
      return () => {
        onVis = null;
      };
    },
    setVisible: (v) => {
      visible = v;
      onVis?.();
    },
    tick: () => tick?.(),
    listeners: () => (onVis ? 1 : 0),
    timers: () => (tick ? 1 : 0),
  };
  return env;
}

const flush = () => new Promise((r) => setImmediate(r));

test("poller: runs immediately, never overlaps, coalesces extra triggers", async () => {
  const env = fakeEnv();
  let running = 0;
  let maxConcurrent = 0;
  let runs = 0;
  let release: () => void = () => {};
  const task = () =>
    new Promise<void>((resolve) => {
      running++;
      runs++;
      maxConcurrent = Math.max(maxConcurrent, running);
      release = () => {
        running--;
        resolve();
      };
    });
  const p = startPoller(task, 30000, env);
  assert.equal(runs, 1);
  env.tick();
  env.tick();
  p.trigger();
  assert.equal(runs, 1, "no second request while the first is in flight");
  release();
  await flush();
  assert.equal(runs, 2, "queued runs collapse into one follow-up");
  release();
  await flush();
  assert.equal(runs, 2);
  assert.equal(maxConcurrent, 1);
  p.stop();
});

test("poller: pauses while hidden, refreshes on return, cleans up on stop", async () => {
  const env = fakeEnv();
  let runs = 0;
  const p = startPoller(async () => {
    runs++;
  }, 30000, env);
  await flush();
  assert.equal(runs, 1);
  env.setVisible(false);
  env.tick();
  env.tick();
  await flush();
  assert.equal(runs, 1, "no reads while the tab is hidden");
  env.setVisible(true);
  await flush();
  assert.equal(runs, 2, "one refresh when the tab becomes visible");
  p.stop();
  assert.equal(env.timers(), 0, "interval cleared");
  assert.equal(env.listeners(), 0, "visibility listener removed");
  env.tick();
  p.trigger();
  await flush();
  assert.equal(runs, 2, "nothing runs after stop");
});

test("poller: a failing task doesn't break the loop", async () => {
  const env = fakeEnv();
  let runs = 0;
  const p = startPoller(async () => {
    runs++;
    throw new Error("network");
  }, 1000, env);
  await flush();
  env.tick();
  await flush();
  assert.equal(runs, 2);
  p.stop();
});

test("poller: idle pause stops automatic runs, activity resumes with one run", async () => {
  const env = fakeEnv();
  let clock = 0;
  let activity: (() => void) | null = null;
  env.now = () => clock;
  env.onActivity = (fn) => {
    activity = fn;
    return () => {
      activity = null;
    };
  };
  let runs = 0;
  const p = startPoller(async () => {
    runs++;
  }, 60000, env, { idleMs: 600000 });
  await flush();
  assert.equal(runs, 1);
  clock = 60000;
  env.tick();
  await flush();
  assert.equal(runs, 2, "normal scheduled run while active");
  clock = 700000; // > 10 min since last activity
  env.tick();
  env.tick();
  await flush();
  assert.equal(runs, 2, "no reads while idle");
  assert.equal(p.isIdle(), true);
  activity!();
  await flush();
  assert.equal(runs, 3, "first activity refreshes once");
  assert.equal(p.isIdle(), false);
  clock = 760000;
  env.tick();
  await flush();
  assert.equal(runs, 4, "schedule resumed");
  p.stop();
  assert.equal(activity, null, "activity listener removed on stop");
});

test("poller: Refresh (trigger) works even when idle", async () => {
  const env = fakeEnv();
  let clock = 0;
  env.now = () => clock;
  env.onActivity = () => () => {};
  let runs = 0;
  const p = startPoller(async () => {
    runs++;
  }, 60000, env, { idleMs: 600000 });
  await flush();
  clock = 9999999;
  env.tick();
  await flush();
  assert.equal(runs, 1);
  p.trigger();
  await flush();
  assert.equal(runs, 2);
  p.stop();
});

// ---------------------------------------------------------------- saved checkout details

const addr = (over: Partial<AddressInput> = {}): AddressInput => ({
  fullName: "Ali Khan",
  line1: "House 12, Street 4",
  line2: "Near Jamia Masjid",
  city: "Lahore",
  country: "Pakistan",
  state: "Punjab",
  postalCode: "54000",
  addressType: "home",
  ...over,
});

test("saved details are keyed per store", () => {
  assert.notEqual(profileStorageKey("storeA"), profileStorageKey("storeB"));
});

test("rememberOrder dedupes the same address (case/spacing-insensitive)", () => {
  let p = rememberOrder(null, { phone: "03001234567", email: "", address: addr() }, 1000);
  p = rememberOrder(p, { phone: "03001234567", email: "", address: addr({ fullName: "  ali   KHAN ", city: "lahore" }) }, 2000);
  assert.equal(p.addresses.length, 1);
  assert.equal(p.addresses[0].lastUsedAt, 2000);
});

test("rememberOrder keeps the newest first and caps the list", () => {
  let p = rememberOrder(null, { phone: "1", email: "", address: addr() }, 1);
  for (let i = 0; i < 8; i++) p = rememberOrder(p, { phone: "1", email: "", address: addr({ line1: `House ${i}` }) }, 10 + i);
  assert.equal(p.addresses.length, MAX_SAVED_ADDRESSES);
  assert.equal(p.addresses[0].line1, "House 7");
});

test("editing a picked saved address updates it instead of adding a copy", () => {
  let p = rememberOrder(null, { phone: "1", email: "", address: addr() }, 1);
  p = rememberOrder(p, { phone: "1", email: "", address: addr({ line1: "Other street 9" }) }, 2);
  const picked = p.addresses.find((a) => a.line1 === "House 12, Street 4")!;
  p = rememberOrder(p, { phone: "1", email: "", address: addr({ line1: "House 12, Street 5" }), editedId: picked.id }, 3);
  assert.equal(p.addresses.length, 2);
  assert.equal(p.addresses[0].id, picked.id);
  assert.equal(p.addresses[0].line1, "House 12, Street 5");
});

test("incomplete address is not saved; contact still is", () => {
  const p = rememberOrder(null, { phone: "03001234567", email: "a@b.co", address: addr({ city: "" }) }, 1);
  assert.equal(p.addresses.length, 0);
  assert.equal(p.phone, "03001234567");
});

test("removeAddress", () => {
  let p = rememberOrder(null, { phone: "1", email: "", address: addr() }, 1);
  p = removeAddress(p, p.addresses[0].id);
  assert.equal(p.addresses.length, 0);
});

test("parseProfile rejects malformed, foreign and expired data", () => {
  const good = rememberOrder(null, { phone: "1", email: "", address: addr() }, Date.now());
  assert.ok(parseProfile(JSON.stringify(good)));
  assert.equal(parseProfile(null), null);
  assert.equal(parseProfile("{not json"), null);
  assert.equal(parseProfile(JSON.stringify({ ...good, v: 2 })), null);
  assert.equal(parseProfile(JSON.stringify({ ...good, savedAt: Date.now() - PROFILE_TTL_MS - 1 })), null);
  // Junk entries are dropped, duplicates collapsed, oversize strings truncated.
  const messy = {
    ...good,
    addresses: [good.addresses[0], good.addresses[0], { fullName: "x" }, 42, { ...good.addresses[0], id: "z", line1: "y".repeat(5000) }],
  };
  const parsed = parseProfile(JSON.stringify(messy))!;
  assert.equal(parsed.addresses.length, 2);
  assert.ok(parsed.addresses.every((a) => a.line1.length <= 300));
});

test("addressKey ignores case and extra spaces", () => {
  assert.equal(addressKey(addr()), addressKey(addr({ fullName: "ALI  khan", city: " Lahore " })));
});
