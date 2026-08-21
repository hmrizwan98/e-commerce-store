import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getThemePreset } from "@/lib/themes/theme-presets";
import { PRESET_PREMIUM_LUXURY } from "@/lib/theme/theme-presets";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import type { CmsPageStatus } from "@/types/page";
import type { PageSectionType } from "@/types/page-section";
import type { HomepageSectionType, HomepageSectionConfig } from "@/types/homepage-section";

/**
 * Installs the store's complete default setup: a real SystemThemeConfig at
 * themeSettings/active+draft (the same doc shape the merchant Theme Editor
 * reads/writes - see src/lib/theme/theme-repository.ts), a full default
 * homepage (all sections showcasing real content, not an empty "add a
 * section" state), navigation/announcement-bar/banners/testimonials/FAQs/CMS
 * legal pages (starter content, reused from the platform's existing content
 * bundle), and ~3 demo categories/brands + ~6 demo products so the store
 * never looks empty on day one.
 *
 * Every new store gets the SAME one retained theme/content bundle now - no
 * merchant-facing theme choice at creation time (Phase 1 cleanup consolidated
 * the merchant theme catalog to one preset; see theme-presets.ts). The
 * public marketing "Four themes" showcase pages (src/app/(marketing)/platform/
 * themes, ThemesTeaser.tsx, StatsBand.tsx) still read the full 4-preset
 * content-bundle catalog in src/lib/themes/theme-presets.ts directly - that
 * catalog is intentionally left untouched here, only this function's own
 * choice of bundle is now fixed to "universal-premium" rather than merchant-
 * selectable.
 *
 * Idempotent: guarded by a `defaultThemeInstalled` flag on the store doc, so
 * re-invoking this (e.g. a manual retry after a partial failure) never
 * creates duplicate homepage sections/products/categories.
 *
 * All of the writes below target different collections/documents with no
 * data dependency between them, so they run via one Promise.all instead of
 * one after another - each write pays its own Firestore round-trip latency
 * (observed 300-1800ms per step in production), and doing them sequentially
 * was the majority of the time this function's caller (createStore()'s
 * background job) was spending, risking the platform's function timeout.
 */
