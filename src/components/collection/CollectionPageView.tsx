import React from "react";
import Link from "next/link";
import Pagination from "@/shared/Pagination/Pagination";
import SectionSliderCollections from "@/components/SectionSliderLargeProduct";
import SectionPromo1 from "@/components/SectionPromo1";
import ThemeProductCardAdapter from "@/components/theme/ThemeProductCardAdapter";
import { searchProducts, getFeaturedProducts } from "@/lib/firebase/repositories/products";
import { getFirstBanner } from "@/lib/firebase/repositories/banners";
import { getCategories } from "@/lib/firebase/repositories/categories";
import { getFilterFacets } from "@/lib/firebase/repositories/products";
import { categoriesWithProducts } from "@/lib/filters/facets";
import { parseProductSearchParams, buildPageHref, type RawSearchParams } from "@/lib/filters/parse-search-params";
import TabFilters from "@/components/TabFilters";
import SidebarFilters from "@/components/SidebarFilters";
import { GRID_GAP_SIDEBAR, GRID_GAP_WIDE, themeGridColsClass } from "@/lib/theme/grid";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";
import { renderSection } from "@/app/HomeContent";
import { extraPageSections } from "@/lib/theme/page-sections";

/**
 * The storefront collection page body, driven by the theme's Collection settings. Used by the
 * real /collection route (published theme) AND the Theme Customizer preview (draft theme), so
 * the preview always shows exactly what shoppers will get.
 */
