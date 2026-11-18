/**
 * P0 integration tests against the LOCAL Firestore emulator only (never production):
 * homepage-section publish (add/edit/reorder/delete, createdAt + image URLs + ids kept,
 * stale/conflicting drafts write nothing), logo-safe theme writes, Clone Store theme copy,
 * per-store newsletter subscriptions, popup-only saves (Popups & Modals page).
 *
 * Run (emulator must be running, e.g. `firebase emulators:start --only firestore --project demo-p0`):
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8086 npx tsx --require ./scripts/stub-server-only.cjs --test scripts/test-p0-emulator.ts
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";

const host = process.env.FIRESTORE_EMULATOR_HOST;
if (!host || !/^(127\.0\.0\.1|localhost):\d+$/.test(host)) {
  console.error("REFUSING TO RUN: set FIRESTORE_EMULATOR_HOST to a local emulator (127.0.0.1:<port>). This test writes data.");
  process.exit(1);
}

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";
import { publishHomepageSections } from "../src/lib/theme/homepage-publish";
import { stripEmptyObjects, withoutMerchantAssets, themeConfigForClone } from "../src/lib/theme/theme-safety";
import { resolveNewsletterDocId } from "../src/lib/newsletter/subscriber-id";
import { applyPopupOperation } from "../src/lib/theme/theme-popup";
import { THEME_PRESETS } from "../src/lib/theme/theme-presets";
import type { HomepageSection } from "../src/types/homepage-section";

const PROJECT = "demo-p0"; // "demo-" projects can only ever talk to emulators
let db: Firestore;
const run = Date.now().toString(36);

before(() => {
  if (!getApps().length) initializeApp({ projectId: PROJECT });
  db = getFirestore();
});

const sectionsCol = (storeId: string) => db.collection("stores").doc(storeId).collection("homepageSections");
const CREATED = Timestamp.fromMillis(1_600_000_000_000);

async function seedSections(storeId: string) {
  const items = ["a", "b", "c"].map((id, i) => ({
    id,
    data: {
      type: "hero",
      title: `Section ${id}`,
      order: i,
      isActive: true,
      config: { image: `https://res.cloudinary.com/demo/${id}.jpg`, heading: `H-${id}` },
      createdAt: CREATED,
      updatedAt: Timestamp.fromMillis(1_700_000_000_000),
      customMeta: `keep-${id}`,
    },
  }));
  for (const s of items) await sectionsCol(storeId).doc(s.id).set(s.data);
}

async function liveAsDraft(storeId: string): Promise<{ draft: HomepageSection[]; baseline: Record<string, number> }> {
  const snap = await sectionsCol(storeId).get();
  const draft = snap.docs.map((d) => {
    const x = d.data();
    return { id: d.id, type: x.type, title: x.title, order: x.order, isActive: x.isActive, config: x.config } as HomepageSection;
  });
  const baseline = Object.fromEntries(snap.docs.map((d) => [d.id, (d.data().updatedAt as Timestamp).toMillis()]));
  return { draft, baseline };
}

test("publish: add + edit + reorder + delete - ids, createdAt, images and extra fields kept", async () => {
  const store = `s-${run}-1`;
  await seedSections(store);
  const { draft, baseline } = await liveAsDraft(store);
  const edited = draft
    .filter((s) => s.id !== "b") // delete b
    .map((s) => (s.id === "a" ? { ...s, title: "Edited A", order: 5 } : s)) // edit + reorder a
    .concat([{ id: "new1", type: "hero", title: "New", order: 1, isActive: true, config: { image: "https://res.cloudinary.com/demo/new.jpg" } } as HomepageSection]);
  const res = await publishHomepageSections(db, store, { draft: edited, baseline });
  assert.equal(res.ok, true);
  assert.equal(res.deleted, 1);

  const docs = Object.fromEntries((await sectionsCol(store).get()).docs.map((d) => [d.id, d.data()]));
  assert.deepEqual(Object.keys(docs).sort(), ["a", "c", "new1"]);
  assert.equal(docs.a.title, "Edited A");
  assert.equal(docs.a.order, 5);
  assert.equal((docs.a.createdAt as Timestamp).toMillis(), CREATED.toMillis(), "createdAt preserved");
  assert.equal(docs.a.customMeta, "keep-a", "unknown fields preserved");
  assert.equal(docs.a.config.image, "https://res.cloudinary.com/demo/a.jpg");
  assert.equal((docs.c.updatedAt as Timestamp).toMillis(), 1_700_000_000_000, "untouched section not rewritten");
  assert.ok(docs.new1.createdAt instanceof Timestamp);
  assert.deepEqual(Object.keys(res.baseline).sort(), ["a", "c", "new1"]);
});

test("publish: edit made in the old editor after the copy -> conflict, NOTHING written", async () => {
  const store = `s-${run}-2`;
  await seedSections(store);
  const { draft, baseline } = await liveAsDraft(store);
  await sectionsCol(store).doc("b").update({ title: "Changed via old route", updatedAt: Timestamp.fromMillis(1_800_000_000_000) });
  const res = await publishHomepageSections(db, store, { draft: draft.map((s) => ({ ...s, title: s.title + "!" })), baseline });
  assert.equal(res.ok, false);
  assert.deepEqual(res.conflicts.map((c) => c.kind), ["changed-elsewhere"]);
  const docs = Object.fromEntries((await sectionsCol(store).get()).docs.map((d) => [d.id, d.data()]));
  assert.equal(docs.a.title, "Section a");
  assert.equal(docs.b.title, "Changed via old route");
});

test("publish: forced publish after old-route add never deletes the section added elsewhere", async () => {
  const store = `s-${run}-3`;
  await seedSections(store);
  const { draft, baseline } = await liveAsDraft(store);
  await sectionsCol(store).doc("x").set({ type: "hero", title: "Added elsewhere", order: 9, isActive: true, config: {}, updatedAt: Timestamp.now() });
  const res = await publishHomepageSections(db, store, { draft: draft.filter((s) => s.id !== "c"), baseline, force: true });
  assert.equal(res.ok, true);
  const ids = (await sectionsCol(store).get()).docs.map((d) => d.id).sort();
  assert.deepEqual(ids, ["a", "b", "x"]);
});

test("publish: empty/stale draft without baseline can't erase live (even forced)", async () => {
  const store = `s-${run}-4`;
  await seedSections(store);
  for (const force of [false, true]) {
    const res = await publishHomepageSections(db, store, { draft: [], baseline: null, draftUpdatedAt: 1_000, force });
    assert.equal(res.ok, false);
    assert.equal(res.conflicts[0].kind, "stale-draft");
  }
  assert.equal((await sectionsCol(store).get()).size, 3);
});

test("publish: draft identical to live (only colors/logos changed) -> sections untouched", async () => {
  const store = `s-${run}-5`;
  await seedSections(store);
  const { draft } = await liveAsDraft(store);
  const before = (await sectionsCol(store).get()).docs.map((d) => [d.id, d.data().updatedAt.toMillis()]);
  const res = await publishHomepageSections(db, store, { draft, baseline: null });
  assert.equal(res.ok, true);
  assert.equal(res.upserted + res.deleted, 0);
  const after = (await sectionsCol(store).get()).docs.map((d) => [d.id, d.data().updatedAt.toMillis()]);
  assert.deepEqual(after, before);
});

test("logos: OLD behaviour reproduced (logos:{} wipes), NEW write keeps logos", async () => {
  const ref = db.doc(`stores/s-${run}-6/themeSettings/draft`);
  const logos = { logoLight: "https://res.cloudinary.com/demo/logo.png", favicon: "https://res.cloudinary.com/demo/fav.png" };
  await ref.set({ presetId: "premium-luxury", logos });
  await ref.set({ presetId: "modern-minimal", logos: {} }, { merge: true });
  assert.deepEqual((await ref.get()).data()!.logos, {}, "the bug: an empty map replaces the stored map");

  await ref.set({ presetId: "premium-luxury", logos });
  for (const preset of Object.values(THEME_PRESETS)) {
    // Exactly what saveDraftThemeConfig now writes when the Theme Catalog applies a preset.
    await ref.set({ ...stripEmptyObjects(withoutMerchantAssets(preset)), updatedAt: Date.now() }, { merge: true });
    assert.deepEqual((await ref.get()).data()!.logos, logos, preset.presetId);
  }
  // Even a raw config with logos:{} no longer wipes once it goes through stripEmptyObjects.
  await ref.set({ ...stripEmptyObjects({ logos: {} }), updatedAt: Date.now() }, { merge: true });
  assert.deepEqual((await ref.get()).data()!.logos, logos);
});

test("clone: theme copied to the new store only; no logos/staging; source untouched", async () => {
  const src = db.collection("stores").doc(`src-${run}`);
  const dst = db.collection("stores").doc(`dst-${run}`);
  const active = {
    presetId: "premium-luxury",
    colors: { primary: "#123456" },
    logos: { logoLight: "https://res.cloudinary.com/demo/src.png" },
    footer: { footerLogo: "https://res.cloudinary.com/demo/srcf.png", showNewsletter: true },
    homepageSections: [{ id: "a" }],
    homepageSectionsBaseline: { a: 1 },
    updatedAt: 1,
  };
  await src.collection("themeSettings").doc("active").set(active);
  await src.collection("customers").doc("c1").set({ email: "c@x.com" });
  await src.collection("orders").doc("o1").set({ total: 10 });
  await src.collection("siteSettings").doc("payment").set({ secret: "s" });

  // Exactly what cloneStore writes for each existing themeSettings doc.
  for (const docId of ["active", "draft"]) {
    const snap = await src.collection("themeSettings").doc(docId).get();
    if (!snap.exists) continue;
    await dst.collection("themeSettings").doc(docId).set({ ...themeConfigForClone(snap.data()!), updatedAt: 2 });
  }
  const copied = (await dst.collection("themeSettings").doc("active").get()).data()!;
  assert.deepEqual(copied, { presetId: "premium-luxury", colors: { primary: "#123456" }, footer: { showNewsletter: true }, updatedAt: 2 });
  assert.equal((await dst.collection("themeSettings").doc("draft").get()).exists, false);
  for (const c of ["customers", "orders", "siteSettings"]) assert.equal((await dst.collection(c).get()).size, 0, c);
  assert.deepEqual((await src.collection("themeSettings").doc("active").get()).data(), active, "source unchanged");
});

test("newsletter: same email on two stores keeps both; legacy doc preserved", async () => {
  const col = db.collection(`newsletterSubscribers_${run}`);
  const email = "ali@example.com";
  await col.doc(email).set({ email, storeId: "store1", subscribedAt: 1 }); // existing legacy subscription

  async function subscribe(storeId: string | null) {
    // Same steps as subscribeToNewsletter().
    const legacy = await col.doc(email).get();
    const id = resolveNewsletterDocId({ email, storeId, legacyDocExists: legacy.exists, legacyDocStoreId: legacy.exists ? legacy.data()?.storeId ?? null : undefined });
    await col.doc(id).set({ email, ...(storeId ? { storeId } : {}), subscribedAt: Date.now() }, { merge: true });
  }
  await subscribe("store2");
  await subscribe("store1"); // re-subscribe on the original store: reuses the legacy doc
  await subscribe(null);

  const count = async (storeId: string) => (await col.where("storeId", "==", storeId).count().get()).data().count;
  assert.equal(await count("store1"), 1);
  assert.equal(await count("store2"), 1);
  assert.equal((await col.doc(email).get()).data()!.storeId, "store1", "legacy doc still belongs to store1");
  assert.equal((await col.get()).size, 3);
});

async function seedTheme(storeId: string) {
  const col = db.collection("stores").doc(storeId).collection("themeSettings");
  const active = { presetId: "premium-luxury", colors: { primary: "#000000" }, popup: { enabled: false, title: "Live popup" }, logos: { logoLight: "https://res.cloudinary.com/demo/l.png" }, updatedAt: 1 };
  // The merchant's NEWER unpublished Customizer work, saved after the Popups page was opened.
  const draft = {
    presetId: "premium-luxury",
    colors: { primary: "#ff0000" },
    popup: { enabled: false, title: "Live popup" },
    homepageSections: [{ id: "a", title: "Draft A" }],
    homepageSectionsBaseline: { a: 5 },
    updatedAt: 2,
  };
  await col.doc("active").set(active);
  await col.doc("draft").set(draft);
  return { col, active, draft };
}

test("popups: Save Draft changes only the popup - newer Customizer draft edits survive", async () => {
  const { col, draft } = await seedTheme(`pop-${run}-1`);
  await applyPopupOperation(db, `pop-${run}-1`, "save-draft", { enabled: true, title: "Sale", imageUrl: undefined, delaySeconds: 5 });
  const after = (await col.doc("draft").get()).data()!;
  assert.deepEqual(after.popup, { enabled: true, title: "Sale", delaySeconds: 5 });
  assert.deepEqual(after.colors, draft.colors, "unpublished colour kept");
  assert.deepEqual(after.homepageSections, draft.homepageSections, "section copy kept");
  assert.deepEqual(after.homepageSectionsBaseline, draft.homepageSectionsBaseline);
  assert.equal((await col.doc("active").get()).data()!.popup.title, "Live popup", "live untouched");
});

test("popups: Publish puts ONLY the popup live; other draft changes stay unpublished", async () => {
  const { col, active, draft } = await seedTheme(`pop-${run}-2`);
  await applyPopupOperation(db, `pop-${run}-2`, "publish", { enabled: true, title: "Live sale" });
  const live = (await col.doc("active").get()).data()!;
  assert.deepEqual(live.popup, { enabled: true, title: "Live sale" });
  assert.deepEqual(live.colors, active.colors, "draft colour NOT published");
  assert.deepEqual(live.logos, active.logos, "logos kept");
  assert.equal("homepageSections" in live, false);
  const d = (await col.doc("draft").get()).data()!;
  assert.deepEqual(d.popup, { enabled: true, title: "Live sale" });
  assert.deepEqual(d.colors, draft.colors);
});

test("popups: Reset restores only the popup; removed fields really go away", async () => {
  const { col, draft } = await seedTheme(`pop-${run}-3`);
  await applyPopupOperation(db, `pop-${run}-3`, "save-draft", { enabled: true, title: "Tmp", buttonText: "Go" });
  const res = await applyPopupOperation(db, `pop-${run}-3`, "reset-draft");
  assert.deepEqual(res.popup, { enabled: false, title: "Live popup" });
  const d = (await col.doc("draft").get()).data()!;
  assert.deepEqual(d.popup, { enabled: false, title: "Live popup" }, "no leftover buttonText");
  assert.deepEqual(d.colors, draft.colors);
  assert.deepEqual(d.homepageSections, draft.homepageSections);
});

test("popups: store without a draft - draft starts from the live theme, not a partial doc", async () => {
  const storeId = `pop-${run}-4`;
  const col = db.collection("stores").doc(storeId).collection("themeSettings");
  await col.doc("active").set({ presetId: "premium-luxury", colors: { primary: "#111111" }, updatedAt: 1 });
  await applyPopupOperation(db, storeId, "save-draft", { enabled: true });
  const d = (await col.doc("draft").get()).data()!;
  assert.equal(d.presetId, "premium-luxury");
  assert.deepEqual(d.colors, { primary: "#111111" });
  assert.deepEqual(d.popup, { enabled: true });
});
