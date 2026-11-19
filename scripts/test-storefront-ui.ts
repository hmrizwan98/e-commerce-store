/**
 * Footer grouping, dynamic product filters, hero image display, product-page sections
 * (2026-11-19). Pure + source checks; no Firestore, no browser.
 * Run: npx tsx --require ./scripts/stub-server-only.cjs --test scripts/test-storefront-ui.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { groupFooterMenu, isCustomerCareLink } from "../src/lib/nav/footer-groups";
import { buildFilterFacets, categoriesWithProducts, facetLabel, applyClientFilters } from "../src/lib/filters/facets";
import { isPlaceholderImage, realImage } from "../src/lib/images/real-image";
import { productPageSections } from "../src/lib/theme/page-sections";
import { isSampleBanner } from "../src/lib/seed-content";

const read = (p: string) => fs.readFileSync(p, "utf8");
const code = (p: string) =>
  read(p)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`])\/\/[^\n]*/g, "$1");

// ------------------------------------------------------------------ 1. Footer
test("footer: the stores' flat footer menu becomes two tidy columns (not 6 empty headings)", () => {
  // Exactly the footer menu all three stores have today.
  const menu = [
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/pages/faq" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Refund Policy", href: "/refund" },
  ];
  const groups = groupFooterMenu(menu);
  assert.deepEqual(groups.map((g) => g.title), ["Shop", "Customer care"]);
  assert.deepEqual(groups[0].links.map((l) => l.name), ["About"]);
  assert.deepEqual(groups[1].links.map((l) => l.name), ["Contact", "FAQ", "Privacy Policy", "Terms & Conditions", "Refund Policy"]);
});

test("footer: items with sub-links keep their own column; empty/blank items skipped", () => {
  const groups = groupFooterMenu([
    { name: "Collections", href: "#", children: [{ name: "Watches", href: "/category/watches" }, { name: "", href: "/x" }] },
    { name: "Home", href: "/" },
    { name: "", href: "/nothing" },
  ]);
  assert.deepEqual(groups, [
    { title: "Shop", links: [{ name: "Home", href: "/" }] },
    { title: "Collections", links: [{ name: "Watches", href: "/category/watches" }] },
  ]);
  assert.equal(isCustomerCareLink("/order-tracking"), true);
  assert.equal(isCustomerCareLink("/collection"), false);
  assert.deepEqual(groupFooterMenu([]), []);
});

test("footer: uses store data only (no hardcoded language pill/store copy); classic footer grouped too", () => {
  const f = code("src/components/theme/variants/footers/MultiColumnFooter.tsx");
  assert.doesNotMatch(f, /English \(US\)|Discover modern essentials/);
  assert.match(f, /groupFooterMenu\(footerItems\)/);
  assert.match(f, /contactInfoRows\(storeContact\)/);
  assert.match(f, /showNewsletter/);
  assert.match(read("src/shared/Footer/Footer.tsx"), /groupFooterMenu\(footerItems\)/);
  assert.match(read("src/app/layout.tsx"), /storeContact=\{\{ storeAddress: general\.storeAddress, storeEmail: general\.storeEmail, storePhone: general\.storePhone \}\}/);
});

// ------------------------------------------------------------------ 2. Filters
const products = [
  { price: 999, colorFacets: ["gold"], sizeFacets: ["m"], categoryIds: ["c-grooming"], createdAt: 3 },
  { price: 150, colorFacets: ["White", "gold"], sizeFacets: ["xl", "s"], categoryIds: ["c-kitchen"], compareAtPrice: 200, createdAt: 2 },
  { price: 1050, categoryIds: ["c-grooming"], createdAt: 1 },
];

test("filters: options come from the store's products (no $, no demo colours/sizes/range)", () => {
  const f = buildFilterFacets(products);
  assert.deepEqual(f.colors, ["gold", "white"]);
  assert.deepEqual(f.sizes, ["s", "m", "xl"]);
  assert.deepEqual(f.priceRange, [150, 1050]);
  assert.deepEqual(f.categoryIds.sort(), ["c-grooming", "c-kitchen"]);
  assert.deepEqual(buildFilterFacets([]), { colors: [], sizes: [], priceRange: null, categoryIds: [] });
  assert.equal(buildFilterFacets([{ price: 500 }]).priceRange, null, "one price -> no range slider");
  assert.equal(facetLabel("sky blue"), "Sky Blue");
  assert.equal(facetLabel("xl"), "XL");
});

test("filters: categories without products are hidden", () => {
  const cats = [{ id: "c-grooming", name: "Grooming" }, { id: "c-mens", name: "Men's Fashion" }, { id: "c-kitchen", name: "Kitchen" }];
  assert.deepEqual(categoriesWithProducts(cats, buildFilterFacets(products)).map((c) => c.name), ["Grooming", "Kitchen"]);
  assert.deepEqual(categoriesWithProducts(cats, buildFilterFacets([])), []);
});

test("filters: homepage grid applies the same URL filters to its loaded products", () => {
  const base = { color: [] as string[], size: [] as string[], sale: false };
  assert.equal(applyClientFilters(products, { ...base, color: ["Gold"] }).length, 2);
  assert.equal(applyClientFilters(products, { ...base, size: ["xl"] }).length, 1);
  assert.deepEqual(applyClientFilters(products, { ...base, minPrice: 500 }).map((p) => p.price), [999, 1050]);
  assert.deepEqual(applyClientFilters(products, { ...base, sale: true }).map((p) => p.price), [150]);
  assert.deepEqual(applyClientFilters(products, { ...base, sort: "price-asc" }).map((p) => p.price), [150, 999, 1050]);
  assert.equal(applyClientFilters(products, base).length, 3);
});