export default async function CollectionPageView({
  theme,
  searchParams,
  basePath = "/collection",
}: {
  theme: SystemThemeConfig;
  searchParams: RawSearchParams;
  basePath?: string;
}) {
  const params = parseProductSearchParams(searchParams, theme.collection?.productsPerPage);
  const showFeatured = theme.collection?.showFeaturedSection ?? true;
  const showPromo = theme.collection?.showBottomPromo ?? true;
  const [{ products, totalPages }, allCategories, extraSections, featured, promoBanner, facets] = await Promise.all([
    searchProducts(params),
    getCategories(),
    // Sections the admin added to this page in the Customizer, below the page content.
    Promise.all(extraPageSections(theme.collection?.sections).map((sec) => renderSection(sec, theme))),
    // Bottom sections use the store's own featured products / promo1 banner - empty -> hidden.
    showFeatured ? getFeaturedProducts(3).catch(() => []) : Promise.resolve([]),
    showPromo ? getFirstBanner("promo1").catch(() => null) : Promise.resolve(null),
    // Filter options from the store's own products (no demo colours/sizes or $1-$500 range).
    getFilterFacets(),
  ]);

  // Only categories that actually have products.
  const categories = categoriesWithProducts(allCategories, facets);
  const isSidebarFilter = theme.collection?.filterPosition !== "top";
  const showFilters = theme.collection?.showSidebarFilter ?? true;
  const showSorting = theme.collection?.showSorting ?? true;
  const showHero = theme.collection?.showHeroBanner ?? true;
  const heroTitle = theme.collection?.heroTitle || "Collection";
  // Customizer → Shop page subtitle only (no invented copy).
  const heroSubtitle = theme.collection?.heroSubtitle?.trim() || "";
  const heroImage = theme.collection?.heroImageUrl;
  const heroHeight = theme.collection?.heroHeight || "medium";
  const desktopCols = theme.collection?.gridColumnsDesktop ?? 3;
  const mobileCols = theme.collection?.gridColumnsMobile ?? 2;

  const heroHeightClass = {
    small: "py-8 sm:py-10",
    medium: "py-12 sm:py-16",
    large: "py-16 sm:py-24",
  }[heroHeight];

  const gridColsClass = themeGridColsClass(desktopCols, mobileCols);

  return (
    <div className={`nc-PageCollection`}>
      <div className="container py-12 lg:pb-24 lg:pt-16 space-y-12 sm:space-y-16">
        <div className="space-y-8 lg:space-y-12">
          {/* COLLECTION HERO BANNER */}
          {showHero && (
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 text-white ${heroHeightClass} px-6 sm:px-12 shadow-xl border border-slate-800`}>
              {/* Subtle ambient mesh glow */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

              {heroImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImage} alt={heroTitle} className="absolute inset-0 w-full h-full object-cover opacity-35" />
              )}
              <div className="relative z-10 max-w-screen-md space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/10 backdrop-blur-md">
                  ✨ Catalog Collection
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-xs">
                  {heroTitle}
                </h1>
                {heroSubtitle ? (
                  <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed max-w-xl drop-shadow-xs">
                    {heroSubtitle}
                  </p>
                ) : (
                  <p className="text-sm sm:text-base text-slate-300/90 font-normal leading-relaxed max-w-xl">
                    Discover and shop from our complete catalog of quality products.
                  </p>
                )}
              </div>
            </div>
          )}

          <main>
            {isSidebarFilter ? (
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                {/* Left Checkbox Filter Sidebar ("Show filters" off -> hidden) */}
                {showFilters && (
                  <div className="w-full lg:w-64 xl:w-72 shrink-0">
                    <div className="sticky top-28 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                      <SidebarFilters categories={categories} availableColors={facets.colors} availableSizes={facets.sizes} priceRange={facets.priceRange} showHeader={true} showSorting={showSorting} />
                    </div>
                  </div>
                )}

                {/* Right Product Grid */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-medium">
                      Showing <strong className="text-slate-900 dark:text-white font-semibold">{products.length}</strong> {products.length === 1 ? "product" : "products"}
                    </span>
                    {Object.keys(searchParams).some((k) => k !== "page" && searchParams[k]) && (
                      <Link
                        href={basePath as any}
                        className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Reset filters ✕
                      </Link>
                    )}
                  </div>

                  <div className={`grid ${gridColsClass} ${GRID_GAP_SIDEBAR}`}>
                    {products.map((item) => (
                      <ThemeProductCardAdapter data={item} productCardSettings={theme.productCard} key={item.id} />
                    ))}
                  </div>

                  {!products.length && (
                    <div className="p-12 sm:p-16 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-800 mt-4 space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs border border-indigo-100 dark:border-indigo-900/50">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                          No products match these filters
                        </p>
                        <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                          Try adjusting or resetting your filter criteria to discover more products.
                        </p>
                      </div>
                      <div>
                        <Link
                          href={basePath as any}
                          className="inline-flex items-center px-5 py-2.5 rounded-full text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          Reset All Filters
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* PAGINATION */}
                  <div className="flex flex-col mt-12 space-y-5 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
                    <Pagination
                      currentPage={params.page ?? 1}
                      totalPages={totalPages}
                      buildHref={(page) => `${basePath}${buildPageHref(searchParams, page)}`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Top Tab Filters */
              <div>
                {showFilters && <TabFilters categories={categories} colors={facets.colors} sizes={facets.sizes} priceRange={facets.priceRange} showSorting={showSorting} />}
                <div className={`grid ${gridColsClass} ${GRID_GAP_WIDE} mt-8 lg:mt-10`}>
                  {products.map((item) => (
                    <ThemeProductCardAdapter data={item} productCardSettings={theme.productCard} key={item.id} />
                  ))}
                </div>
                {!products.length && (
                  <div className="p-12 sm:p-16 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-800 mt-6 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs border border-indigo-100 dark:border-indigo-900/50">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        No products match these filters
                      </p>
                      <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                        Try resetting your filter selections to browse our full catalog.
                      </p>
                    </div>
                    <div>
                      <Link
                        href={basePath as any}
                        className="inline-flex items-center px-5 py-2.5 rounded-full text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        Reset All Filters
                      </Link>
                    </div>
                  </div>
                )}
                <div className="flex flex-col mt-12 lg:mt-16 space-y-5 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
                  <Pagination
                    currentPage={params.page ?? 1}
                    totalPages={totalPages}
                    buildHref={(page) => `${basePath}${buildPageHref(searchParams, page)}`}
                  />
                </div>
              </div>
            )}
          </main>
        </div>

        {/* BOTTOM SECTIONS */}
        {showFeatured && featured.length > 0 && (
          <>
            <hr className="border-slate-200 dark:border-slate-700" />
            <SectionSliderCollections data={featured} />
          </>
        )}

        {showPromo && promoBanner && (
          <>
            <hr className="border-slate-200 dark:border-slate-700" />
            <SectionPromo1 banner={promoBanner} />
          </>
        )}

        {extraSections.filter(Boolean).map((el, i) => (
          <React.Fragment key={i}>{el}</React.Fragment>
        ))}
      </div>
    </div>
  );
}
