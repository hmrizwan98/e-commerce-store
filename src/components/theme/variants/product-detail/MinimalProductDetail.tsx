"use client";

import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import LikeButton from "@/components/LikeButton";
import CompareButton from "@/components/CompareButton";
import BagIcon from "@/components/BagIcon";
import NcInputNumber from "@/components/NcInputNumber";
import Prices from "@/components/Prices";
import AccordionInfo from "@/components/AccordionInfo";
import ProductStatus from "@/components/ProductStatus";
import Policy from "@/app/product-detail/Policy";
import ProductGallery from "./ProductGallery";
import AttributeSwatches from "./AttributeSwatches";
import SizeGrid from "./SizeGrid";
import RelatedRailsAndReviews from "./RelatedRailsAndReviews";
import { useProductDetailState } from "./useProductDetailState";
import type { ProductDetailClientProps } from "@/app/product/[slug]/ProductDetailClient";
import type { ProductDetailThemeConfig } from "@/lib/theme/theme-types";

export interface MinimalProductDetailProps extends ProductDetailClientProps {
  productDetailSettings?: ProductDetailThemeConfig;
}

export default function MinimalProductDetail({
  product,
  variants,
  relatedProducts,
  reviews,
  crossSellProducts = [],
  upsellProducts = [],
  productCardSettings,
  productDetailSettings,
}: MinimalProductDetailProps) {
  const s = useProductDetailState(product, variants);
  const showCompare = productDetailSettings?.showCompare ?? true;
  const clickableGallery = (productDetailSettings?.galleryStyle ?? "clickable-thumbnails") === "clickable-thumbnails";

  return (
    <div className="nc-ProductDetailPage">
      <main className="container mt-5 lg:mt-11">
        <div className="lg:flex">
          <div className="w-full lg:w-[55%]">
            <div className="relative">
              <ProductGallery activeImage={s.activeImage} thumbnails={s.thumbnails} alt={product.name} clickable={clickableGallery} />
              <ProductStatus status={product.badge} />
              <LikeButton productId={product.id} className="absolute right-3 top-3" />
              {showCompare && <CompareButton productId={product.id} className="absolute right-3 top-16" />}
            </div>
          </div>

          <div className="w-full lg:w-[45%] pt-10 lg:pt-0 lg:pl-7 xl:pl-9 2xl:pl-10">
            <div className="space-y-7 2xl:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--heading)]">{product.name}</h2>
                <div className="flex items-center mt-5 space-x-4 sm:space-x-5">
                  <Prices contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold" price={s.activePrice} />
                  <div className="h-7 border-l border-slate-300 dark:border-slate-700" />
                  <a href="#reviews" className="flex items-center text-sm font-medium">
                    <StarIcon className="w-5 h-5 pb-[1px] text-yellow-400" />
                    <div className="ml-1.5 flex">
                      <span>{product.rating ? product.rating.toFixed(1) : "New"}</span>
                      <span className="block mx-2">·</span>
                      <span className="text-slate-600 dark:text-slate-400 underline">{product.numberOfReviews || 0} reviews</span>
                    </div>
                  </a>
                  {s.isOutOfStock && <span className="hidden sm:block text-sm text-red-600 ml-2.5">Sold out</span>}
                </div>
              </div>

              <div className="space-y-6">
                <AttributeSwatches product={product} selections={s.selections} selectAttribute={s.selectAttribute} skipAttributeName="size" />
              </div>
              {s.sizeAttribute && (
                <SizeGrid product={product} variants={variants} sizeAttribute={s.sizeAttribute} sizeSelected={s.sizeSelected} selectAttribute={s.selectAttribute} />
              )}

              <div className="flex space-x-3.5">
                <div className="flex items-center justify-center bg-slate-100/70 dark:bg-slate-800/70 px-2 py-3 sm:p-3.5 rounded-full">
                  <NcInputNumber defaultValue={s.qualitySelected} onChange={s.setQualitySelected} max={s.isOutOfStock ? 1 : undefined} />
                </div>
                <ButtonPrimary className="flex-1 flex-shrink-0" onClick={s.notifyAddTocart} disabled={s.isOutOfStock}>
                  <BagIcon className="hidden sm:inline-block w-5 h-5 mb-0.5" />
                  <span className="ml-3">{s.isOutOfStock ? "Sold out" : "Add to cart"}</span>
                </ButtonPrimary>
              </div>

              <hr className="2xl:!my-10 border-slate-200 dark:border-slate-700" />

              <AccordionInfo
                data={[
                  { name: "Description", content: product.description },
                  {
                    name: "Fabric + Care",
                    content: `<ul class="list-disc list-inside leading-7">
                      <li>Made from a sheer Belgian power micromesh.</li>
                      <li>74% Polyamide (Nylon) 26% Elastane (Spandex)</li>
                      <li>Hand wash in cold water, dry flat</li>
                    </ul>`,
                  },
                ]}
              />

              <div className="hidden xl:block">
                <Policy />
              </div>
            </div>
          </div>
        </div>

        <div className="block xl:hidden mt-10">
          <Policy />
        </div>

        <RelatedRailsAndReviews
          product={product}
          reviews={reviews}
          relatedProducts={relatedProducts}
          crossSellProducts={crossSellProducts}
          upsellProducts={upsellProducts}
          productCardSettings={productCardSettings}
          isOpenModalViewAllReviews={s.isOpenModalViewAllReviews}
          setIsOpenModalViewAllReviews={s.setIsOpenModalViewAllReviews}
        />
      </main>
    </div>
  );
}
