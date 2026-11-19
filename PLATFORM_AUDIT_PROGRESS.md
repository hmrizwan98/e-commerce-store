# Webriiz platform audit - progress

Last updated: 2026-11-19 (after real Shopify/WooCommerce-style CSV & Excel product bulk import/export engine)

| Phase | Status |
|---|---|
| Phase 1 - architecture inventory | Done |
| Phase 2A - read-only audit + roadmap | Done (approved) |
| Phase 3 - P0 implementation | Done in working tree (not committed, not deployed) |
| Phase 3B - P0 final verification & remaining risk fixes | Done (approved) |
| Phase 4 - P1 admin controls & real functionality | Done (approved) |
| **Phase 5 - P2 real dynamic storefront content** | **Done in working tree - awaiting review/approval** (not committed, not deployed) |
| **Targeted bug fixes & mobile slider cropping** | **Done in working tree - tested & verified** (not committed, not deployed) |
| **Targeted Fixes (Slider, Customizer, Contact, Ratings, Bottom Promo)** | **Done in working tree - tested & verified** (not committed, not deployed) |
| **Targeted Fixes (Search Bar UI & Product Search, Advanced Image Responsiveness & Fit Modes)** | **Done in working tree - tested & verified** (not committed, not deployed) |
| **Bulk Product Import & Export Engine (CSV & Excel)** | **Done in working tree - tested & verified** (not committed, not deployed) |
| P3 | Not started - waits for approval |

## Targeted fixes (2026-11-19): Real Bulk Product Import & Export Engine (Shopify & WooCommerce Standard)

### 1. Functional CSV & Excel File Import
- **Previous State:** Architecture stub with a text field (`File name (optional)`) that queued an empty record into Firestore without actually accepting or parsing any file.
- **Solution:**
  - Added Sample CSV Template download button (`sample-products-template.csv`) with pre-filled columns: `Name, Price, CompareAtPrice, SKU, Stock, Category, Description, Images, Status`.
  - Added drag & drop / file picker accepting `.csv`, `.xlsx`, and `.xls` files up to 20MB.
  - Client-side parser with flexible column mapping (handles `Name`, `Title`, `Product Name`, `Price`, `Regular Price`, `SKU`, `Stock`, `Qty`, `Category`, `Images`, etc.).
  - Instant file summary & interactive table preview of the first 5 rows before importing.
  - Server action `executeProductBulkImportAction` validates products, auto-creates/resolves categories, generates unique collision-free slugs, computes search facets, and executes Firestore batch writes in chunks of 400 products.
  - Updates history status to `completed` with actual row count and timestamp.

### 2. Functional Product CSV Export
- **Previous State:** "Request export" button created a stub record with status `queued` and produced no downloadable file.
- **Solution:**
  - Server action `executeProductBulkExportAction` fetches all active products for the tenant, resolves category IDs into readable category names, and generates RFC 4180 compliant CSV rows.
  - Triggers instant browser download of `products-export-YYYY-MM-DD.csv`.
  - Records completed operation in `productBulkOperations` history with item count.

## Targeted fixes (2026-11-19): Search Bar UI & Multi-keyword Search, Advanced Image Responsiveness & Fit Modes

### 1. Search Bar UI & Positioning
- **Root Cause:**
  - `SearchDropdown.tsx` used `<Popover.Panel static className="absolute right-0 z-10 w-screen max-w-sm mt-3">`. On mobile screens, because the search trigger button is placed on the header's right side (~70px from screen edge), `absolute right-0` anchored the right edge of a 384px panel to the icon, pushing the left edge >80px past the left screen edge. The input was clipped off-screen to the left (showing only `enter...` over hero banners).
- **Solution:**
  - On Mobile (`< md`): Implemented a full-width, pinned top search bar (`fixed inset-x-0 top-0 z-50 p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border-b`).
  - Centered input with magnifying glass icon, real-time query state, clear button (`X`), submit button ("Search"), and dedicated mobile close button (`close()`). Zero clipping and zero overflow on any mobile screen.
  - On Desktop (`>= md`): Clean floating card popover (`md:absolute md:right-0 md:top-full md:mt-3 md:w-[420px] md:rounded-2xl md:border md:shadow-2xl`).

### 2. Search Functionality & Multi-Keyword Product Matching
- **Root Cause:**
  - `SearchDropdown.tsx` had `<form action="" method="POST">` with no router navigation, no controlled query state, and no input `name` attribute. Pressing Enter or clicking submit resulted in dead submissions.
  - In `src/lib/firebase/repositories/products.ts`, `searchProductsByName` only used Firestore prefix inequalities (`>= term` and `<= term + \uf8ff`). Searching for words in the middle or end of titles (e.g. "trimmer" for "T9 Vintage Dragon Style Metal Body Hair Trimmer") or searching by description, tags, or SKU returned 0 results.
- **Solution:**
  - Controlled state (`query`, `setQuery`) in `SearchDropdown.tsx` and form navigation (`router.push('/search?q=' + encodeURIComponent(trimmed))`).
  - In `products.ts`, upgraded `searchProductsByName` to perform fast indexed prefix search first, and fallback to multi-keyword substring matching across `name`, `description`, `tags`, and `sku`. All keywords are matched case-insensitively, returning accurate product results.

### 3. Image Display & Responsiveness (Contain / Cover / Fill / Auto)
- **Root Cause:**
  - Wide banners with text (like "Lifestyle Accessories") cropped text on desktop laptops when forced into fixed heights with `object-cover`.
  - When set to `contain`, forcing the rigid container height created heavy blurred sidebars on wide desktop screens and portrait mobile images.
  - Customizer forced a minimum height (450px) and lacked options for Auto/Natural aspect ratio, Fill mode, or toggling the ambient blurred backdrop.
- **Solution:**
  - Updated `ThemeBanner` interface in `src/types/theme.ts` to support `imageFit: "full" | "cover" | "contain" | "fill" | "auto"` and `ambientBackdrop?: boolean`.
  - In `FullWidthImageHero.tsx`:
    - **Contain Mode (`"full"`):** Complete image uncropped (`object-contain`). Added `ambientBackdrop` support (defaults to soft color-matched blur, can be toggled off for clean neutral dark/light background).
    - **Cover Mode (`"cover"`):** Fills container (`object-cover`) with focal positioning (`object-left`, `object-center`, `object-right`, `object-top`, `object-bottom`).
    - **Fill Mode (`"fill"`):** Fills frame with `object-fill`.
    - **Auto / Natural Mode (`"auto"` or `heightPx: 0`):** Container dynamically scales with the image's natural aspect ratio (`style={{ width: "100%", height: "auto" }}`), completely eliminating cropping and eliminating empty sidebars.
  - In `HeroSectionInspector.tsx`:
    - Added full fit mode dropdown (Contain, Cover, Fill, Auto).
    - Updated Desktop & Mobile height inputs to accept `0` for Auto/Natural aspect ratio.
    - Added ambient backdrop toggle for Contain mode.
    - Default and per-slide focal alignment controls.

### Verification & Tests
- `scripts/test-slider-responsive.ts`: 13/13 tests pass (including fill mode, ambient backdrop toggle, auto height, responsive picture, touch swipe, focal positions).
- `scripts/test-storefront-ui.ts` & `scripts/test-p2.ts`: 29/29 tests pass (Total 42/42 tests pass).
- TypeScript: `npx tsc --noEmit` passed with 0 errors.
- Lint: `npm run lint` passed with 0 warnings/errors.
- Build: `npm run build` generated 122 static and dynamic routes successfully.

