/**
 * Theme Customizer preview: link routing, announcement bar rules, editor update guards,
 * page sections. Pure - no Firestore, no browser.
 * Run: npx tsx --test scripts/test-editor-preview.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolvePreviewLink, storefrontOriginFromAdminHost } from "../src/lib/theme/preview-links";
import { decodeHtmlEntities, isThemeTopBarActive } from "../src/lib/theme/announcement";
import { draftPatchChanges, patchNeedsPreviewReload } from "../src/lib/theme/preview-reload";
import { activeSectionsInOrder, extraPageSections } from "../src/lib/theme/page-sections";
import { THEME_PRESETS } from "../src/lib/theme/theme-presets";
import type { SystemThemeConfig } from "../src/lib/theme/theme-types";
import type { HomepageSection } from "../src/types/homepage-section";

const ADMIN = "https://admin-glamix.webriiz.com";
const STORE = "https://glamix.webriiz.com";

test("preview: Home never opens the admin dashboard", () => {
  for (const href of ["/", "", "/home", `${ADMIN}/`, `${STORE}/`, "/store/glamix", "/store/glamix/"]) {
    const a = resolvePreviewLink(href || "/", ADMIN, STORE);
    assert.deepEqual(a, { kind: "surface", surface: "home" }, href);
  }
});

test("preview: product links open that product in the preview (any section)", () => {
  assert.deepEqual(resolvePreviewLink("/product/silk-trench-coat", ADMIN, STORE), {
    kind: "surface",
    surface: "product",
    productSlug: "silk-trench-coat",
  });
  assert.deepEqual(resolvePreviewLink(`${STORE}/product/demo-001?ref=best`, ADMIN, STORE), {
    kind: "surface",
    surface: "product",
    productSlug: "demo-001",
  });
  assert.deepEqual(resolvePreviewLink("/store/glamix/product/a%20b", ADMIN, STORE), { kind: "surface", surface: "product", productSlug: "a b" });
  assert.deepEqual(resolvePreviewLink("/collection?sort=price", ADMIN, STORE), { kind: "surface", surface: "collection" });
  assert.deepEqual(resolvePreviewLink("/cart", ADMIN, STORE), { kind: "surface", surface: "cart" });
});

test("preview: other storefront pages open on the PUBLIC storefront, never the admin host", () => {
  for (const [href, expected] of [
    ["/category/bags", `${STORE}/category/bags`],
    ["/brand/acme", `${STORE}/brand/acme`],
    ["/search?q=bag", `${STORE}/search?q=bag`],
    ["/about", `${STORE}/about`],
    ["/checkout", `${STORE}/checkout`],
    ["/page/privacy-policy#top", `${STORE}/page/privacy-policy#top`],
  ]) {
    assert.deepEqual(resolvePreviewLink(href, ADMIN, STORE), { kind: "storefront", url: expected }, href);
  }
});

test("preview: admin, super admin, API and script links are blocked; external links open separately", () => {
  for (const href of ["/admin", "/admin/orders", "/superadmin", "/api/admin/session", "javascript:alert(1)"]) {
    assert.deepEqual(resolvePreviewLink(href, ADMIN, STORE), { kind: "blocked" }, href);
  }
  assert.deepEqual(resolvePreviewLink("https://instagram.com/glamix", ADMIN, STORE), { kind: "external", url: "https://instagram.com/glamix" });
  for (const href of ["#reviews", "tel:+923001234567", "mailto:hi@x.com"]) {
    assert.deepEqual(resolvePreviewLink(href, ADMIN, STORE), { kind: "default" }, href);
  }
});

test("storefront origin from any tenant's admin host (platform, custom domain, localhost)", () => {
  assert.equal(storefrontOriginFromAdminHost("admin-glamix.webriiz.com", "https"), "https://glamix.webriiz.com");
  assert.equal(storefrontOriginFromAdminHost("admin-hafiz-traderz.webriiz.com", "https"), "https://hafiz-traderz.webriiz.com");
  assert.equal(storefrontOriginFromAdminHost("admin.mystore.pk", "https"), "https://mystore.pk");
  assert.equal(storefrontOriginFromAdminHost("admin-glamix.localhost:3200", "http"), "http://glamix.localhost:3200");
  assert.equal(storefrontOriginFromAdminHost("glamix.webriiz.com", "https"), null);
  assert.equal(storefrontOriginFromAdminHost(null, "https"), null);
});

test("announcement: the theme bar wins only when it is on and has something to show", () => {
  assert.equal(isThemeTopBarActive(undefined), false);
  assert.equal(isThemeTopBarActive({ enabled: false, text: "Sale" }), false);
  assert.equal(isThemeTopBarActive({ enabled: true, text: "   " }), false);
  assert.equal(isThemeTopBarActive({ enabled: true, text: "We Are Coming" }), true);
  assert.equal(isThemeTopBarActive({ enabled: true, phone: "0300" }), true);
});

test("announcement text: entities become readable text, normal text is untouched", () => {
  assert.equal(decodeHtmlEntities("Welcome to our store"), "Welcome to our store");
  assert.equal(decodeHtmlEntities("Tom &amp; Jerry"), "Tom & Jerry");
  assert.equal(decodeHtmlEntities("Free&nbsp;shipping &#10022; 50% off"), "Free shipping ✦ 50% off");
  assert.equal(decodeHtmlEntities("&lt;b&gt;bold&lt;/b&gt;"), "<b>bold</b>"); // still rendered as text, not HTML
  assert.equal(decodeHtmlEntities("&#x1F389; Eid sale"), "\u{1F389} Eid sale");
  assert.equal(decodeHtmlEntities("&unknown; stays"), "&unknown; stays");
  assert.equal(decodeHtmlEntities(undefined), "");
});

const preset = THEME_PRESETS["premium-luxury"] as SystemThemeConfig;

test("editor: re-sending identical values is a no-op (breaks update/re-render loops)", () => {
  const same = { header: { ...preset.header } };
  assert.equal(draftPatchChanges(preset, { ...preset, ...same }, same), false);
  const changed = { header: { ...preset.header, heightPx: 64 } };
  assert.equal(draftPatchChanges(preset, { ...preset, ...changed }, changed), true);
});

test("editor: chrome settings update the preview live; server-rendered ones need a soft refresh", () => {
  for (const patch of [{ header: { heightPx: 64 } }, { footer: {} }, { logos: {} }, { announcementBar: {} }, { popup: { enabled: true } }, { colors: {} }]) {
    assert.equal(patchNeedsPreviewReload(patch as never), false, Object.keys(patch)[0]);
  }
  for (const patch of [{ homepageSections: [] }, { collection: {} }, { productDetail: {} }, { cart: {} }, { productCard: { variant: "minimal" } }]) {
    assert.equal(patchNeedsPreviewReload(patch as never), true, Object.keys(patch)[0]);
  }
});

const sec = (id: string, order: number, isActive = true): HomepageSection =>
  ({ id, type: "featuredProducts", title: id, order, isActive, config: {} }) as HomepageSection;

test("page sections: draft order respected; added collection/product sections render, built-ins don't double", () => {
  assert.deepEqual(activeSectionsInOrder([sec("b", 2), sec("a", 1), sec("off", 0, false)]).map((s) => s.id), ["a", "b"]);
  const list = [sec("sec-col-promo", 0), sec("custom-2", 3), sec("sec-col-categories", 1), sec("custom-1", 2), sec("hidden", 4, false)];
  assert.deepEqual(extraPageSections(list).map((s) => s.id), ["custom-1", "custom-2"]);
  assert.deepEqual(extraPageSections(undefined), []);
});