export async function installDefaultTheme(
  storeDocRef: FirebaseFirestore.DocumentReference,
  _opts: Record<string, never> = {},
  stage: (name: string) => void = () => {}
): Promise<void> {
  const storeSnap = await storeDocRef.get();
  if (storeSnap.data()?.defaultThemeInstalled === true) {
    stage("ALREADY_INSTALLED");
    return;
  }

  const preset = getThemePreset("universal-premium");
  const now = FieldValue.serverTimestamp();
  const themeSettingsUpdatedAt = Date.now();

  // Navigation.
  const menusCol = storeDocRef.collection("menus");

  // Hero + promo banners.
  const bannersCol = storeDocRef.collection("banners");

  // Testimonials + FAQs (starter content).
  const testimonialsCol = storeDocRef.collection("testimonials");
  const faqsCol = storeDocRef.collection("faqs");

  // CMS pages: privacy/terms/refund (content blobs, existing pattern) + FAQ (one
  // page-builder section, reusing the existing PageSectionType:"faq" renderer).
  // Slugs must match exactly what src/app/privacy|terms|refund/page.tsx query
  // (getPageBySlug("privacy")/("terms")/("refund")) - NOT "privacy-policy" etc.
  const pagesCol = storeDocRef.collection("pages");
  const legalPages: { slug: string; title: string; content: string }[] = [
    { slug: "privacy", title: "Privacy Policy", content: preset.legalPages.privacy },
    { slug: "terms", title: "Terms & Conditions", content: preset.legalPages.terms },
    { slug: "refund", title: "Refund Policy", content: preset.legalPages.refund },
  ];
  const faqPageRef = pagesCol.doc();

  const homepageSections: { type: HomepageSectionType; title: string; order: number; config: HomepageSectionConfig }[] = [
    { type: "hero", title: "Hero", order: 0, config: {} },
    {
      type: "discoverMore",
      title: "Discover More",
      order: 1,
      config: {
        heading: "Discover more",
        subHeading: "Good things are waiting for you",
        items: [
          { id: "1", title: "Explore new arrivals", subtitle: "Give the gift of choice", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80", href: "/collection" },
          { id: "2", title: "Digital gift cards", subtitle: "Give the gift of choice", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", href: "/collection-2" },
          { id: "3", title: "Sale collection", subtitle: "Up to 80% off", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80", href: "/search" },
        ],
      },
    },
    { type: "newArrivals", title: "New Arrivals", order: 2, config: { heading: "New Arrivals", subHeading: "REY BUY WITH ALL DISCOUNT COUPON", mode: "auto", limit: 8 } },
    {
      type: "howItWork",
      title: "How It Works",
      order: 3,
      config: {
        items: [
          { id: "1", icon: "🔍", title: "Filter & Discover", subtitle: "Smart filtering and search" },
          { id: "2", icon: "🛍️", title: "Add to bag", subtitle: "Easily select and add items" },
          { id: "3", icon: "📦", title: "Fast shipping", subtitle: "Worldwide delivery options" },
          { id: "4", icon: "✨", title: "Enjoy the product", subtitle: "Quality guaranteed" },
        ],
      },
    },
    { type: "promo", title: "Earn Free Money", order: 4, config: { variant: 1 } },
    { type: "exploreGrid", title: "Start Exploring", order: 5, config: { heading: "Start exploring", mode: "auto", limit: 6 } },
    { type: "bestSellers", title: "Best Sellers", order: 6, config: { heading: "Best Sellers", subHeading: "BEST SELLERS OF THE MONTH", mode: "auto", limit: 8 } },
    { type: "promo", title: "Special Offer", order: 7, config: { variant: 2 } },
    { type: "largeProductSlider", title: "Chosen by Our Experts", order: 8, config: { heading: "CHOSEN BY OUR EXPERTS", mode: "auto", limit: 3 } },
    { type: "collections", title: "Shop by Department", order: 9, config: { heading: "Shop by department", mode: "auto" } },
    { type: "promo", title: "Don't Miss Out", order: 10, config: { variant: 3 } },
    { type: "featureItemsGrid", title: "What's Trending Now", order: 11, config: { heading: "What's trending now", subHeading: "DISCOVER MORE PRODUCTS", mode: "auto", limit: 8 } },
    { type: "blog", title: "The Latest News", order: 12, config: { heading: "The latest news", subHeading: "FROM THE CISECO BLOG", limit: 4 } },
    { type: "testimonials", title: "What People Are Saying", order: 13, config: { heading: "What People Are Saying", subHeading: "HAPPY CUSTOMERS" } },
    { type: "newsletter", title: "Join our newsletter 📦", order: 14, config: { heading: "Join our newsletter 📦" } },
  ];

  // ~3 demo categories - real docs (not fake frontend data) so exploreGrid/
  // collections have genuine content; showOnHomepage is required for
  // getHomepageCategories() to surface them (src/lib/firebase/repositories/categories.ts).
  const categoriesCol = storeDocRef.collection("categories");
  const categoryDefs = [
    { name: "Apparel", slug: "apparel", description: "Everyday and statement pieces.", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80" },
    { name: "Accessories", slug: "accessories", description: "Finishing touches for every outfit.", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80" },
    { name: "Home & Living", slug: "home-living", description: "Thoughtfully designed for everyday life.", image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80" },
  ];
  const categoryRefs = categoryDefs.map(() => categoriesCol.doc());

  // ~3 demo brands so the `brands` homepage section has real content.
  const brandsCol = storeDocRef.collection("brands");
  const brandDefs = [
    { name: "Atelier Co.", slug: "atelier-co", logo: "" },
    { name: "Northfield", slug: "northfield", logo: "" },
    { name: "Lumen Studio", slug: "lumen-studio", logo: "" },
  ];

  // ~6 ordinary demo products (plain status:"active", no demo/seed flag - the
  // Product type has none, and the merchant can edit/delete/replace them
  // exactly like any product they create themselves). Spread across the
  // seeded categories, with at least one each flagged isFeatured/isNewArrival/
  // isOnSale so those homepage sections render real data on day one.
  const productsCol = storeDocRef.collection("products");
  const productDefs = [
    {
      name: "Classic Leather Tote",
      description: "A timeless leather tote with a spacious interior and reinforced handles - built for everyday use.",
      price: 189,
      sku: "DEMO-001",
      categoryIndex: 1,
      images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"],
      isFeatured: true,
      isBestSeller: true,
    },
    {
      name: "Silk Twill Scarf",
      description: "Lightweight silk twill scarf with a hand-rolled edge, finished in a versatile print.",
      price: 65,
      sku: "DEMO-002",
      categoryIndex: 1,
      images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80"],
      isNewArrival: true,
    },
    {
      name: "Minimalist Chronograph Watch",
      description: "A clean-faced chronograph with a genuine leather strap and sapphire crystal glass.",
      price: 249,
      sku: "DEMO-003",
      categoryIndex: 1,
      images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"],
      isFeatured: true,
    },
    {
      name: "Merino Wool Sweater",
      description: "Soft, breathable merino wool knit, cut for a relaxed everyday fit.",
      price: 145,
      compareAtPrice: 180,
      sku: "DEMO-004",
      categoryIndex: 0,
      images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80"],
      isNewArrival: true,
      isOnSale: true,
    },
    {
      name: "Ceramic Vase Set",
      description: "Hand-finished ceramic vases in a set of two, sized for a shelf or console table.",
      price: 78,
      compareAtPrice: 95,
      sku: "DEMO-005",
      categoryIndex: 2,
      images: ["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80"],
      isOnSale: true,
    },
    {
      name: "Linen Throw Blanket",
      description: "Pre-washed linen throw, soft and breathable, woven in a classic waffle texture.",
      price: 92,
      sku: "DEMO-006",
      categoryIndex: 2,
      images: ["https://images.unsplash.com/photo-1449247613801-ab06418e2861?auto=format&fit=crop&w=800&q=80"],
      isBestSeller: true,
    },
  ];

  await Promise.all([
    // Real SystemThemeConfig at themeSettings/active + draft - the doc shape
    // the merchant appearance editor already reads/writes (theme-repository.ts's
    // setActiveThemeConfig/saveDraftThemeConfig), written directly here since
    // this runs from a bare storeDocRef with no per-request tenant context.
    // updatedAt is a plain Date.now() number, NOT FieldValue.serverTimestamp() -
    // matching setActiveThemeConfig/saveDraftThemeConfig's own convention exactly,
    // since getActiveThemeConfig() reads this field back with no Timestamp
    // conversion (a real Timestamp instance here would leak into Client Component
    // props the same way the onboarding progress bug did).
    Promise.all([
      storeDocRef.collection("themeSettings").doc("active").set({ ...PRESET_PREMIUM_LUXURY, isPublished: true, updatedAt: themeSettingsUpdatedAt }),
      storeDocRef.collection("themeSettings").doc("draft").set({ ...PRESET_PREMIUM_LUXURY, isPublished: false, updatedAt: themeSettingsUpdatedAt }),
    ]).then(() => stage("THEME_SETTINGS_WRITTEN")),

    Promise.all(
      homepageSections.map((section) =>
        storeDocRef.collection("homepageSections").doc().set({ ...section, isActive: true, createdAt: now, updatedAt: now })
      )
    ).then(() => stage("HOMEPAGE_SECTIONS_WRITTEN")),

    Promise.all([
      menusCol.doc("header").set({ id: "header", items: preset.navigation.header, updatedAt: now }),
      menusCol.doc("footer").set({ id: "footer", items: preset.navigation.footer, updatedAt: now }),
    ]).then(() => stage("MENUS_WRITTEN")),

    storeDocRef.collection("announcementBars").doc().set({ ...preset.announcementBar, createdAt: now, updatedAt: now }).then(() => stage("ANNOUNCEMENT_BAR_WRITTEN")),

    Promise.all(
      [preset.heroBanner, ...preset.promoBanners].map((banner) => bannersCol.doc().set({ ...banner, createdAt: now, updatedAt: now }))
    ).then(() => stage("BANNERS_WRITTEN")),

    Promise.all(preset.testimonials.map((t) => testimonialsCol.doc().set({ ...t, createdAt: now, updatedAt: now }))).then(() => stage("TESTIMONIALS_WRITTEN")),

    Promise.all(preset.faqs.map((f) => faqsCol.doc().set({ ...f, createdAt: now, updatedAt: now }))).then(() => stage("FAQS_WRITTEN")),

    Promise.all([
      Promise.all(
        legalPages.map((page) =>
          pagesCol.doc().set({ ...page, isActive: true, status: "published" satisfies CmsPageStatus, createdAt: now, updatedAt: now })
        )
      ),
      faqPageRef
        .set({ slug: "faq", title: "Frequently Asked Questions", content: "", isActive: true, status: "published" satisfies CmsPageStatus, createdAt: now, updatedAt: now })
        .then(() =>
          faqPageRef.collection("sections").doc().set({
            type: "faq" satisfies PageSectionType,
            title: "FAQ",
            order: 0,
            isActive: true,
            config: { heading: "Frequently Asked Questions" },
            createdAt: now,
            updatedAt: now,
          })
        ),
    ]).then(() => stage("PAGES_WRITTEN")),

    Promise.all(
      categoryDefs.map((cat, i) =>
        categoryRefs[i].set({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          parentId: null,
          order: i,
          isActive: true,
          showInNav: true,
          showOnHomepage: true,
          isDeleted: false,
          deletedAt: null,
          createdAt: now,
          updatedAt: now,
        })
      )
    ).then(() => stage("DEMO_CATEGORIES_WRITTEN")),

    Promise.all(
      brandDefs.map((brand, i) =>
        brandsCol.doc().set({
          ...stripUndefined({
            name: brand.name,
            slug: brand.slug,
            logo: brand.logo || undefined,
            isActive: true,
            order: i,
          }),
          isDeleted: false,
          deletedAt: null,
          createdAt: now,
          updatedAt: now,
        })
      )
    ).then(() => stage("DEMO_BRANDS_WRITTEN")),
    Promise.all(
      productDefs.map((p, i) =>
        productsCol.doc().set({
          ...stripUndefined({
            name: p.name,
            slug: p.sku.toLowerCase(),
            nameLower: p.name.toLowerCase(),
            description: p.description,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            sku: p.sku,
            categoryIds: [categoryRefs[p.categoryIndex].id],
            tags: [],
            images: p.images,
            status: "active",
            badge: p.isOnSale ? "sale" : p.isNewArrival ? "new" : null,
            stock: 50,
            trackInventory: true,
            attributes: [],
            hasVariants: false,
            isFeatured: p.isFeatured ?? false,
            isNewArrival: p.isNewArrival ?? false,
            isBestSeller: p.isBestSeller ?? false,
            isOnSale: p.isOnSale ?? false,
            order: i,
          }),
          rating: 0,
          numberOfReviews: 0,
          isDeleted: false,
          deletedAt: null,
          createdAt: now,
          updatedAt: now,
        })
      )
    ).then(() => stage("DEMO_PRODUCTS_WRITTEN")),
  ]);

  await storeDocRef.update({ defaultThemeInstalled: true });
  stage("DEFAULT_THEME_INSTALL_COMPLETE");
}