## Targeted fixes (2026-11-19): Slider Fitting & Management, Contact Page, Ratings Control, Bottom Promo

### 1. Slider Images Container Strategy & Image Fit Options
- **Root Cause:** When `fit === "full"` (default), `FullWidthImageHero.tsx` used CSS grid `[grid-area:1/1]` where all slides shared a single grid cell and each image had `width: 100%, height: auto`. In this grid layout, the row height expanded to the MAX height of all child slides. Shorter images had empty letterboxing gaps above and below, and `banner.heightPx` set by the merchant in Customizer was completely ignored.
- **Solution:**
  - Implemented stable responsive container sizing using `--hero-h-desktop` (configured desktop height, default 450px) and `--hero-h-mobile` (custom mobile height, default 360px).
  - Added **Contain** mode: Renders the complete image with `object-contain` (0% cropped, 0% distorted) over a hardware-accelerated ambient blurred backdrop matching the image's own colors. No raw gaps, no layout jumps between slides of different dimensions.
  - Added **Cover** mode: Fills the slider area using `object-cover` with focal alignment (`object-top`, `object-center`, `object-bottom`, `object-left`, `object-right`).
  - Seamless responsive transitions between slides via absolute crossfading.

### 2. Full Slider Management Inside Store Admin Customizer
- **Root Cause:** Customizer previously only offered external links to `/admin/hero-slides/new` and `/admin/hero-slides` in another tab, forcing merchants out of the theme editor.
- **Solution:**
  - Added server actions in `appearance/customize/actions.ts`: `getHeroSlidesForCustomizerAction`, `saveHeroSlideForCustomizerAction`, `deleteHeroSlideForCustomizerAction`, `reorderHeroSlidesForCustomizerAction`, `toggleHeroSlideActiveForCustomizerAction`.
  - Rebuilt `HeroSectionInspector.tsx` with full embedded slide management: list slides, reorder (up/down), toggle active, delete with confirmation, and add/edit slides inline.
  - Slide form supports uploading Desktop image (required) and Mobile image (optional) with `ImageUploader`, focal position picker, title, subtitle, CTA text and link.
  - Banner settings include: Image fitting mode (Contain vs Cover), Default focal position, Desktop Height (px), Mobile Height (px), rounded corners, and overlay controls.
  - Preserves all existing slides, URLs, and tenant isolation; backward-compatible with `"full"`.

### 3. Contact Page Redesign
- **Root Cause:** Page previously had awkward spacing, huge empty gaps when only email was set, and displayed an unrelated sample promotional banner ("New Arrivals in Jewelry") at the bottom.
- **Solution:**
  - Rebuilt `src/app/contact/page.tsx` with a clean 2-column responsive layout (`grid-cols-1 lg:grid-cols-12`).
  - Left column: Dynamic cards for verified tenant contact info (Email card with `mailto:`, Phone card with `tel:`, Address card, Social links, Customer support guarantee badge).
  - Right column: Clean card enclosing `ContactForm` with preserved validation and rate limiting.
  - Suppressed sample promotional banners (`isSampleBanner(promoBanner)`) from appearing at the bottom of the contact page.

### 4. Product Page Ratings Control
- **Root Cause:** Rating stars and rating summaries appeared unconditionally on product pages without merchant control.
- **Solution:**
  - Added `showRatings?: boolean` to `ProductDetailThemeConfig` in `src/lib/theme/theme-types.ts`.
  - Added toggle in `ProductDetailTab.tsx` ("Show Product Ratings & Star Badges").
  - Updated `ProductDetailClient.tsx`, `MinimalProductDetail.tsx`, `BoldProductDetail.tsx`, `LuxuryProductDetail.tsx`, and `RelatedRailsAndReviews.tsx` to conditionally hide star badges and rating summaries when disabled.
  - Reviews system, review submission, and review records remain completely intact. Setting is tenant-scoped and independent per store.

### 5. Product Page Bottom Section (Beauty Essentials)
- **Root Cause:** `productPageSections` rendered `SectionPromo2` pointing to sample banner `promo2` ("Beauty Essentials" with placeholder image). When `bannerImg` was absent, `SectionPromo2` rendered an empty `w-full lg:w-1/2` container on the left, leaving an awkward asymmetric layout.
- **Solution:**
  - In `SectionPromo2.tsx`: Automatically suppressed sample banners (`isSampleBanner(banner)` or `title === "Beauty Essentials"`) when no merchant custom content is provided.
  - When merchant provides real text-only promo content, layout centers gracefully without leaving an empty column.
  - In `ProductDetailTab.tsx`: "Promotional Deals Banner (Bottom Section)" toggle defaults to `false` when not set, giving merchants explicit control.

### Verification & Tests
- `scripts/test-slider-responsive.ts`: 10/10 tests pass (including custom height, contain mode with ambient backdrop, and sample promo suppression).
- `scripts/test-storefront-ui.ts`: 11/11 tests pass.
- `scripts/test-p2.ts`: 18/18 tests pass.
- `npx tsc --noEmit`: 0 errors.
- `npm run lint`: 0 errors / 0 warnings.
- `npm run build`: Production build succeeded, all 122 pages generated cleanly.

## Targeted fix (2026-11-18): Responsive slider image cropping on mobile

### Problem
When merchants upload banners for hero sliders through Store Admin, images looked fine on desktop but were severely cropped or improperly framed on mobile screens.

### Root Causes
1. **Pipeline Data Loss:** Store Admin already supported uploading both `Desktop image` and `Mobile image (optional)` as well as choosing `Background position` ("left" | "center" | "right" | "top" | "bottom"). However, `toHeroSlide` in `src/lib/firebase/adapters.ts` and `Hero2DataType` dropped both `imageMobile` and `backgroundPosition`. The storefront never received the mobile-specific artwork or focal position.
2. **Container Rigid Fixed Height:** `FullWidthImageHero.tsx` enforced a rigid fixed height (`h-[260px]` on mobile). When displaying a wide desktop banner (e.g. 1584×672, aspect ratio ~2.36:1) on a ~360-390px mobile screen, `object-cover` forced the image to scale to fill 260px height (resulting in 614px scaled width), cropping off >40% of the image horizontally. If the merchant uploaded a portrait mobile banner (e.g. 768×1376, ratio 0.56:1), the 260px height chopped off >60% vertically.
3. **Hardcoded Alignment:** Storefront hero and promo components hardcoded `object-center`, completely ignoring the merchant's selected focal alignment.
4. **Desktop/Mobile Separation:** `LuxeHero`, `MinimalHero`, `BoldStreetHero`, `TechHero`, and promo sections lacked responsive picture/element rendering for mobile-specific assets.

### Fix
1. **Preserve Mobile Assets & Position in Adapter:** Added `imageMobile` and `backgroundPosition` to `Hero2DataType` (`src/components/SectionHero/data.ts`) and mapped both in `toHeroSlide` (`src/lib/firebase/adapters.ts`).
2. **Adaptive Responsive Container Sizing:**
   - When a slide has a dedicated mobile image (`hasAnyMobileImage`): Mobile container adapts to comfortable portrait height (`h-[400px] sm:h-[460px] md:h-[var(--hero-h-desktop)]`).
   - When only desktop image is provided: Mobile container uses natural landscape aspect ratio (`aspect-[16/9] sm:aspect-[21/9] md:aspect-auto md:h-[var(--hero-h-desktop)] min-h-[220px]`), preventing wide landscape banners from being cropped into narrow squares.
