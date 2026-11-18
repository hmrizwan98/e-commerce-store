/**
 * P0 data-safety rules (pure; no Firestore, no browser):
 * - Customizer homepage-section publish planning (non-destructive, conflict detection)
 * - theme writes never wipe logos with an empty map; presets never carry merchant assets
 * - Clone Store theme copy never carries brand assets / section staging
 * - newsletter subscriber ids are per store
 * Run: npx tsx --test scripts/test-p0-safety.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { planSectionPublish, baselineFromLive, sameSectionContent, type LiveSectionMeta } from "../src/lib/theme/homepage-sections-sync";
import { stripEmptyObjects, withoutMerchantAssets, withoutSectionStaging, themeConfigForClone } from "../src/lib/theme/theme-safety";
import { THEME_PRESETS } from "../src/lib/theme/theme-presets";
import { normalizeNewsletterEmail, resolveNewsletterDocId, storeNewsletterDocId } from "../src/lib/newsletter/subscriber-id";
import type { HomepageSection } from "../src/types/homepage-section";

const T0 = 1_700_000_000_000;
const sec = (id: string, order: number, extra: Partial<LiveSectionMeta> = {}): LiveSectionMeta => ({
  id,
  type: "hero" as HomepageSection["type"],
  title: `Section ${id}`,
  order,
  isActive: true,
  config: { image: `https://cdn/${id}.jpg` } as HomepageSection["config"],
  updatedAt: T0,
  ...extra,
});
const live = [sec("a", 0), sec("b", 1), sec("c", 2)];
const baseline = baselineFromLive(live);

test("sections: no change -> nothing written or deleted", () => {
  const plan = planSectionPublish({ live, draft: live, baseline });
  assert.deepEqual([plan.conflicts, plan.upserts, plan.deletes], [[], [], []]);
  assert.deepEqual(plan.unchanged.sort(), ["a", "b", "c"]);
});

test("sections: edit one -> only that one upserted, same id", () => {
  const draft = live.map((s) => (s.id === "b" ? { ...s, title: "New title" } : s));
  const plan = planSectionPublish({ live, draft, baseline });
  assert.deepEqual(plan.upserts.map((s) => s.id), ["b"]);
  assert.deepEqual(plan.deletes, []);
});

test("sections: reorder -> only moved sections upserted, ids kept", () => {
  const draft = [{ ...live[2], order: 0 }, { ...live[0], order: 1 }, { ...live[1], order: 2 }];
  const plan = planSectionPublish({ live, draft, baseline });
  assert.deepEqual(plan.upserts.map((s) => s.id).sort(), ["a", "b", "c"]);
  assert.deepEqual(plan.deletes, []);
});

test("sections: add -> new id upserted; delete -> only the removed one", () => {
  const draft = [live[0], live[2], sec("new1", 3)];
  const plan = planSectionPublish({ live, draft, baseline });
  assert.deepEqual(plan.upserts.map((s) => s.id), ["new1"]);
  assert.deepEqual(plan.deletes, ["b"]);
});

test("sections: change made elsewhere after the copy -> conflict, nothing to apply blindly", () => {
  const liveNow = live.map((s) => (s.id === "a" ? { ...s, title: "Edited in old editor", updatedAt: T0 + 5000 } : s));
  const plan = planSectionPublish({ live: liveNow, draft: live, baseline });
  assert.deepEqual(plan.conflicts, [{ kind: "changed-elsewhere", id: "a", title: "Edited in old editor" }]);
});

test("sections: section added elsewhere is never deleted by a publish", () => {
  const liveNow = [...live, sec("x", 9, { updatedAt: T0 + 1 })];
  const plan = planSectionPublish({ live: liveNow, draft: live, baseline });
  assert.equal(plan.conflicts[0]?.kind, "added-elsewhere");
  assert.ok(!plan.deletes.includes("x"));
});

test("sections: section deleted elsewhere is not resurrected", () => {
  const liveNow = live.filter((s) => s.id !== "c");
  const plan = planSectionPublish({ live: liveNow, draft: live, baseline });
  assert.equal(plan.conflicts[0]?.kind, "deleted-elsewhere");
  assert.ok(!plan.upserts.some((s) => s.id === "c"));
});

test("sections: EMPTY draft without baseline cannot erase live sections", () => {
  const plan = planSectionPublish({ live, draft: [], baseline: null, draftUpdatedAt: T0 - 1 });
  assert.equal(plan.conflicts[0]?.kind, "stale-draft");
  assert.deepEqual(plan.deletes, []);
  const noTimestamp = planSectionPublish({ live, draft: [], baseline: null });
  assert.equal(noTimestamp.conflicts[0]?.kind, "stale-draft");
  assert.deepEqual(noTimestamp.deletes, []);
});

test("sections: stale draft (older than live) without baseline -> stale-draft, no writes", () => {
  const liveNow = live.map((s) => ({ ...s, updatedAt: T0 + 10_000 }));
  const draft = live.map((s) => ({ ...s, title: s.title + " (old)" }));
  const plan = planSectionPublish({ live: liveNow, draft, baseline: null, draftUpdatedAt: T0 });
  assert.equal(plan.conflicts[0]?.kind, "stale-draft");
  assert.deepEqual([plan.upserts, plan.deletes], [[], []]);
});

test("sections: legacy draft identical to live -> no-op (Glamix/Zyvora today)", () => {
  const plan = planSectionPublish({ live, draft: live.map((s) => ({ ...s, updatedAt: undefined })), baseline: null });
  assert.deepEqual([plan.conflicts, plan.upserts, plan.deletes], [[], [], []]);
});

test("sections: content comparison ignores key order and keeps image URLs", () => {
  const a = sec("a", 0, { config: { image: "https://cdn/a.jpg", heading: "Hi" } as HomepageSection["config"] });
  const b = sec("a", 0, { config: { heading: "Hi", image: "https://cdn/a.jpg" } as HomepageSection["config"] });
  assert.ok(sameSectionContent(a, b));
  const plan = planSectionPublish({ live, draft: [{ ...live[0], title: "x" }, live[1], live[2]], baseline });
  assert.equal((plan.upserts[0].config as { image?: string }).image, "https://cdn/a.jpg");
});

test("logos: empty maps are dropped before a merge write (Firestore would replace the map)", () => {
  assert.deepEqual(stripEmptyObjects({ presetId: "x", logos: {}, header: { topBar: {} }, colors: { primary: "#000" } }), {
    presetId: "x",
    colors: { primary: "#000" },
  });
  assert.deepEqual(stripEmptyObjects({ list: [], n: 0, s: "" }), { list: [], n: 0, s: "" });
});

test("logos: every catalog preset is applied without logos / footer logo", () => {
  for (const preset of Object.values(THEME_PRESETS)) {
    const applied = withoutMerchantAssets(preset) as unknown as Record<string, unknown> & { footer?: Record<string, unknown> };
    assert.equal("logos" in applied, false, preset.presetId);
    assert.equal(applied.footer && "footerLogo" in applied.footer, false, preset.presetId);
    assert.equal(applied.presetId, preset.presetId);
  }
});

test("logos: the Theme Catalog applies presets through withoutMerchantAssets", () => {
  const src = fs.readFileSync("src/app/(admin)/admin/(protected)/appearance/themes/ThemesSelectorClient.tsx", "utf8");
  assert.match(src, /saveThemeDraftAction\(withoutMerchantAssets\(preset\)\)/);
  assert.doesNotMatch(src, /saveThemeDraftAction\(preset\)/);
});

test("theme publish never carries the section staging copy", () => {
  const out = withoutSectionStaging({ presetId: "x", homepageSections: [], homepageSectionsBaseline: { a: 1 } });
  assert.deepEqual(out, { presetId: "x" });
});

test("clone: theme copied without logos, footer logo, section staging or timestamps", () => {
  const raw = {
    presetId: "premium-luxury",
    colors: { primary: "#111" },
    logos: { logoLight: "https://cdn/src-logo.png", favicon: "https://cdn/src-fav.png" },
    footer: { footerLogo: "https://cdn/src-footer.png", columns: 3 },
    homepageSections: [{ id: "a" }],
    homepageSectionsBaseline: { a: 1 },
    updatedAt: 123,
  };
  assert.deepEqual(themeConfigForClone(raw), { presetId: "premium-luxury", colors: { primary: "#111" }, footer: { columns: 3 } });
});

test("newsletter: same email on two stores -> two separate documents", () => {
  const e = normalizeNewsletterEmail("  Ali@Example.COM ")!;
  assert.equal(e, "ali@example.com");
  const s1 = resolveNewsletterDocId({ email: e, storeId: "store1", legacyDocExists: false });
  const s2 = resolveNewsletterDocId({ email: e, storeId: "store2", legacyDocExists: false });
  assert.notEqual(s1, s2);
  assert.equal(s1, storeNewsletterDocId("store1", e));
});

test("newsletter: existing email-keyed doc is reused by its own store, never taken over", () => {
  const e = "ali@example.com";
  assert.equal(resolveNewsletterDocId({ email: e, storeId: "store1", legacyDocExists: true, legacyDocStoreId: "store1" }), e);
  assert.equal(resolveNewsletterDocId({ email: e, storeId: "store2", legacyDocExists: true, legacyDocStoreId: "store1" }), "store2__ali@example.com");
  assert.equal(resolveNewsletterDocId({ email: e, storeId: "store2", legacyDocExists: true, legacyDocStoreId: null }), "store2__ali@example.com");
  assert.equal(resolveNewsletterDocId({ email: e, storeId: null, legacyDocExists: true, legacyDocStoreId: "store1" }), "platform__ali@example.com");
  assert.equal(resolveNewsletterDocId({ email: e, storeId: null, legacyDocExists: false }), e);
});

test("newsletter: invalid emails rejected (incl. '/', which breaks document paths)", () => {
  for (const bad of ["", "abc", "a/b@x.com", `${"a".repeat(260)}@x.com`]) assert.equal(normalizeNewsletterEmail(bad), null);
});

test("legacy editors are redirects (no hidden write path)", () => {
  for (const p of [
    "src/app/(admin)/admin/(protected)/homepage/page.tsx",
    "src/app/(admin)/admin/(protected)/appearance/homepage/page.tsx",
    "src/app/(admin)/admin/(protected)/theme/page.tsx",
  ]) {
    const src = fs.readFileSync(p, "utf8");
    assert.match(src, /redirect\("\/admin\/appearance\/customize"\)/, p);
    assert.equal(src.match(/^import /gm)?.length, 1, p); // only next/navigation - no editor UI or write actions
  }
});

test("onboarding logo step writes theme settings, not the legacy themes collection", () => {
  const src = fs.readFileSync("src/app/(admin)/admin/(protected)/onboarding/OnboardingWizard.tsx", "utf8");
  assert.match(src, /saveThemeLogosAction\(logoChanges\)/);
  assert.doesNotMatch(src, /updateTheme\(/);
});

test("popups page sends only popup fields (no whole-draft snapshot, no full publish/reset)", () => {
  const src = fs.readFileSync("src/app/(admin)/admin/(protected)/appearance/popups/PopupsBuilderClient.tsx", "utf8");
  assert.doesNotMatch(src, /saveThemeDraftAction|publishThemeAction|resetThemeDraftAction|\.\.\.draftTheme/);
  assert.match(src, /savePopupDraftAction\(popup\)/);
  assert.match(src, /publishPopupAction\(popup\)/);
  const page = fs.readFileSync("src/app/(admin)/admin/(protected)/appearance/popups/page.tsx", "utf8");
  assert.match(page, /<PopupsBuilderClient draftPopup=\{draftPopup\} \/>/);
});
