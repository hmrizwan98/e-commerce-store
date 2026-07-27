import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Pagination from "@/shared/Pagination/Pagination";
import ProductCard from "@/components/ProductCard";
import { getBrandBySlug } from "@/lib/firebase/repositories/brands";
import { searchProducts } from "@/lib/firebase/repositories/products";
import {
  parseProductSearchParams,
  buildPageHref,
  type RawSearchParams,
} from "@/lib/filters/parse-search-params";
import EventTracker from "@/components/analytics/EventTracker";
import { safeImageSrc } from "@/utils/safeImageSrc";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const brand = await getBrandBySlug(params.slug);
  if (!brand) return {};
  return {
    title: brand.seoTitle || brand.name,
    description: brand.seoDescription || brand.description,
  };
}

const PageBrand = async ({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: RawSearchParams;
}) => {
  const brand = await getBrandBySlug(params.slug);
  if (!brand) {
    notFound();
  }

  const filterParams = parseProductSearchParams(searchParams);
  const { products, totalPages } = await searchProducts({
    ...filterParams,
    brand: brand.id,
  });

  return (
    <div className="nc-PageBrand">
      <EventTracker type="brand_view" brandId={brand.id} />
      <div className="container py-16 lg:pb-28 lg:pt-20 space-y-16 sm:space-y-20 lg:space-y-28">
        <div className="space-y-10 lg:space-y-14">
          {brand.banner && (
            <div className="relative w-full h-60 sm:h-72 md:h-80 rounded-3xl overflow-hidden">
              <Image
                src={safeImageSrc(brand.banner)}
                alt={brand.name}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )}
          <div className="max-w-screen-sm flex items-center gap-4">
            {brand.logo && (
              <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700">
                <Image src={safeImageSrc(brand.logo)} alt={brand.name} fill className="object-contain" sizes="64px" />
              </div>
            )}
            <div>
              <h1 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
                {brand.name}
              </h1>
              {brand.description && (
                <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
                  {brand.description}
                </span>
              )}
            </div>
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
                No products from this brand yet.
              </p>
            )}

            <div className="flex flex-col mt-12 lg:mt-16 space-y-5 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between sm:items-center">
              <Pagination
                currentPage={filterParams.page ?? 1}
                totalPages={totalPages}
                buildHref={(page) =>
                  `/brand/${brand.slug}${buildPageHref(searchParams, page)}`
                }
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PageBrand;
