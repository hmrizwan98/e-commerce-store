import React from "react";
import Pagination from "@/shared/Pagination/Pagination";
import SectionSliderCollections from "@/components/SectionSliderLargeProduct";
import SectionPromo1 from "@/components/SectionPromo1";
import ThemeProductCardAdapter from "@/components/theme/ThemeProductCardAdapter";
import { searchProducts } from "@/lib/firebase/repositories/products";
import { getCategories } from "@/lib/firebase/repositories/categories";
import { getActiveThemeConfig } from "@/lib/theme/theme-repository";
import {
  parseProductSearchParams,
  buildPageHref,
  type RawSearchParams,
} from "@/lib/filters/parse-search-params";
import TabFilters from "@/components/TabFilters";
import SidebarFilters from "@/components/SidebarFilters";

// Filters/sort/pagination are URL-driven (see src/hooks/useFilterParams.ts)
// and resolved against Firestore server-side on every request.
export const dynamic = "force-dynamic";

const PageCollection = async ({
  searchParams,
}: {
  searchParams: RawSearchParams;
}) => {
  const params = parseProductSearchParams(searchParams);
  const [{ products, totalPages }, categories, theme] = await Promise.all([
    searchProducts(params),
    getCategories(),
    getActiveThemeConfig(),
  ]);

  const isSidebarFilter = theme.collection?.filterPosition !== "top";
  const showHero = theme.collection?.showHeroBanner ?? true;
  const heroTitle = theme.collection?.heroTitle || "Collection";
  const heroSubtitle = theme.collection?.heroSubtitle || "Discover exceptional products handcrafted for your everyday lifestyle.";
  const heroImage = theme.collection?.heroImageUrl;
  const heroHeight = theme.collection?.heroHeight || "medium";
  const desktopCols = theme.collection?.gridColumnsDesktop ?? 3;
  const mobileCols = theme.collection?.gridColumnsMobile ?? 2;

  const heroHeightClass = {
    small: "py-8 sm:py-10",
    medium: "py-12 sm:py-16",
    large: "py-16 sm:py-24",
  }[heroHeight];

  const gridColsClass = `${mobileCols === 1 ? "grid-cols-1" : "grid-cols-2"} sm:grid-cols-2 ${
    desktopCols === 2
      ? "lg:grid-cols-2"
      : desktopCols === 3
      ? "lg:grid-cols-3"
      : desktopCols === 5
      ? "lg:grid-cols-5"
      : "lg:grid-cols-4"
  }`;

  return (
    <div className={`nc-PageCollection`}>
      <div className="container py-12 lg:pb-24 lg:pt-16 space-y-12 sm:space-y-16">
        <div className="space-y-8 lg:space-y-12">
          {/* COLLECTION HERO BANNER */}
          {showHero && (
            <div className={`relative overflow-hidden rounded-3xl bg-slate-900 text-white ${heroHeightClass} px-6 sm:px-12 shadow-lg`}>
              {heroImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImage} alt={heroTitle} className="absolute inset-0 w-full h-full object-cover opacity-45" />
              )}
              <div className="relative z-10 max-w-screen-md space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-xs">
                  {heroTitle}
                </h1>
                <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed max-w-xl drop-shadow-xs">
                  {heroSubtitle}
                </p>
              </div>
            </div>
          )}

          <main>
            {isSidebarFilter ? (
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                {/* Left Checkbox Filter Sidebar */}
                <div className="w-full lg:w-64 xl:w-72 shrink-0">
                  <div className="sticky top-28 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <SidebarFilters categories={categories} showHeader={true} />
                  </div>
                </div>

                {/* Right Product Grid */}
                <div className="flex-1 min-w-0">
                  <div className={`grid ${gridColsClass} gap-x-6 gap-y-8`}>
                    {products.map((item) => (
                      <ThemeProductCardAdapter data={item} productCardSettings={theme.productCard} key={item.id} />
                    ))}
                  </div>
                  {!products.length && (
                    <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 mt-6">
                      <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                        No products match these filters.
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Try resetting your filter selections.</p>
                    </div>
                  )}

                  {/* PAGINATION */}
                  <div className="flex flex-col mt-12 space-y-5 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
                    <Pagination
                      currentPage={params.page ?? 1}
                      totalPages={totalPages}
                      buildHref={(page) => `/collection${buildPageHref(searchParams, page)}`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Top Tab Filters */
              <div>
                <TabFilters categories={categories} />
                <div className={`grid ${gridColsClass} gap-x-8 gap-y-10 mt-8 lg:mt-10`}>
                  {products.map((item) => (
                    <ThemeProductCardAdapter data={item} productCardSettings={theme.productCard} key={item.id} />
                  ))}
                </div>
                {!products.length && (
                  <p className="mt-10 text-center text-slate-500 dark:text-slate-400">
                    No products match these filters.
                  </p>
                )}
                <div className="flex flex-col mt-12 lg:mt-16 space-y-5 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
                  <Pagination
                    currentPage={params.page ?? 1}
                    totalPages={totalPages}
                    buildHref={(page) => `/collection${buildPageHref(searchParams, page)}`}
                  />
                </div>
              </div>
            )}
          </main>
        </div>

        {/* BOTTOM SECTIONS */}
        {(theme.collection?.showFeaturedSection ?? true) && (
          <>
            <hr className="border-slate-200 dark:border-slate-700" />
            <SectionSliderCollections />
          </>
        )}

        {(theme.collection?.showBottomPromo ?? true) && (
          <>
            <hr className="border-slate-200 dark:border-slate-700" />
            <SectionPromo1 />
          </>
        )}
      </div>
    </div>
  );
};

export default PageCollection;
