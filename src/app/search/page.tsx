import React from "react";
import Pagination from "@/shared/Pagination/Pagination";
import SectionSliderCollections from "@/components/SectionSliderLargeProduct";
import SectionPromo1 from "@/components/SectionPromo1";
import HeaderFilterSearchPage from "@/components/HeaderFilterSearchPage";
import ProductCard from "@/components/ProductCard";
import SearchForm from "./SearchForm";
import {
  searchProducts,
  searchProductsByName,
} from "@/lib/firebase/repositories/products";
import { getCategories } from "@/lib/firebase/repositories/categories";
import {
  parseProductSearchParams,
  buildPageHref,
  type RawSearchParams,
} from "@/lib/filters/parse-search-params";

export const dynamic = "force-dynamic";

const PageSearch = async ({ searchParams }: { searchParams: RawSearchParams }) => {
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const params = parseProductSearchParams(searchParams);

  const [result, categories] = await Promise.all([
    q ? searchProductsByName(q, params.pageSize) : searchProducts(params),
    getCategories(),
  ]);
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
          <HeaderFilterSearchPage categories={categories} />

          {q && (
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              {products.length} result{products.length === 1 ? "" : "s"} for
              <span className="font-medium text-slate-900 dark:text-slate-100"> &ldquo;{q}&rdquo;</span>
            </p>
          )}

          {/* LOOP ITEMS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 mt-8 lg:mt-10">
            {products.map((item) => (
              <ProductCard data={item} key={item.id} />
            ))}
          </div>
          {!products.length && (
            <p className="mt-10 text-center text-slate-500 dark:text-slate-400">
              No products found.
            </p>
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

export default PageSearch;