3. **Dual Image Rendering:** When `imageMobile` is uploaded, renders dedicated mobile image on phones (`< md:`) and desktop image on tablets/desktops (`>= md:`). If no mobile image is uploaded, seamlessly falls back to desktop image.
4. **Focal Alignment Support:** Created `src/lib/banners/position.ts` mapping `backgroundPosition` to Tailwind utility classes (`object-left`, `object-right`, `object-top`, `object-bottom`, `object-center`), ensuring subject or text near edges remains visible.
5. **Touch Swipe Navigation:** Added native touch swipe gesture navigation (`onTouchStart`, `onTouchEnd`) to `FullWidthImageHero.tsx` for smooth mobile slide transitions.
6. **Hero & Promo Consistency:** Updated `LuxeHero`, `MinimalHero`, `BoldStreetHero`, `TechHero`, `SectionPromo1`, `SectionPromo2`, `SectionPromo3`, `BoldStreetPromo`, `MinimalPromo`, and `TechDealsPromo` to support `imageMobile` and focal positioning.

### Files Changed
- `src/lib/banners/position.ts` (new): Background position to Tailwind class mapper.
- `src/components/SectionHero/data.ts`: Extended `Hero2DataType` with `imageMobile` and `backgroundPosition`.
- `src/lib/firebase/adapters.ts`: Mapped `imageMobile` and `backgroundPosition` in `toHeroSlide`.
- `src/components/theme/variants/heroes/FullWidthImageHero.tsx`: Adaptive container height, mobile/desktop dual image rendering, focal alignment, touch swipe, visible mobile arrows.
- `src/components/theme/variants/heroes/LuxeHero.tsx`: Mobile image support, responsive aspect ratio, focal position.
- `src/components/theme/variants/heroes/MinimalHero.tsx`: Mobile image support, responsive aspect ratio, focal position.
- `src/components/theme/variants/heroes/BoldStreetHero.tsx`: Mobile image support, responsive aspect ratio, focal position.
- `src/components/theme/variants/heroes/TechHero.tsx`: Mobile image support.
- `src/components/SectionPromo1.tsx`, `SectionPromo2.tsx`, `SectionPromo3.tsx`: Responsive picture elements with mobile source and focal alignment.
- `src/components/theme/variants/promos/BoldStreetPromo.tsx`, `MinimalPromo.tsx`, `TechDealsPromo.tsx`: Responsive mobile image support.
- `src/components/admin/BannerForm.tsx`: Helper guidance text for recommended banner dimensions and focal position.
- `scripts/stub-server-only.cjs`: Added static asset stubs for node test environments.
- `scripts/test-slider-responsive.ts` (new): 7/7 test suite covering position mapping, adapter preservation, desktop-only landscape aspect ratio, mobile portrait image height, multi-slide swipe, hero variants, and promo banners.

### Tests
- `scripts/test-slider-responsive.ts`: **7/7 passed**.
- All previous suites pass: targeted product bugs 6/6, P0 22/22, P1 12/12, P2 18/18, routing 13/13, store assistant 183/183.
- `tsc --noEmit` and `next lint`: **0 errors**.

## Storefront UI fixes (2026-11-19): footer, filters, hero banner, product-page sections - awaiting approval

Production runs **`b187bc8`** (Vercel READY 2026-11-18 13:09; it contains P0-P2 and the 2026-11-18 slider/product fixes). Everything below is **local only**: tested, not committed, not deployed.

| # | Root cause (traced) | Fix |
|---|---|---|
| 1 Footer | All 3 stores' footer menus are **flat** links. `MultiColumnFooter` (and the classic `Footer`) turned **every link into a column heading** with an empty list, so headings looked scattered. There was also a hardcoded "English (US)" pill, and no contact info. | `groupFooterMenu` (`lib/nav/footer-groups.ts`) groups plain links into **Shop** and **Customer care** columns; items with sub-links keep their own column. The redesigned footer has a brand column (logo, description, social links), link columns with headings, a **Contact** column (Settings → General address/email/phone, only filled ones), the newsletter (Customizer switch) and a copyright/payment bar. It is responsive (2 columns on phones, up to 12-col grid on desktop) and uses theme colours. The classic footer uses the same grouping. |
| 2 "What's trending now" filters | `TabFilters` printed `${min}$ - ${max}$` with a fixed **1-500** range, plus demo colours/sizes (`lib/filters/constants.ts`); `SidebarFilters` also had demo categories ("Clothing", "Footwear"). The category tabs were all DB categories, including ones with **no products**. On the homepage the Filter panel only changed the URL - **nothing was filtered**. | `getFilterFacets()` makes one lean, cached read of the store's active products and yields colours, sizes, price range and categories-with-products (`lib/filters/facets.ts`). Prices are shown in the **store currency** (`useFormatMoney`). A filter with no values is hidden; with no options at all, there is no Filter button. Collection/search/collection-2 show only categories that have products. The homepage grid shows tabs only for categories present in that section, and the URL filters are now applied to the grid (`applyClientFilters`). |
| 3 Hero banner | `FullWidthImageHero` forced a fixed height (`heightPx`, 400) with `object-cover`, so banners with text in the image were cropped. It also always drew `rounded-3xl` + a border while rendered edge-to-edge. | New default `banner.imageFit = "full"`: the whole image at its own aspect ratio (slides share one grid cell, so there is no fixed height and no cropping), with mobile images still used on phones. `"cover"` (the old fixed height + focal position) is optional. `banner.rounded` defaults to **off**; when on, the banner is inset in the container. Customizer → Hero gains **Image Display** and **Rounded corners** controls. Saved banner settings/images are untouched. |
| 4 Product-page section | The block in the screenshot is the built-in **"Special Offer Banner"** (`sec-prod-promo`). It showed the installer's sample **Promo Banner 2 "Beauty Essentials"**, whose image is `/images/placeholder.png` (the empty frame), plus a `<Logo>` with no props, which renders "STORE". It could be toggled in the Customizer but **not edited**: the inspector only opened for homepage sections, and the product page ignored the section's config and order. | The product page now renders `productPageSections(theme.productDetail)`, i.e. the built-in promo **plus merchant-added sections in Customizer order**, through the shared section renderer. Section edits (heading, text, image, button, promo slot) apply; the default stays slot 2. The Customizer opens inspectors for product-page sections and saves them to `productDetail.sections`. Related products, reviews and recently viewed stay in the product page (related: toggle/reorder only, its content is computed). A placeholder image counts as "no image" everywhere (text-only promo) and is labelled as sample in Admin; the "STORE" logo was removed from promos. |

**Behaviour change to note:** the product-page promo now uses the store's theme promo style (e.g. the Luxe design on Glamix and Hafiz Traderz), the same as their homepage promos. Zyvora (generic) looks the same as before.

