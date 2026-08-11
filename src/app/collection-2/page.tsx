import React from "react";
import SectionSliderCollections from "@/components/SectionSliderLargeProduct";
import SectionPromo1 from "@/components/SectionPromo1";
import ThemeProductCardAdapter from "@/components/theme/ThemeProductCardAdapter";
import Pagination from "@/shared/Pagination/Pagination";
import { searchProducts } from "@/lib/firebase/repositories/products";
import { getCategories } from "@/lib/firebase/repositories/categories";
import { getActiveThemeConfig } from "@/lib/theme/theme-repository";
import {
  parseProductSearchParams,
  buildPageHref,
  type RawSearchParams,
} from "@/lib/filters/parse-search-params";
import SidebarFilters from "@/components/SidebarFilters";

export const dynamic = "force-dynamic";

const PageCollection2 = async ({
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

  return (
    <div className={`nc-PageCollection2`}>
      <div className="container py-16 lg:pb-28 lg:pt-20 space-y-16 sm:space-y-20 lg:space-y-28">
        <div className="space-y-10 lg:space-y-14">
          {/* HEADING */}
          <div className="max-w-screen-sm">
            <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
              Man collection
            </h2>
            <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
              We not only help you design exceptional products, but also make it
              easy for you to share your designs with more like-minded people.
            </span>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />
          <main>
            {/* LOOP ITEMS */}
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/3 xl:w-1/4 pr-4">
                <SidebarFilters categories={categories} />
              </div>
              <div className="flex-shrink-0 mb-10 lg:mb-0 lg:mx-4 border-t lg:border-t-0"></div>
              <div className="flex-1 ">
                <div className="flex-1 grid sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10 ">
                  {products.map((item) => (
                    <ThemeProductCardAdapter data={item} productCardSettings={theme.productCard} key={item.id} />
                  ))}
                </div>
                {!products.length && (
                  <p className="mt-10 text-center text-slate-500 dark:text-slate-400">
                    No products match these filters.
                  </p>
                )}
                <div className="flex mt-12 lg:mt-16 justify-center">
                  <Pagination
                    currentPage={params.page ?? 1}
                    totalPages={totalPages}
                    buildHref={(page) => `/collection-2${buildPageHref(searchParams, page)}`}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* === SECTION 5 === */}
        <hr className="border-slate-200 dark:border-slate-700" />

        <SectionSliderCollections />
        <hr className="border-slate-200 dark:border-slate-700" />

        {/* SUBCRIBES */}
        <SectionPromo1 />
      </div>
    </div>
  );
};

export default PageCollection2;
