/**
 * P2 - real storefront content (pure rules + source checks; no Firestore, no browser).
 * Run: npx tsx --require ./scripts/stub-server-only.cjs --test scripts/test-p2.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { filterNavItems } from "../src/lib/nav/filter-nav";
import { isPublicBlogPost, blogParagraphs } from "../src/lib/blog/visibility";
import { isSeedTestimonial, isPublicTestimonial, SEED_TESTIMONIAL_KEYS } from "../src/lib/testimonials/seed";
import { isSampleBanner, isSeedFaq } from "../src/lib/seed-content";
import { isBannerLive } from "../src/lib/banners/schedule";
import { contactInfoRows } from "../src/lib/contact/contact-info";
import { activeSocialLinks } from "../src/components/FooterSocials";
import { safeQueryCacheKey } from "../src/lib/firebase/repositories/safe-query";
import { THEME_PRESETS } from "../src/lib/themes/theme-presets";

const read = (p: string) => fs.readFileSync(p, "utf8");
/** Source without comments - the fixes leave explanatory comments naming what was removed. */
const code = (p: string) =>
  read(p)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`])\/\/[^\n]*/g, "$1");
/** grep that treats "no match" (exit 1) as an empty result. */
const grep = (args: string[]) => {
  const r = spawnSync("grep", args, { encoding: "utf8" });
  if (r.status !== 0 && r.status !== 1) throw new Error(r.stderr);
  return r.stdout.trim();
};
const exists = (p: string) => fs.existsSync(p);
const NOW = Date.UTC(2026, 10, 17);

// ---------------------------------------------------------------- A. About / navigation
test("nav: /about links hidden (incl. children, trailing slash, query/hash); others kept", () => {
  const items = [
    { id: "1", name: "Home", href: "/" },
    { id: "2", name: "About", href: "/about" },
    { id: "3", name: "Shop", href: "/search", children: [{ id: "4", name: "About us", href: "/about/" }, { id: "5", name: "New", href: "/collection" }] },
    { id: "6", name: "About#team", href: "/about#team" },
    { id: "7", name: "About page", href: "/about?x=1" },
    { id: "8", name: "Aboutness", href: "/about-us" },
  ];
  const out = filterNavItems(items, ["/about"]);
  assert.deepEqual(out.map((i) => i.href), ["/", "/search", "/about-us"]);
  assert.deepEqual(out[1].children!.map((c) => c.href), ["/collection"]);
  assert.equal(filterNavItems(items, []), items, "nothing hidden -> same list");
});

test("about: page comes from Pages (slug about) and 404s without it; menus filtered on storefront + preview only", () => {
  const about = read("src/app/about/page.tsx");
  assert.match(about, /getPageBySlug\("about"\)/);
  assert.match(about, /notFound\(\)/);
  for (const gone of ["src/app/about/SectionFounder.tsx", "src/app/about/SectionStatistic.tsx", "src/app/about/SectionHero.tsx"]) assert.equal(exists(gone), false, gone);
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /const hiddenNavHrefs = aboutPage \? \[\] : \["\/about"\]/);
  assert.match(read("src/hooks/useMenu.ts"), /filterNavItems\(items, hidden\)/);
  const cp = read("src/app/ClientProviders.tsx");
  assert.match(cp, /hiddenHrefs=\{isStorefrontPreview \? hiddenNavHrefs : undefined\}/, "admin pages unfiltered, Customizer preview filtered");
});

// ---------------------------------------------------------------- B. Blog
test("blog: only Active posts whose published date has arrived", () => {
  assert.equal(isPublicBlogPost({ isActive: true, publishedAt: NOW - 1 }, NOW), true);
  assert.equal(isPublicBlogPost({ isActive: true, publishedAt: NOW + 86_400_000 }, NOW), false, "future-dated");
  assert.equal(isPublicBlogPost({ isActive: false, publishedAt: NOW - 1 }, NOW), false, "draft/inactive");
  assert.equal(isPublicBlogPost(null, NOW), false);
});

test("blog: plain-text body -> paragraphs, never HTML", () => {
  assert.deepEqual(blogParagraphs("One\r\n\r\nTwo\nstill two\n\n\n<script>x</script>"), ["One", "Two\nstill two", "<script>x</script>"]);
  assert.deepEqual(blogParagraphs(undefined), []);
  const page = read("src/app/blog/[slug]/page.tsx");
  assert.doesNotMatch(page, /dangerouslySetInnerHTML/);
  assert.match(page, /notFound\(\)/);
  assert.match(page, /generateMetadata/);
  for (const card of ["src/app/blog/Card12.tsx", "src/app/blog/Card13.tsx"]) {
    const s = code(card);
    assert.doesNotMatch(s, /fakeData|blog-single/, card);
    assert.match(s, /`\/blog\/\$\{encodeURIComponent\(post\.slug\)\}`/, card);
  }
  assert.match(read("src/app/blog/SectionMagazine5.tsx"), /if \(!hasRealPosts \|\| postList\.length === 0\) return null;/);
});

// ---------------------------------------------------------------- C. Customer accounts
test("customer accounts: placeholder pages, redirects, guest menu without fake identity", () => {
  for (const r of ["login", "signup", "forgot-pass"]) assert.match(read(`src/app/${r}/page.tsx`), /<CustomerAccountsUnavailable/, r);
  for (const r of ["account", "account-billing", "account-password"]) assert.match(read(`src/app/(accounts)/${r}/page.tsx`), /redirect\("\/account-order"\)/, r);
  const menu = code("src/components/Header/AvatarDropdown.tsx");
  assert.doesNotMatch(menu, /Eden Smith|Los Angeles|Log out|"\/account"/);
  assert.match(menu, /"\/order-tracking"/);
  assert.doesNotMatch(code("src/app/(accounts)/layout.tsx"), /Enrico Cole|ciseco@gmail\.com/);
});

// ---------------------------------------------------------------- D. Testimonials
test("testimonials: unchanged installer samples detected exactly; edited ones are real", () => {
  const jordan = { clientName: "Jordan Smith", content: "Great products and excellent customer service.", isActive: true };
  assert.equal(isSeedTestimonial(jordan), true);
  assert.equal(isSeedTestimonial({ ...jordan, clientName: "  Jordan Smith " }), true, "whitespace-insensitive");
  assert.equal(isSeedTestimonial({ ...jordan, content: "Great products and excellent customer service!" }), false, "edited text");
  assert.equal(isSeedTestimonial({ ...jordan, clientName: "Ayesha Khan" }), false, "edited name");
  assert.equal(isPublicTestimonial(jordan), false);
  assert.equal(isPublicTestimonial({ clientName: "Ayesha Khan", content: "Fast delivery", isActive: true }), true);
  assert.equal(isPublicTestimonial({ clientName: "Ayesha Khan", content: "Fast delivery", isActive: false }), false);
  // Every preset's seed is covered.
  const seeds = Object.values(THEME_PRESETS).flatMap((p) => p.testimonials);
  assert.ok(seeds.length >= 7);
  for (const t of seeds) assert.equal(isSeedTestimonial(t), true, t.clientName);
  assert.equal(SEED_TESTIMONIAL_KEYS.size, new Set(seeds.map((t) => `${t.clientName}|${t.content}`)).size);
  // Admin label + no demo reviewers on the storefront.
  assert.match(read("src/app/(admin)/admin/(protected)/testimonials/TestimonialsList.tsx"), /Sample – hidden on storefront/);
  const say = code("src/components/SectionClientSay/SectionClientSay.tsx");
  assert.doesNotMatch(say, /DEMO_DATA|clientSay[1-6M]|rating \?\? 5/);
  assert.match(say, /if \(!testimonials\.length\) return null;/);
  assert.equal(exists("src/components/SectionClientSay/data.ts"), false);
});

// ---------------------------------------------------------------- Sample banners / FAQs (labelled, NOT hidden)
test("samples: stock-photo banners + unchanged seed FAQs are identified for Admin labels only", () => {
  assert.equal(isSampleBanner({ imageDesktop: "https://images.unsplash.com/photo-1?w=1" }), true);
  assert.equal(isSampleBanner({ imageDesktop: "https://res.cloudinary.com/fhtgksnk/image/upload/glamix/hero/x.webp" }), false);
  const faq = THEME_PRESETS["universal-premium"].faqs[0];
  assert.equal(isSeedFaq(faq), true);
  assert.equal(isSeedFaq({ ...faq, answer: faq.answer + " (updated)" }), false);
  assert.match(read("src/app/(admin)/admin/(protected)/hero-slides/HeroSlidesList.tsx"), /isSampleBanner\(slide\)/);
  assert.match(read("src/app/(admin)/admin/(protected)/promo-banners/PromoBannersList.tsx"), /isSampleBanner\(banner\)/);
  assert.match(read("src/app/(admin)/admin/(protected)/faqs/page.tsx"), /isSeedFaq\(f\)/);
  // Not hidden on the storefront (approved decision): no seed filter in the banner/FAQ queries.
  assert.doesNotMatch(code("src/lib/firebase/repositories/storefront-queries.ts"), /isSampleBanner|isSeedFaq/);
  assert.doesNotMatch(code("src/lib/firebase/repositories/faqs.ts"), /isSeedFaq/);
});

test("banners: Active + optional schedule", () => {
  assert.equal(isBannerLive({ isActive: true }, NOW), true);
  assert.equal(isBannerLive({ isActive: false }, NOW), false);
  assert.equal(isBannerLive({ isActive: true, startDate: NOW + 1 }, NOW), false);
  assert.equal(isBannerLive({ isActive: true, endDate: NOW - 1 }, NOW), false);
  assert.equal(isBannerLive({ isActive: true, startDate: { toMillis: () => NOW - 5 } as any, endDate: { toMillis: () => NOW + 5 } as any }, NOW), true);
});

// ---------------------------------------------------------------- E. Homepage & promos: no code-level demo fallbacks
test("homepage: empty data hides sections; no undefined->demo fallbacks; fallback list has no stock tiles", () => {
  const home = read("src/app/HomeContent.tsx");
  assert.doesNotMatch(home, /\.length \? \w+ : undefined/);
  assert.doesNotMatch(home, /unsplash|Digital gift cards|Up to 80% off|Worldwide delivery|Quality guaranteed/);
  for (const t of ["discoverMore", "howItWork", "socialGallery"]) {
    const fallback = home.slice(home.indexOf("DEFAULT_HOMEPAGE_SECTIONS_FALLBACK: HomepageSection[]"), home.indexOf("export default async function HomeContent"));
    assert.doesNotMatch(fallback, new RegExp(`type: "${t}"`), t);
  }
  assert.match(home, /if \(!heroSection \|\| !heroSlides\.length\) return null;/);
  for (const [file, rx] of [
    ["src/components/SectionHowItWork/SectionHowItWork.tsx", /if \(!itemList\.length\) return null;/],
    ["src/components/SectionSocialGallery.tsx", /if \(!displayItems\.length\) return null;/],
    ["src/components/DiscoverMoreSlider.tsx", /if \(!items\.length\) return null;/],
    ["src/components/SectionSliderCategories/SectionSliderCategories.tsx", /if \(!data\.length\) return null;/],
    ["src/components/SectionGridMoreExplore/SectionGridMoreExplore.tsx", /if \(!categoryList\.length\) return null;/],
    ["src/components/theme/ThemeHeroAdapter.tsx", /if \(!data\?\.length\) return null;/],
  ] as const) assert.match(read(file), rx, file);
});

test("theme variants: no preset demo library; promos/heroes/categories use merchant data only", () => {
  assert.equal(exists("src/lib/theme/theme-assets.ts"), false);
  const dir = "src/components/theme/variants";
  for (const sub of ["heroes", "promos", "categories"]) {
    for (const f of fs.readdirSync(`${dir}/${sub}`)) {
      const s = code(`${dir}/${sub}/${f}`);
      assert.doesNotMatch(s, /getThemeDefaultAssets|HERO2_DEMO_DATA|Silk Couture Trench Coat|100% Handcrafted|Free Shipping|50% OFF|40% OFF|URBAN DROP|Heavyweight Graphic|\/collection\/\$\{item\.id\}/, `${sub}/${f}`);
    }
  }
  for (const f of ["src/components/SectionPromo1.tsx", "src/components/SectionPromo2.tsx", "src/components/SectionPromo3.tsx"]) {
    const s = code(f);
    assert.doesNotMatch(s, /rightImgDemo|New Arrivals in Jewelry|Exclusive Offers & Special Deals|Savings combos|Freeship|Premium magazines/, f);
    assert.match(s, /if \(!heading && !(bannerImg|image)\) return null;/, f);
  }
});

test("categories link to their real page (/category/{slug}), never the non-existent /collection/{id}", () => {
  const adapters = read("src/lib/firebase/adapters.ts");
  assert.equal((adapters.match(/href: `\/category\/\$\{category\.slug\}`/g) ?? []).length, 2);
  assert.match(read("src/components/CardCategories/CardCategory4.tsx"), /getTenantHref\(href \|\| "\/collection"\)/);
  assert.match(read("src/components/CardCategories/CardCategory2.tsx"), /getTenantHref\(href \|\| "\/collection"\)/);
});

test("promo slots on other pages use the store's real banner or nothing", () => {
  // Product page: the promo is the Customizer's "Special Offer Banner" section, rendered by the
  // shared section renderer (store's Promo Banner 2 / the section's own content, or nothing).
  assert.match(read("src/app/product/[slug]/page.tsx"), /<ExtraPageSections sections=\{productPageSections\(theme\.productDetail\)\} theme=\{theme\} resolved \/>/);
  assert.doesNotMatch(code("src/app/product/[slug]/ProductDetailClient.tsx"), /SectionPromo2/);
  assert.doesNotMatch(code("src/components/theme/variants/product-detail/RelatedRailsAndReviews.tsx"), /SectionPromo2/);
  assert.match(read("src/components/collection/CollectionPageView.tsx"), /showPromo && promoBanner &&/);
  assert.match(read("src/app/search/page.tsx"), /\{promoBanner && \(/);
  assert.match(read("src/app/contact/page.tsx"), /getFirstBanner\("promo1"\)/);
  // No promo component is rendered without data anywhere on the storefront.
  const out = grep(["-rnE", "<SectionPromo[123] */>|<SectionSliderCollections */>", "src"]);
  assert.equal(out, "", out);
});

// ---------------------------------------------------------------- G. Store-wide hardcoded content
test("contact page: only filled-in details, never the placeholder email", () => {
  assert.deepEqual(contactInfoRows({ storeEmail: "support@example.com", storeAddress: " ", storePhone: "" }), []);
  assert.deepEqual(contactInfoRows({ storeEmail: "hello@glamix.pk", storeAddress: "Lahore", storePhone: "0300" }).map((r) => r.desc), ["Lahore", "hello@glamix.pk", "0300"]);
});

test("social icons: only the store's own https links; none -> nothing (no generic facebook.com)", () => {
  assert.deepEqual(activeSocialLinks(undefined), []);
  assert.deepEqual(activeSocialLinks({}), []);
  const links = activeSocialLinks({ instagram: "https://instagram.com/glamix", facebook: "javascript:alert(1)", youtube: " " } as any);
  assert.deepEqual(links.map((l) => [l.key, l.href]), [["instagram", "https://instagram.com/glamix"]]);
  for (const f of ["src/shared/SocialsList/SocialsList.tsx", "src/shared/SocialsList1/SocialsList1.tsx"]) assert.doesNotMatch(code(f), /href: "#"/, f);
});

test("no fabricated ratings, claims or identities left in live storefront code", () => {
  assert.doesNotMatch(code("src/components/ProductCard.tsx"), /rating \|\| "4\.8"/);
  assert.doesNotMatch(code("src/components/theme/variants/product-cards/TrendGlassCard.tsx"), /"4\.9"|Trending luxury item/);
  assert.doesNotMatch(code("src/components/theme/variants/product-cards/DealCard.tsx"), /High quality product/);
  assert.doesNotMatch(code("src/components/ReviewItem.tsx"), /Cody Fisher|DEMO_DATA/);
  assert.doesNotMatch(code("src/shared/Avatar/Avatar.tsx"), /avatarImgs|"John Doe"/);
  assert.doesNotMatch(code("src/components/AccordionInfo.tsx"), /Belgian power micromesh|DEMO_DATA/);
  assert.doesNotMatch(code("src/components/AnnouncementBar.tsx"), /title: "✦ FREE SHIPPING/);
  assert.doesNotMatch(code("src/app/checkout/CheckoutClient.tsx"), /Guaranteed Delivery/);
  assert.doesNotMatch(code("src/app/layout.tsx"), /Fast shipping, easy returns/);
  assert.doesNotMatch(code("src/app/product/[slug]/page.tsx"), /Quality guaranteed|priceCurrency: "PKR"/);
  assert.doesNotMatch(code("src/components/SectionSocialGallery.tsx"), /@GlamixStore"/);
  assert.doesNotMatch(code("src/components/theme/variants/footers/MultiColumnFooter.tsx"), /Discover modern essentials/);
  assert.doesNotMatch(code("src/components/theme/ThemePopupModal.tsx"), /\|\| "Special Offer"|Subscribe today to get exclusive deals/);
  for (const gone of ["src/contains/fakeData.ts", "src/data/data.ts", "src/components/CardCategories/data.ts", "src/components/DiscoverMoreGrid.tsx", "src/components/sections/SectionRegistry.tsx"]) {
    assert.equal(exists(gone), false, gone);
  }
});

test("reproducible scan: no demo imports, stock photos, fake identities or fabricated fallbacks in live code", () => {
  const out = execFileSync("python3", ["scripts/audit/storefront-content-scan.py"], { encoding: "utf8" });
  const hits = out.trim().split("\n").filter(Boolean);
  const bad = hits.filter((h) => /:(demo-data-import|stock-photo|lorem|undefined-fallback|rating-fallback|long-copy-fallback):/.test(h) && !/contains\/contants|@\/data\/types/.test(h));
  assert.deepEqual(bad, []);
  const identities = hits.filter((h) => /:fake-identity:/.test(h) && !/^\S+:\d+:fake-identity:\s*\/\//.test(h.replace(/^(\S+:\d+:fake-identity:)\s*/, "$1 ")));
  assert.deepEqual(identities.filter((h) => !/\/\/|\/\*/.test(h.split(":fake-identity:")[1])), []);
});

// ---------------------------------------------------------------- F. Demo routes / real routes
test("demo routes redirect or 404; real commerce routes intact; /collection-2 is a real listing", () => {
  assert.match(read("src/app/home-2/page.tsx"), /redirect\("\/"\)/);
  assert.match(read("src/app/product-detail/page.tsx"), /redirect\("\/collection"\)/);
  assert.match(read("src/app/product-detail-2/page.tsx"), /redirect\("\/collection"\)/);
  assert.match(read("src/app/blog-single/page.tsx"), /redirect\("\/blog"\)/);
  assert.match(read("src/app/subscription/page.tsx"), /notFound\(\)/);
  assert.equal(exists("src/app/product-detail/ModalViewAllReviews.tsx"), true, "still used by the real product page");
  for (const r of [
    "product/[slug]/page.tsx", "category/[slug]/page.tsx", "collection/page.tsx", "collection-2/page.tsx", "search/page.tsx",
    "cart/page.tsx", "checkout/page.tsx", "order-tracking/page.tsx", "brand/[slug]/page.tsx", "pages/[slug]/page.tsx",
    "privacy/page.tsx", "terms/page.tsx", "refund/page.tsx", "faq/page.tsx", "contact/page.tsx", "compare/page.tsx",
    "blog/page.tsx", "blog/[slug]/page.tsx", "about/page.tsx",
  ]) assert.equal(exists(`src/app/${r}`), true, r);
  const c2 = read("src/app/collection-2/page.tsx");
  assert.match(c2, /searchProducts\(params\)/);
  assert.doesNotMatch(c2, /Man collection|SectionPromo1|SectionSliderCollections/);
  // Nothing in the code still links to the removed demo pages.
  const links = grep(["-rnE", "['\"`]/(home-2|product-detail-2|product-detail|subscription|blog-single)['\"`?#/]", "src", "--include=*.ts", "--include=*.tsx"]);
  assert.equal(links, "", links);
});