### Files
- **New:** `src/lib/nav/footer-groups.ts`, `src/lib/filters/facets.ts`, `src/lib/images/real-image.ts`, `scripts/test-storefront-ui.ts`.
- **Footer:** `MultiColumnFooter.tsx` (rewritten), `ThemeFooterAdapter.tsx`, `shared/Footer/Footer.tsx`, `ClientProviders.tsx`, `layout.tsx`, `theme-customizer-preview/{page,PreviewRuntime}.tsx`.
- **Filters:** `TabFilters.tsx`, `SidebarFilters.tsx`, `HeaderFilterSection.tsx`, `HeaderFilterSearchPage.tsx`, `SectionGridFeatureItems.tsx`, `collection/CollectionPageView.tsx`, `app/collection-2/page.tsx`, `app/search/page.tsx`, `repositories/products.ts` (`getFilterFacets`).
- **Hero:** `FullWidthImageHero.tsx`, `HeroSectionInspector.tsx`, `types/theme.ts`.
- **Product page:** `lib/theme/page-sections.ts`, `collection/ExtraPageSections.tsx`, `app/product/[slug]/page.tsx`, `ProductDetailClient.tsx`, `RelatedRailsAndReviews.tsx`, `Luxury/Minimal/BoldProductDetail.tsx`, `CustomizeShell.tsx`, `HomeContent.tsx`, `SectionPromo1/2.tsx`, `storefront-queries.ts`, `seed-content.ts`.
- **Tests:** `test-p2.ts` updated for the new product-promo flow; `test-slider-responsive.ts` now runs the cover tests with `imageFit: "cover"` and adds a default whole-image test.

### Tests (2026-11-19)
- `test-storefront-ui.ts` **11/11**; `test-slider-responsive.ts` **8/8**.
- All other suites pass: P0 22, P1 12, P2 18, targeted 6, routing 13, Store Assistant 183, and the rest.
- `tsc`, `next lint` and `next build` pass.
- **Browser: not verified** (local only, no authenticated session).

### Browser checklist (after deploy)
1. Zyvora footer shows **Shop / Customer care / Contact** columns; check phone width.
2. "What's trending now": prices in Rs, only categories that have products, and the Filter panel changes the grid.
3. Hero: whole image visible on desktop and mobile, no odd corners. Try Customizer → Hero → "Fill a fixed height" and "Rounded corners".
4. Customizer → Product page → click **Special Offer Banner**: edit heading/image → Save → the product page shows it. Reorder it against an added section. Turn it off → gone.

## Targeted fixes (2026-11-18): product slider + product creation - awaiting approval

### 1. Product image slider "regression"
- **Not a code regression.** The slider (thumbnail strip + prev/next + counter) was added in commit `af3b088` ("Fix product paeg"), and that commit **is** the current production deployment (Vercel production, READY, 2026-11-17 17:29 PKT).
- **Root cause:** the slider was wired **only into the Luxury product-page design** (`ProductGallery layout="thumbnails"`). Minimal, Bold and the default design still used the old 2-image grid.
- **Zyvora Hub's theme changed after that deploy.** At 2026-11-17 15:01 UTC (`themeSettings/active` and `/draft`), its preset changed from Premium Luxury to **Modern Minimal**, whose product page uses the **Minimal** design. Most likely this was the Theme Catalog's Switch/Reset.
- **Live evidence (read-only HTTP fetch):**
  - Hafiz Traderz `/product/steel-bucket` (3 images) has arrows + 3 thumbnails, so the slider is live.
  - Zyvora's 5-image product shows the old grid.
  - Glamix only has single-image products, so there is nothing to slide.
- **Fix:** the same, unchanged `ProductGallery` slider is now used by Minimal, Bold and the default design. In Bold, the wishlist/compare buttons move beside the thumbnail strip on desktop. Luxury is unchanged.
- **Decision for you:** if Zyvora's switch to Modern Minimal was unintended, re-apply Premium Luxury in Appearance → Theme Catalog. That would also restore its Luxe hero/promo/category designs. No data was changed here.

### 2. Product creation looked like "nothing happened"
- **Real outcome:** creation **works**. For example, Zyvora's `test-product-from-admin` was saved on 2026-11-18 06:41 UTC (read-only check).
- **Causes:**
  1. **Navigation looked like no change.** After saving, the form navigated to the product's *edit* page, which is the same form pre-filled with the same data, and no success message was shown.
  2. **The button re-enabled too early.** `finally { setSubmitting(false) }` re-enabled the button before the navigation finished, so a second click created **another identical product**. Hafiz Traderz has **3 active products with the slug `steel-bucket`**, all created in the same minute; the storefront can open only one of them.
  3. **Errors were invisible.** A failure was *thrown* from the Server Action, and Next.js hides thrown messages in production builds. The error box also sits at the top of the form while the button is at the bottom.
- **Fix:**
  - `createProductAction` returns `{ ok, id } | { ok: false, error }`. Merchant-fixable reasons (negative numbers, duplicate slug) are shown; internals become a generic message and go to the server log. Next.js redirect/notFound (e.g. an expired session) still propagates.
  - `createProduct` refuses a slug already used by a non-deleted product in the same store.
  - The form takes a synchronous submit lock and keeps the button disabled after success. It then shows a **"… was created."** toast and goes to **Products** (the new product is in the list).
  - On error it shows a toast, scrolls to the error box, and **keeps all entered data**.
- **Not changed:** the Firestore document written, variants, images, edit/update logic. The existing duplicate `steel-bucket` products were **not** touched; the merchant can delete the extra ones in Products.

### Files changed
- `src/components/theme/variants/product-detail/MinimalProductDetail.tsx` - slider.
- `src/components/theme/variants/product-detail/BoldProductDetail.tsx` - slider and button position.
- `src/app/product/[slug]/ProductDetailClient.tsx` - slider.
- `src/lib/products/product-save.ts` - new: result type, safe errors, duplicate-slug message, redirect passthrough.
- `src/app/(admin)/admin/(protected)/products/actions.ts` - `createProductAction`, duplicate-slug guard, `ProductInputError`.
- `src/app/(admin)/admin/(protected)/products/ProductForm.tsx` - lock, result handling, toasts, navigation.
- `scripts/test-targeted-bugs.ts` - new.

### Tests
- `scripts/test-targeted-bugs.ts` **6/6**. This includes server-rendering the gallery: arrows, counter, one thumbnail per image, nothing for single-image products, and a variant image shown first.
- All other suites pass: P0 22, P1 12, P2 18, routing 13, Store Assistant 183, product page 5, and the rest.
- `tsc`, `next lint` and `next build` pass.

### Local vs live
| Change | Implemented locally | Tested locally | In production deployment | Verified in live browser |
|---|---|---|---|---|
| Luxury slider (`af3b088`) | yes | yes | **yes** (production = `af3b088`) | live HTML checked: Hafiz shows arrows + 3 thumbnails |
| Slider on Minimal/Bold/default (today) | yes | yes (unit/render + build) | **no** | no |
| Product create fix (today) | yes | yes (unit/static + build) | **no** | no |
| P0, 3B, P1, P2 | yes | yes | **no** - all uncommitted in the working tree (223 changed paths; production is still `af3b088`) | no |

**Next steps (need your permission):**
1. Commit and push.
2. Vercel deploys.
3. Check a multi-image product on Zyvora and Hafiz (arrows, thumbnails, mobile swipe-free tap navigation).
4. Create a product in Admin: expect the toast, then the list; a double click creates only one; a duplicate slug shows a clear error.

## P2 - completed (Phase 5)