test("filters: components use store currency + store options; nothing hardcoded", () => {
  const tab = code("src/components/TabFilters.tsx");
  assert.doesNotMatch(tab, /FILTER_COLORS|FILTER_SIZES|\}\$ - \$\{|^\s*\$\s*$/m);
  assert.match(tab, /formatMoney\(rangePrices\[0\]\)/);
  assert.match(tab, /\{hasPrice && renderTabsPriceRage\(\)\}/);
  const side = code("src/components/SidebarFilters.tsx");
  assert.doesNotMatch(side, /FILTER_COLORS|FILTER_SIZES|"Clothing"|"Footwear"|"All Categories"/);
  assert.match(read("src/components/collection/CollectionPageView.tsx"), /categoriesWithProducts\(allCategories, facets\)/);
  assert.match(read("src/app/search/page.tsx"), /categoriesWithProducts\(allCategories, facets\)/);
  const grid = read("src/components/SectionGridFeatureItems.tsx");
  assert.match(grid, /applyClientFilters\(/);
  assert.match(grid, /data\.some\(\(p\) => p\.categoryIds\?\.includes\(c\.id\)\)/);
  assert.match(read("src/components/HeaderFilterSection.tsx"), /<TabFilters colors=\{filterColors\} sizes=\{filterSizes\} priceRange=\{filterPriceRange\} \/>/);
});

// ------------------------------------------------------------------ 3. Hero
test("hero: whole image by default (no cropping), no forced rounded corners, optional controls", () => {
  const hero = read("src/components/theme/variants/heroes/FullWidthImageHero.tsx");
  assert.match(hero, /const fit = banner\?\.imageFit \?\? "full";/);
  assert.match(hero, /const rounded = banner\?\.rounded === true;/);
  assert.match(hero, /style=\{\{ width: "100%", height: "auto" \}\}/);
  assert.match(hero, /\[grid-area:1\/1\]/);
  assert.doesNotMatch(code("src/components/theme/variants/heroes/FullWidthImageHero.tsx"), /className=\{`relative w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-sm border/);
  const insp = read("src/app/(admin)/admin/(protected)/appearance/customize/inspectors/HeroSectionInspector.tsx");
  assert.match(insp, /Show the whole image \(no cropping\)/);
  assert.match(insp, /updateBanner\(\{ rounded: e\.target\.checked \}\)/);
  assert.match(read("src/types/theme.ts"), /imageFit\?: "full" \| "cover";/);
});

// ------------------------------------------------------------------ 4. Product page sections
test("placeholder image = no image (sample promos show text, not an empty frame); flagged as sample", () => {
  assert.equal(isPlaceholderImage("/images/placeholder.png"), true);
  assert.equal(isPlaceholderImage("https://res.cloudinary.com/x/images/placeholder.png"), true);
  assert.equal(realImage("/images/placeholder.png"), undefined);
  assert.equal(realImage("https://res.cloudinary.com/x/promo.jpg"), "https://res.cloudinary.com/x/promo.jpg");
  assert.equal(isSampleBanner({ imageDesktop: "/images/placeholder.png" }), true);
  assert.match(read("src/lib/firebase/repositories/storefront-queries.ts"), /imageDesktop: realImage\(b\.imageDesktop\) \?\? ""/);
  for (const f of ["src/components/SectionPromo1.tsx", "src/components/SectionPromo2.tsx"]) assert.doesNotMatch(read(f), /<Logo /, f);
});

test("product page sections: built-in promo + added sections in Customizer order; related/reviews stay in page", () => {
  // Store with no saved sections (all 3 today): just the built-in promo, slot 2, on by default.
  assert.deepEqual(productPageSections(undefined).map((s) => [s.id, s.config.variant]), [["sec-prod-promo", 2]]);
  assert.deepEqual(productPageSections({ showBottomPromo: false }), []);
  const sections = [
    { id: "sec-prod-related", type: "featuredProducts", title: "Customers Also Purchased", order: 0, isActive: true, config: {} },
    { id: "added-1", type: "testimonials", title: "Reviews strip", order: 1, isActive: true, config: {} },
    { id: "sec-prod-promo", type: "promo", title: "Special Offer Banner", order: 2, isActive: true, config: { heading: "Eid sale", variant: 3 } },
    { id: "added-2", type: "newsletter", title: "Hidden", order: 3, isActive: false, config: {} },
  ] as any;
  const out = productPageSections({ sections, showBottomPromo: true });
  assert.deepEqual(out.map((s) => s.id), ["added-1", "sec-prod-promo"], "order kept, related excluded, inactive hidden");
  assert.deepEqual(out[1].config, { variant: 3, heading: "Eid sale" }, "merchant edits used");
  assert.deepEqual(productPageSections({ sections, showBottomPromo: false }).map((s) => s.id), ["added-1"]);
});

test("Customizer: product/collection page sections open an inspector and save to their own list", () => {
  const shell = read("src/app/(admin)/admin/(protected)/appearance/customize/CustomizeShell.tsx");
  assert.match(shell, /if \(productSections\.some\(\(s\) => s\.id === selectedSectionId\)\) return "product";/);
  assert.match(shell, /updateProductSections\(productSections\.map\(\(s\) => \(s\.id === selectedSectionId \? \{ \.\.\.s, \.\.\.patch \} : s\)\)\);/);
  assert.match(shell, /const NON_EDITABLE_PAGE_SECTIONS = \["sec-prod-related", "sec-col-promo", "sec-col-categories"\];/);
  assert.match(read("src/app/product/[slug]/page.tsx"), /productPageSections\(theme\.productDetail\)/);
});
