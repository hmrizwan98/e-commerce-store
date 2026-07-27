import React from "react";
import Pagination from "@/shared/Pagination/Pagination";
import SectionSliderCollections from "@/components/SectionSliderLargeProduct";
import SectionPromo1 from "@/components/SectionPromo1";
import ProductCard from "@/components/ProductCard";
import { searchProducts } from "@/lib/firebase/repositories/products";
import { getCategories } from "@/lib/firebase/repositories/categories";
import {
  parseProductSearchParams,
  buildPageHref,
  type RawSearchParams,
} from "@/lib/filters/parse-search-params";
import TabFilters from "@/components/TabFilters";

// Filters/sort/pagination are URL-driven (see src/hooks/useFilterParams.ts)
// and resolved against Firestore server-side on every request.
export const dynamic = "force-dynamic";

const PageCollection = async ({
  searchParams,
}: {
  searchParams: RawSearchParams;
}) => {
  const params = parseProductSearchParams(searchParams);
  const [{ products, totalPages }, categories] = await Promise.all([
    searchProducts(params),
    getCategories(),
  ]);

  return (
    <div className={`nc-PageCollection`}>
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
            {/* TABS FILTER */}
            <TabFilters categories={categories} />

            {/* LOOP ITEMS */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 mt-8 lg:mt-10">
              {products.map((item) => (
                <ProductCard data={item} key={item.id} />
              ))}
            </div>
            {!products.length && (
              <p className="mt-10 text-center text-slate-500 dark:text-slate-400">
                No products match these filters.
              </p>
            )}

            {/* PAGINATION */}
            <div className="flex flex-col mt-12 lg:mt-16 space-y-5 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
              <Pagination
                currentPage={params.page ?? 1}
                totalPages={totalPages}
                buildHref={(page) => `/collection${buildPageHref(searchParams, page)}`}
              />
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

export default PageCollection;