| # | Item | Result |
|---|---|---|
| A | About page | `/about` = Store Admin → Pages, slug `about` (published, this store). No page → 404 and the About links are hidden in header/footer (live store **and** Customizer preview; the admin menu editor still sees them). Fabricated founders/statistics/copy removed. No About content was created. |
| B | Blog | `/blog` lists this store's posts; new `/blog/[slug]` with SEO metadata. Public = **Active and published date reached**; drafts, inactive, future-dated and other stores' posts are 404. Plain-text body (no HTML). Empty → clean empty state; homepage blog section hidden. Demo cards/ads/widgets removed; `/blog-single` → `/blog`. |
| C | Customer accounts | No customer auth exists (guest checkout). `/login`, `/signup`, `/forgot-pass` show a clear "accounts not available" page with Track order; `/account`, `/account-billing`, `/account-password` → `/account-order`. Fake identity ("Eden Smith", "Enrico Cole") and "Log out" removed; header menu = Track Order, Wishlist, Dark theme, Contact. Store Admin / Super Admin auth untouched. |
| D | Testimonials | `isSeedTestimonial` (exact name+text match against every preset's seed list). Unchanged samples hidden on the storefront, labelled **"Sample – hidden on storefront"** in Admin; editing makes them real. No demo reviewers, stock face photos or assumed 5-star ratings; section hidden when empty. Product reviews are separate and unchanged. No records changed. |
| E | Homepage & promos | Every section renders only tenant data and hides when empty (see source table). Removed: demo hero slides, the `theme-assets.ts` stock-photo/copy library, fake products/prices in heroes, fake trust badges, demo promo copy/images, fake category counts, gift-card/"80% off" tiles, How-It-Works demo steps, demo gallery photos, invented statistics. Promo slots on product/collection/search/contact pages now use the store's real promo banner (or nothing). Seeded banners/FAQs/products **kept** (decision) and labelled in Admin. |
| F | Demo routes | `/home-2` → `/`; `/product-detail`, `/product-detail-2` → `/collection`; `/blog-single` → `/blog`; `/subscription` → 404. `/collection-2` kept as a real product listing (menus link to it) with template heading/demo sections removed. `/compare` kept (real data). All real commerce routes unchanged. |
| G | Store-wide audit | Reproducible: `scripts/audit/storefront-content-scan.py` (292 → 33 hits, all remaining classified as platform UI/decorative/comments) + `scripts/audit/reachability.py` (import graph from Next entry points). File-by-file inventory below. |
| H | Store Assistant | About/Pages (URL rules), Blog visibility, guest-only accounts (new entry), sample testimonials/FAQs/banners, promo slots, social links, homepage data sources; page-not-showing troubleshooting. 183/183 tests. |

### Genuine bugs found and fixed during P2 (not only demo content)
- **safeQuery cache keyed without arguments** (pre-existing, platform-wide): the 30s in-memory cache key was tenant+label only, so e.g. any `/blog/{slug}` returned the first slug requested, promo slots got hero banners, one product's reviews/related products could show on another, filters/pages returned stale results, Admin → customer page could show another guest's orders, and requests without a tenant header shared one cache across stores. Now caching is **opt-in** with the arguments in the key and never without a tenant; public storefront reads opt in, everything else is uncached.
- **Category cards linked to `/collection/{id}`** (no such route → 404) in the live Luxe categories section and others; now `/category/{slug}`.
- **Product page promo** always showed a demo promo ("Exclusive Offers & Special Deals"); collection/search/contact pages showed a demo promo with jewellery copy; `FREE SHIPPING ON ALL ORDERS` flashed on every page load before the real announcement loaded; ProductCard/TrendGlass cards showed fake **4.8/4.9** ratings; Avatar showed a stock photo of a stranger for every reviewer without a photo; FooterSocials linked to generic facebook.com/x.com when no links were set; "@GlamixStore" was shown on every store; product JSON-LD hardcoded `PKR`.
- **Blog list + limit** (found by the new emulator test): a future-dated post could use up the limit and hide published ones - the date filter is now in the query.

### Store Admin source for each dynamic section
| Storefront section / page | Source (Store Admin) | Empty → |
|---|---|---|
| Hero slider | Content → **Hero Slides** (banners, placement `hero`, active + schedule) | hero hidden |
| Promo 1/2/3 (homepage) | Content → **Promo Banners** (`promo1/2/3`) or the section's own heading/image (Customizer) | section hidden |
| Promo on Shop / Search / Contact | Promo Banners `promo1` | nothing |
| Promo on product page | Promo Banners `promo2` + Customizer → Product Page → Promotional Deals Banner | nothing |
| On Sale / Best Sellers / New Arrivals / Featured / Large slider / Trending grid | Catalog → **Products** (flags or manual picks in the section) | section hidden |
| Shop by Category / Explore grid | Catalog → **Categories** (real product counts when enabled); cards link to `/category/{slug}` | section hidden |
| Discover More / How It Works / Social Gallery | Customizer → that section's **tiles** | section hidden |
| Brands | Catalog → **Brands** | section hidden |
| Testimonials | Content → **Testimonials** (active, not an unchanged sample) | section hidden |
| Blog section, /blog, /blog/[slug] | Content → **Blog Posts** (Active + published date) | section hidden / empty state / 404 |
| /about | Content → **Pages**, slug `about`, Published | 404 + links hidden |
| /faq | Content → **FAQs** (samples labelled in Admin, still shown) | "No FAQs published yet." |
| Announcement bar | Content → **Announcements** | nothing |
| Popup | Appearance → **Popups & Modals** (only filled fields) | not shown |
| Social icons (footer, contact, mobile menu, top bar) | Settings → **Social** (https links only) | no icons |
| Contact details | Settings → **General** (address, email, phone) | row hidden (never `support@example.com`) |
| Footer description / Shop page subtitle | Customizer → Footer / Shop page | hidden |
| SEO description fallback | Settings → SEO; otherwise neutral "Shop online at {store}." | - |

### Seeded database records (kept, NOT changed - reported separately from code fallbacks)
| Record | All 3 stores | Treatment |
|---|---|---|
| Testimonial "Jordan Smith – Great products and excellent customer service." | yes | hidden on storefront until edited; Admin label |
| Hero/promo banners with Unsplash stock photos ("New Season Collection 2026", "Exclusive Minimalist Essentials – Up to 40% off", "New Arrivals in Jewelry", "Beauty Essentials" …) | yes | **shown** (decision); Admin label "Sample content – please review" |
| Sample FAQs (shipping/return example answers) | yes | **shown** (decision); Admin label "Sample – review policy text" |
| Demo products / categories / brands from the installer | yes | unchanged (merchant-managed records) |
| Homepage section tiles (How It Works, Discover More, Gallery items) saved in each store's sections | yes | shown as saved by the merchant/installer (database content, editable in Customizer) |

### Inventory - code-level demo / hardcoded content (file by file)
Class: 1 platform UI text · 2 merchant-controlled · 3 database-driven · 4 neutral empty state · 5 demo/fabricated.
| File | Finding | Class | Action |
|---|---|---|---|
| app/about/page.tsx + SectionFounder/SectionStatistic/SectionHero | invented copy, founders, statistics | 5 | replaced by Pages `about`; 3 files deleted |
| app/blog/* (Card3, Card3Small, SectionAds, SectionLatestPosts, Widget*) | fakeData titles/images, demo ads | 5 | deleted; Card12/13 require real posts |
| app/blog-single, home-2, product-detail(-2), subscription | template pages (fake product, prices, pricing plans) | 5 | redirect / 404 (Policy.tsx deleted) |
| app/collection-2 | "Man collection" + template copy, demo bottom sections | 5 | neutral heading, sections removed |
| app/login, signup, forgot-pass, (accounts)/* , Header/AvatarDropdown | forms posting to `#`, fake identities | 5 | unavailable page / redirects / guest menu |
| app/HomeContent.tsx | undefined→demo fallbacks; fallback sections with Unsplash/gift-card/"80% off"/"Worldwide delivery" | 5 | sections hide when empty; fallback list data-only |
| lib/theme/theme-assets.ts | per-preset stock photos + invented copy ("Save 20% off…") | 5 | deleted |
| theme/variants/heroes/* (5) | demo slides, fake product "Silk Couture Trench Coat 1490", trust badges, "Free Shipping over $50", "UP TO 40% OFF", fake tech category sidebar | 5 | banner data only; tech sidebar = real categories |
| theme/variants/promos/* (4), SectionPromo1/2/3 | demo copy/images, fake newsletter form, "Freeship / Savings combos" | 5 | banner data only; hidden without banner |
| theme/variants/categories/* (4), CardCategory2/4 | fake counts, stock photos, links to non-existent `/collection/{id}` | 5 | real categories + `/category/{slug}` |
| SectionGridMoreExplore (+data.ts), SectionSliderCategories, CardCategories/data.ts, CardCategory1/3 | demo departments/tiles, random tag names | 5 | removed |
| SectionHowItWork, SectionSocialGallery, DiscoverMoreSlider | demo steps/photos/tiles, "@GlamixStore" | 5/2 | removed / merchant data only |
| SectionClientSay (+data.ts) | demo reviewers, stock faces, default 5★ | 5 | real testimonials only |
| ReviewItem, Avatar | "Cody Fisher" review, stock avatar, "John Doe" | 5 | removed; initials |
| AccordionInfo | "Belgian power micromesh", 30-day returns | 5 | removed (data required) |
| ProductCard, TrendGlassCard, DealCard | fake 4.8/4.9 rating, "Trending luxury item", "High quality product" | 5 | real values only |
| CollectionCard(2) | fakeData images, "Product Name", "/product-detail-2" | 5 | product data / placeholder |
| AnnouncementBar | "FREE SHIPPING ON ALL ORDERS" fallback | 5 | removed |
| ThemePopupModal | "Special Offer", "Claim Offer" → `#` | 5 | merchant fields only |
| checkout/CheckoutClient | "100% Guaranteed Delivery" | 5 | "Secure checkout" |
| layout.tsx | SEO fallback "Fast shipping, easy returns" | 2 | neutral |
| product/[slug]/page.tsx | "Quality guaranteed", `priceCurrency: "PKR"` | 2 | neutral / store currency |
| footers/MultiColumnFooter | invented store description | 2 | Customizer value or hidden |
| collection/CollectionPageView, search, contact | demo promo/slider; "support@example.com"; "not set yet" rows; demo social `#` links | 5/2 | real banner/featured; filled rows only; store's social links |
| SocialsList, SocialsList1, FooterSocials | `#` / generic facebook.com links | 5 | store's own links via context |
| order-tracking | "Standard Delivery Service" | 1 | "Store delivery" |
| contains/fakeData.ts, data/data.ts, SectionRegistry, DiscoverMoreGrid, SectionHero(1-3), SectionVideos, SectionSliderLargeProduct2, PostCardMeta(V2), Comment, Tag, Header/Header, MainNav2, TemplatesDropdown, ProductQuickView2, Notify/Lang/Currency/DropdownCategories | demo data / unreachable template code | 5 | deleted after reachability check |

**Remaining (kept on purpose):** section heading defaults ("What People Are Saying", "Shop by Category", "Chosen by our experts" – merchant-editable labels, class 1); newsletter labels (class 1, newsletter works); input placeholders like `you@example.com` (class 1); decorative SVG backgrounds/quote marks, 404 illustration (class 1); sort options (class 1); `StoreDeliveryInfo` text built from Shipping/Payment settings (class 3); "No FAQs published yet." etc. (class 4); merchant HTML in CMS pages / Discover tile subtitles (merchant-authored, class 2). 45 unreachable template utilities without fabricated content (NFT/listing-gallery helpers etc.) are listed by `reachability.py` for a later cleanup.

### P2 tests (2026-11-18)
- `scripts/test-p2.ts` **18/18**; `scripts/test-p2-emulator.ts` **5/5** (local emulator, refuses unless localhost + `demo-p0`).
- Regression: P0 22/22 + 12/12 (emulator), P1 12/12 + 4/4 (emulator), routing 13/13, Store Assistant 183/183, all other suites pass.
- `tsc`, `next lint`, `next build` pass.
- **Browser: not performed** (no authenticated session). Production data: no writes (reads only from the earlier backup file).

### P2 browser checklist
1. Each store's header/footer: no "About" link (no about page). Create a Published page with slug `about` in a test store → link appears, `/about` shows it; unpublish → 404 and link gone; same in Customizer preview.
2. Blog: publish a post (Active, today) → `/blog` + `/blog/{slug}`; untick Active or set a future date → 404 and gone from the list/homepage.
3. Homepage on Glamix/Hafiz/Zyvora: hero shows the stores' own slides; Testimonials section is gone (only the sample exists); edit the sample in Admin → it appears.
4. Category cards open `/category/{slug}` (not a 404).
5. Product page: promo block only if a Promo Banner 2 exists; no "4.8" rating on cards without reviews.
6. `/login`, `/signup` show the accounts-not-available page; the person icon menu has no name/Log out.
7. `/home-2`, `/product-detail`, `/blog-single` redirect; `/subscription` is 404; menu "Best Sellers" (`/collection-2`) lists real products.
8. Admin → Testimonials / Hero Slides / Promo Banners / FAQs show the sample labels.

### Remaining risks / decisions (P2)
- Seeded stock-photo banners and sample FAQs stay visible on all 3 storefronts until merchants edit them (approved). Consider a one-time merchant notification.
- Installer still seeds demo products/categories/banners/FAQs/testimonials for **new** stores (unchanged; P3 candidate: stop seeding, or seed clearly marked drafts).
- `layout` now reads the `about` page on every storefront request (1 small query, uncached).
- Removing the wrong safeQuery caching means more Firestore reads on uncached paths (correctness over the old shared cache); public hot paths still cache with arguments.
- Dead template utilities remain (no fabricated content); cleanup can be a later task.

## P1 - completed (Phase 4)

| # | Item | Result |
|---|---|---|
| A | Order email reliability | The email no longer reports success when it fails or isn't configured. The real status (`sent / failed / not_configured / no_recipient / disabled / pending`) is saved on the order and shown in Admin → order → **Customer Messages**. Order creation is unchanged and never depends on email. Provider errors are only logged as an HTTP status. WhatsApp follows the same rule (no more fake "success"). |
| B | Contact inbox | New **Sales → Messages** (`/admin/messages`): list, Unread filter, full message, read/unread, mark all read, safe mail reply. Store id always comes from the session, and the `storeId` field is re-checked on every read and write. Existing submissions are untouched (no `read` field = unread). The contact form gained length limits and a rate limit. |
| C | Notification settings | **Email** switches the order email. **WhatsApp Alerts** switches automatic WhatsApp (off by default) and shows **Not configured** without a platform gateway. **Push** and **SMS** are disabled and marked **Not available**. **SMTP** is marked **Not available**. Stored values are not modified. |
| D | Email templates | **Order Confirmation** is connected: its on/off switch and subject (`{{storeName}}`, `{{orderNumber}}`) are applied. The default equals the old subject exactly, so current emails look the same. The other templates are marked **Not available**. Delivery is reported accurately (A). |
| E | Payment proof | Implemented, free, using the existing Cloudinary. Customers upload from the checkout confirmation or Order Tracking (order number + checkout email/phone, rate-limited). The file type is checked from the bytes, the image is re-encoded with sharp, and it is stored as a **private** asset in the store's folder, max 3 per order (transactional). Admins view it via a 10-minute signed link. The marketing claim is now true; one sentence was made precise. |
| F | Domain banner | The panel now says whether Vercel is really connected and what Re-verify checks. Re-verify shows the provider's actual result. Verification logic is unchanged. |
| G | Branding duplicates | The unused free-text logo, favicon and loading-logo URL fields are replaced by a read-only view of the Customizer logos plus a link. A legacy value can be copied **only into an empty theme slot**. No store has legacy values (verified read-only in Phase 3B). |

### P1 decisions / notes for you
- **Order email colour:** order emails read their colour from the legacy `themes` doc, which
  is empty for every store, so all emails are indigo.
  - The logo now comes from the Customizer.
  - The colour was **left unchanged** to keep today's look.
  - Switching it to the store's Customizer primary colour is a one-line change. It would
    make, e.g., Luxury stores' emails black. Your call.
- **WhatsApp Alerts default:** automatic WhatsApp now respects the toggle, which is off by
  default. No gateway is configured, so nothing changes in practice. Hafiz Traderz already
  has it on.
- **Cloud uploads not exercised live:** the payment-proof upload to Cloudinary and the signed
  view link were **not run against the real Cloudinary account**, because that would write to
  production storage.
  - They are covered by code review and by tests of every rule around them.
  - The first browser test on a test order will confirm them.
- **Signed link contents:** the signed proof link contains the Cloudinary *API key* (a public
  identifier) and a signature, never the API secret. It expires after 10 minutes.

### P1 tests (2026-11-17)
- **Automated:**
  - `scripts/test-p1.ts`: 12/12 (mocked providers).
  - `scripts/test-p1-emulator.ts`: 4/4 on the local emulator. Covers inbox isolation, proof
    attach isolation, COD/paid refusal and concurrent-upload limit.
  - P0 tests still pass: 22/22 and 12/12 (emulator).
  - Routing: 13/13.
  - Store Assistant: 179/179.
  - All other suites pass.
  - `tsc`, `next lint` and `next build` pass.
- **Browser:** not performed. There is no authenticated session in this environment.

### P1 browser verification checklist
1. **Order email:** place a test order with an email. The order page → **Customer Messages**
   shows Sent, Failed or Not configured. Turn off Email Templates → Order Confirmation, place
   another order, and it shows "Turned off".
2. **Payment proof, upload:** place a bank-transfer order, upload a screenshot on the thank-you
   page, then again from Order Tracking.
   - A PDF or SVG is rejected.
   - A 4th upload is refused.
3. **Payment proof, admin view:** in Admin → order → Payment Proof → **View**, the image opens.
   The link stops working after 10 minutes. No public Cloudinary URL works for it.
4. **Messages:** send a Contact form message. It appears in **Sales → Messages** as unread;
   open it, then mark it unread. Log into another store's admin: the message is not there.
5. **Settings → Notifications:** Push/SMS are disabled; WhatsApp shows "Not configured".
6. **Settings → Branding:** shows the Customizer logos and a link. There are no URL fields.
7. **Super Admin → store → Domains:** the banner describes Vercel. Re-verify shows the real
   result message.

### Remaining risks / follow-ups (P1)
- **Messages inbox:** lists up to 500 messages per store (equality query, sorted in memory).
  A store beyond that needs a `storeId+createdAt` index and paging (index deploy needs your
  approval).
- **Email failures:** a failed email is shown but there is no "Resend email" button yet.
- **Old `paymentProofUrl` field:** no proof screenshots exist from before this change (the
  feature didn't exist); `paymentProofUrl` on the type stays unused.
- **reCAPTCHA:** still saved-only (it was out of P1's notification scope). The Store
  Assistant states this.
- **Clone images:** copying Clone Store images into the destination folder remains a
  separate task, per decision 1.
- **Multi-tab Customizer:** draft conflict protection remains a tracked follow-up, per
  decision 2.

## P0 - completed

| # | Item | Result |
|---|---|---|
| A | Customizer Publish non-destructive | Transactional upsert by stable id. `createdAt`/extra fields kept. Deletes only sections removed in the Customizer. Baseline-based conflict detection. Stale or empty drafts without a baseline are blocked. A conflict banner offers "Load live sections" or "Publish anyway". |
| B | Old homepage editors | `/admin/homepage` and `/admin/appearance/homepage` redirect to `/admin/appearance/customize`. Neither page has a write path left. |
| C | Logos | Favicon, Apple touch icon and loading logo are in Customizer → Header & Navigation. Loading screen uses `loadingLogo`. Onboarding writes `themeSettings` (changed keys only). `/admin/theme` redirects. |
| D | Clone Store | Copies `themeSettings/active` and `/draft` without logos, section staging or timestamps. Writes only to the new store. No auth, customer, order or payment data is copied. |
| E | Newsletter isolation | Per-store doc ids `{storeId}__{email}`. Legacy email-keyed docs are kept and reused by their own store. No migration. |
| F | Theme Catalog logo safety | Reproduced the `logos: {}` wipe in the emulator. Prevented it in two places: `stripEmptyObjects` on theme writes, and `withoutMerchantAssets` when applying presets. Regression tests added. |

## Phase 3B - completed

### 1. Popups draft overwrite - fixed
- **Root cause:** `PopupsBuilderClient` saved `{...draftTheme, popup}`, a page-load snapshot
  of the whole draft with preset defaults merged in. As a result:
  - **Save Draft** overwrote newer unpublished Customizer changes, including the section
    copy and baseline.
  - **Publish** published every other unpublished draft change.
  - **Reset Draft** reset the whole draft.
- **Fix:** the page now receives and sends only the popup.
  - New `savePopupDraftAction`, `publishPopupAction` and `resetPopupDraftAction` call
    `applyPopupOperation` (`lib/theme/theme-popup.ts`).
  - Each runs in a transaction and changes only the `popup` field and `updatedAt`.
  - `popup` is replaced as a whole value, so cleared fields really go away.
  - A missing draft is started from the live theme.
- **Tests:** 4 emulator tests:
  - newer Customizer edits survive Save;
  - Publish puts only the popup live;
  - Reset touches only the popup;
  - a store with no draft gets a full draft, not a partial one.
  
  One static test checks that the page no longer uses the whole-draft actions.
- **Not changed:** the Customizer has its own "Promo Popup" tab. If the Customizer is open in
  another tab with older state and is saved, it can still overwrite a popup saved here. This
  is general multi-tab editing of the draft, not specific to this page.

### 2. Clone Store references - investigated (behaviour unchanged)
Cloning copies `siteSettings/general`, `homepageSections` (new ids), `menus/header|footer`,
`pages` and (since P0) `themeSettings/active|draft`. It does **not** copy products,
categories, brands, collections, banners, testimonials or blog posts.

| Reference | Where | What happens in the clone | Recommendation |
|---|---|---|---|
| `config.productIds` | product sections, manual mode | Ids from the source. `getProductsByIds` is tenant-scoped, so it returns nothing and the section is empty. | Products aren't cloned, so there is nothing to remap to. **Recommend:** on clone, switch manual sections to `mode:"auto"` and drop the ids. |
| `config.categoryIds` | exploreGrid/collections/onSale | Same: tenant-scoped `getCategoriesByIds`. Glamix's `onSale` has a stale `categoryIds` but runs in `auto` mode, so it is unused. | Same as above. |
| `config.brandIds`, `testimonialIds`, `postIds`, `bannerIds` | brand/testimonial/blog/banner sections | Tenant-scoped (`tenantCollection` or `where storeId == tenant`), so they resolve to nothing. | Same as above. |
| Hero/promo banners | `banners` collection | Not copied, so the clone has no hero/promo banners. | Decide whether clone should copy banners. |
| `href` values | tiles, buttons, menus | Relative paths (`/collection`, `/collection-2`, `/search`, `/about`, `/pages/faq`). They work in the clone. Category or collection slug links would 404 because categories aren't copied. | Keep relative paths. `/collection-2` is a demo template page (later decision #2). |
| Image URLs | section configs, `themeSettings` (e.g. Glamix `popup.imageUrl` = `…/glamix/banners/…`) | Copied as-is, so they **point into the source store's Cloudinary folder**. Deleting the source store (`deleteAllByPrefix("{slug}/")`) would break those images in the clone. | **Main remaining risk.** Copy the assets into the clone's folder, or drop store-owned image URLs on clone. Needs a decision. |
| `siteSettings/general` | store contact/SEO | Copied; `storeName`/`storeEmail` are replaced. Phone, address and SEO text stay the source's. | Consider clearing contact fields. |

**Tenant isolation verified (code):** every resolver above reads only the current tenant's
data, so a clone can never display source-store records. No cross-tenant read was found.

### 3. Logo backup review - nothing to recover
- **Read-only comparison of current production with the P0 backup**, for all 3 stores ×
  `themeSettings/active|draft|preview`: identical.
  - Every doc has `logos: {}` (Hafiz preview: no doc).
  - No `footer.footerLogo`.
  - `siteSettings/branding` has no `logoUrl`/`faviconUrl`/`loadingLogoUrl`.
  - No legacy `themes` docs.
- **Older backups** (`2026-11-01/themes-CURRENT…`, `themes-BEFORE-neutralize-2026-10-31`):
  no logo values either.
- **Conclusion:** no backup holds a logo value, so nothing can be restored from backups.
  Nothing was restored or modified.
- **Possible recovery source (not done; needs approval):** logos uploaded through the theme
  uploader go to Cloudinary `{slug}/themes/logo/` (favicons into a `favicon` subfolder). If
  a merchant uploaded a logo that was later wiped, the image may still exist there.
  - A read-only Cloudinary listing of those folders would show this.
  - The merchant would then re-select the image in Customizer → Header & Navigation, so no
    data write is done by us.

### 4. Routing test - outdated expectation, test corrected (no routing change)
- `buildTenantAdminUrl` intentionally generates `admin-{slug}.ROOT_DOMAIN`. Evidence:
  - it carries a single-level wildcard SSL comment;
  - the middleware's `/admin` redirect uses the same form;
  - `hostname.ts` parses `admin-`;
  - the assistant docs use it.
- The test still expected `admin.{slug}`, which is still *parsed* for compatibility.
- The test also expected an unverified custom domain to be used. `getActivePrimaryCustomDomain`
  deliberately uses a custom domain only when it is primary, DNS-verified and SSL-active.
  `test-custom-domains.ts` checks the same rule.
- **Test changes:**
  - Expects `admin-glamix.webriiz.com`.
  - New test 5b: `admin-glamix` parses as tenant admin.
  - Custom domain checked in both states: pending → platform URL, live → `glamix.pk`.

## Backup
- `/Users/macbook/Documents/ECOM/webriiz-theme-backups/2026-11-17-p0/p0-config-backup.json`
  (chmod 600). Read-only export from before any P0 code change.
- Earlier backups: `/Users/macbook/Documents/ECOM/webriiz-theme-backups/2026-11-01/`.

## Tests (2026-11-17, after Phase 3B)
- **Automated:**
  - `test-p0-safety.ts`: 22/22.
  - `test-p0-emulator.ts`: 12/12, against the local Firestore emulator only (`demo-p0`).
  - `test-routing-resolution.ts`: 13/13.
  - Store Assistant: 176/176.
  - Every other `scripts/test-*.ts` passes.
  - `tsc`, `next lint` and `next build` pass.
- **Production:** read-only reads only (logo comparison). No writes.
- **Browser:** not done. There is no authenticated admin session in this environment. See
  the checklist below.

## Browser verification checklist (needs an admin login, on a test store or with care)
1. **Customizer:**
   - Edit a section title, reorder two sections and add one.
   - Click Save Draft, refresh, then Publish Live.
   - The storefront shows the changes and the other sections are unchanged.
2. **Conflict:**
   - Open the Customizer in two tabs. Publish a section change in tab 1.
   - Publish from tab 2. Expect the conflict banner and no change.
   - Click "Load live sections".
3. **Logos:**
   - In Header & Navigation, upload a favicon, Apple touch icon and loading logo, then
     Publish.
   - The browser tab icon changes after a refresh.
   - Apply a design in Theme Catalog. The logos stay.
4. **Popups:**
   - Change a colour in the Customizer and click Save Draft only.
   - Open Appearance → Popups & Modals, change the title, then Save Draft and Publish Live.
   - The popup is live, but the colour is **not** live and is still in the Customizer draft.
   - Reset Draft affects only the popup.
5. **Old routes:** `/admin/homepage`, `/admin/appearance/homepage` and `/admin/theme` open
   the Customizer.
6. **Onboarding:** in `/admin/onboarding` → Logo & favicon, upload a logo. It appears in
   Customizer → Header & Navigation.
7. **Newsletter:** subscribe with the same email on two stores. Each store's Analytics count
   includes it.

## Remaining risks / follow-ups
- **Clone Store:** images point into the source store's Cloudinary folder, and manual-mode
  section ids become empty (see table above). Needs a decision before changing clone.
- **Multi-tab draft editing:** the Customizer saves its whole in-memory draft, so two open
  editors can overwrite each other's unpublished draft changes. Live homepage sections are
  protected by the P0 conflict check.
- **Unused legacy code:** the old editor client components (`ThemeEditor.tsx`,
  `HomepageBuilderClient.tsx`, `theme/actions.ts`) are no longer reachable from any page.
  They can be removed later.
- **Settings → Branding:** the "Favicon URL / Loading logo URL" fields are still not used by
  the storefront.

## Approved decisions for later phases (not implemented yet)
1. Shipping: no global price change. Each store controls its own shipping, and Store Admin
   warns when settings are missing or incomplete. Existing values are kept.
2. Unused demo/template pages return a 404 or redirect to a relevant page. Working commerce
   routes are kept.
3. About page: uses the Pages module `about` slug. The About link is hidden when no such page
   exists.