// ---------------------------------------------------------------- safeQuery cache correctness
test("safeQuery cache key includes tenant AND arguments; caching is opt-in", () => {
  assert.notEqual(safeQueryCacheKey("glamix", "getBlogPostBySlug", ["a"]), safeQueryCacheKey("glamix", "getBlogPostBySlug", ["b"]));
  assert.notEqual(safeQueryCacheKey("glamix", "getBannersByPlacement", ["hero"]), safeQueryCacheKey("glamix", "getBannersByPlacement", ["promo1"]));
  assert.notEqual(safeQueryCacheKey("glamix", "x", []), safeQueryCacheKey("zyvora-hub", "x", []));
  const sq = read("src/lib/firebase/repositories/safe-query.ts");
  assert.match(sq, /if \(cacheArgs\)/);
  assert.match(sq, /if \(tenantSlug\) cacheKey = safeQueryCacheKey/);
  assert.match(read("src/lib/firebase/repositories/blog-posts.ts"), /queryPublicBlogPostBySlug\(adminDb\(\), tenant\.id, slug\), \[slug\]\)/);
  assert.match(read("src/lib/firebase/repositories/banners.ts"), /queryLiveBanners\(adminDb\(\), tenant\.id, placement\), \[placement\]\)/);
  assert.match(read("src/lib/firebase/repositories/reviews.ts"), /\}, \[productId, limit\]\);/);
});
