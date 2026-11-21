import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Pagination from "@/shared/Pagination/Pagination";
import ThemeProductCardAdapter from "@/components/theme/ThemeProductCardAdapter";
import { getCategoryBySlug } from "@/lib/firebase/repositories/categories";
import { searchProducts } from "@/lib/firebase/repositories/products";
import { getActiveThemeConfig } from "@/lib/theme/theme-repository";
import { GRID_GAP_WIDE, themeListingColsClass } from "@/lib/theme/grid";
import {
  parseProductSearchParams,
  buildPageHref,
  type RawSearchParams,
} from "@/lib/filters/parse-search-params";
import EventTracker from "@/components/analytics/EventTracker";
import { requestMemo } from "@/lib/request-cache";

export const dynamic = "force-dynamic";

/** generateMetadata() and the page body both need this category - memoized per-request
 * so the same document isn't fetched twice for one render. */
function getCategoryBySlugMemo(slug: string) {
  return requestMemo(`category:${slug}`, () => getCategoryBySlug(slug));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategoryBySlugMemo(params.slug);
  if (!category || !category.isActive || category.isDeleted) return {};
  return {
    title: category.seoTitle || category.name,
    description: category.seoDescription || category.description,
  };
}

const PageCategory = async ({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: RawSearchParams;
}) => {
  const category = await getCategoryBySlugMemo(params.slug);
  if (!category || !category.isActive || category.isDeleted) {
    notFound();
  }

  const filterParams = parseProductSearchParams(searchParams, (await getActiveThemeConfig()).collection?.productsPerPage);
  const [{ products, totalPages }, theme] = await Promise.all([
    searchProducts({ ...filterParams, categoryId: category.id }),
    getActiveThemeConfig(),
  ]);

  return (
    <div className="nc-PageCategory">
      <EventTracker type="category_view" categoryId={category.id} />
      <div className="container py-16 lg:pb-28 lg:pt-20 space-y-16 sm:space-y-20 lg:space-y-28">
        <div className="space-y-10 lg:space-y-14">
          {category.image && (
            <div className="relative w-full h-60 sm:h-72 md:h-80 rounded-3xl overflow-hidden">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )}
          <div className="max-w-screen-sm">
            <h1 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
              {category.name}
            </h1>
            {category.description && (
              <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
                {category.description}
              </span>
            )}
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />
          <main>
            <div className={`grid ${themeListingColsClass(theme.collection)} ${GRID_GAP_WIDE} mt-8 lg:mt-10`}>
              {products.map((item) => (
                <ThemeProductCardAdapter data={item} productCardSettings={theme.productCard} key={item.id} />
              ))}
            </div>
            {!products.length && (
              <div className="p-12 sm:p-16 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-800 mt-6 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs border border-indigo-100 dark:border-indigo-900/50">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    No products in this category yet
                  </p>
                  <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                    New items are added regularly. Browse our entire collection in the meantime.
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

            <div className="flex flex-col mt-12 lg:mt-16 space-y-5 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
              <Pagination
                currentPage={filterParams.page ?? 1}
                totalPages={totalPages}
                buildHref={(page) =>
                  `/category/${category.slug}${buildPageHref(searchParams, page)}`
                }
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PageCategory;
