import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Pagination from "@/shared/Pagination/Pagination";
import ProductCard from "@/components/ProductCard";
import { getCategoryBySlug } from "@/lib/firebase/repositories/categories";
import { searchProducts } from "@/lib/firebase/repositories/products";
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

  const filterParams = parseProductSearchParams(searchParams);
  const { products, totalPages } = await searchProducts({
    ...filterParams,
    categoryId: category.id,
  });

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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 mt-8 lg:mt-10">
              {products.map((item) => (
                <ProductCard data={item} key={item.id} />
              ))}
            </div>
            {!products.length && (
              <p className="mt-10 text-center text-slate-500 dark:text-slate-400">
                No products in this category yet.
              </p>
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
