import React from "react";
import Link from "next/link";
import Pagination from "@/shared/Pagination/Pagination";
import SectionSliderCollections from "@/components/SectionSliderLargeProduct";
import SectionPromo1 from "@/components/SectionPromo1";
import HeaderFilterSearchPage from "@/components/HeaderFilterSearchPage";
import ThemeProductCardAdapter from "@/components/theme/ThemeProductCardAdapter";
import SearchForm from "./SearchForm";
import {
  searchProducts,
  searchProductsByName,
  getFeaturedProducts,
  getFilterFacets,
} from "@/lib/firebase/repositories/products";
import { categoriesWithProducts } from "@/lib/filters/facets";
import { getFirstBanner } from "@/lib/firebase/repositories/banners";
import { getCategories } from "@/lib/firebase/repositories/categories";
import { getActiveThemeConfig } from "@/lib/theme/theme-repository";
import { GRID_GAP_WIDE, themeListingColsClass } from "@/lib/theme/grid";
import {
  parseProductSearchParams,
  buildPageHref,
  type RawSearchParams,
} from "@/lib/filters/parse-search-params";

export const dynamic = "force-dynamic";

const PageSearch = async ({ searchParams }: { searchParams: RawSearchParams }) => {
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const params = parseProductSearchParams(searchParams, (await getActiveThemeConfig()).collection?.productsPerPage);

  const [result, allCategories, theme, featured, promoBanner, facets] = await Promise.all([
    q ? searchProductsByName(q, params.pageSize) : searchProducts(params),
    getCategories(),
    getActiveThemeConfig(),
    // The store's own featured products and promo1 banner - hidden when there are none.
    getFeaturedProducts(3).catch(() => []),
    getFirstBanner("promo1").catch(() => null),
    getFilterFacets(),
  ]);
  const categories = categoriesWithProducts(allCategories, facets);
  const products = Array.isArray(result) ? result : result.products;
  const totalPages = Array.isArray(result) ? 1 : result.totalPages;

  return (
    <div className={`nc-PageSearch`} data-nc-id="PageSearch">
      <div
        className={`nc-HeadBackgroundCommon h-24 2xl:h-28 top-0 left-0 right-0 w-full bg-primary-50 dark:bg-neutral-800/20 `}
      />
      <div className="container">
        <header className="max-w-2xl mx-auto -mt-10 flex flex-col lg:-mt-7">
          <SearchForm />
        </header>
      </div>

      <div className="container py-16 lg:pb-28 lg:pt-20 space-y-16 lg:space-y-28">
        <main>
          {/* FILTER */}
          <HeaderFilterSearchPage categories={categories} facets={facets} />

          {q && (
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {products.length} result{products.length === 1 ? "" : "s"} for
              <span className="font-medium text-slate-900 dark:text-slate-100"> &ldquo;{q}&rdquo;</span>
            </p>
          )}

          {/* LOOP ITEMS */}
          <div className={`grid ${themeListingColsClass(theme.collection)} ${GRID_GAP_WIDE} mt-8 lg:mt-10`}>
            {products.map((item) => (
              <ThemeProductCardAdapter data={item} productCardSettings={theme.productCard} key={item.id} />
            ))}
          </div>
          {!products.length && (
            <div className="p-12 sm:p-16 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-800 mt-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs border border-indigo-100 dark:border-indigo-900/50">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {q ? `No products found for "${q}"` : "No products found"}
                </p>
                <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                  Try checking for spelling errors, using different keywords, or exploring our collection.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/collection"
                  className="inline-flex items-center px-5 py-2.5 rounded-full text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Browse Entire Collection
                </Link>
              </div>
            </div>
          )}

          {/* PAGINATION */}
          {!q && (
            <div className="flex flex-col mt-12 lg:mt-16 space-y-5 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
              <Pagination
                currentPage={params.page ?? 1}
                totalPages={totalPages}
                buildHref={(page) => `/search${buildPageHref(searchParams, page)}`}
              />
            </div>
          )}
        </main>

        {featured.length > 0 && (
          <>
            <hr className="border-slate-200 dark:border-slate-700" />
            <SectionSliderCollections data={featured} />
          </>
        )}
        {promoBanner && (
          <>
            <hr className="border-slate-200 dark:border-slate-700" />
            <SectionPromo1 banner={promoBanner} />
          </>
        )}
      </div>
    </div>
  );
};

export default PageSearch;
