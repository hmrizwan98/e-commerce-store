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

export interface BoldProductDetailProps extends ProductDetailClientProps {
  productDetailSettings?: ProductDetailThemeConfig;
}

const LOW_STOCK_THRESHOLD = 5;

export default function BoldProductDetail({
  product,
  variants,
  relatedProducts,
  reviews,
  crossSellProducts = [],
  upsellProducts = [],
  productCardSettings,
  productDetailSettings,
}: BoldProductDetailProps) {
  const s = useProductDetailState(product, variants);
  const showCompare = productDetailSettings?.showCompare ?? true;
  const clickableGallery = (productDetailSettings?.galleryStyle ?? "clickable-thumbnails") === "clickable-thumbnails";
  const isSticky = (productDetailSettings?.purchasePanelStyle ?? "sticky") !== "compact";
  const lowStock = !s.isOutOfStock && s.activeStock > 0 && s.activeStock <= LOW_STOCK_THRESHOLD;

  return (
    <div className="nc-ProductDetailPage">
      <main className="container mt-5 lg:mt-11">
        <div className="lg:flex lg:items-start">
          <div className="w-full lg:w-1/2">
            <div className="relative">
              <ProductGallery activeImage={s.activeImage} thumbnails={s.thumbnails} alt={product.name} clickable={clickableGallery} />
              <ProductStatus status={product.badge} position="top-right" />
              <LikeButton productId={product.id} className="absolute left-3 top-3" />
              {showCompare && <CompareButton productId={product.id} className="absolute left-3 top-16" />}
            </div>
          </div>

          <div className={`w-full lg:w-1/2 pt-10 lg:pt-0 lg:pl-10 xl:pl-14 ${isSticky ? "lg:sticky lg:top-24" : ""}`}>
            <div className="space-y-6 border-2 border-[var(--border)] rounded-lg p-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--heading)]">{product.name}</h1>
                <div className="flex items-center mt-3 gap-3">
                  <a href="#reviews" className="flex items-center text-sm font-bold">
                    <StarIcon className="w-5 h-5 pb-[1px] text-yellow-400" />
                    <span className="ml-1">{product.rating ? product.rating.toFixed(1) : "New"}</span>
                    <span className="mx-1.5">·</span>
                    <span className="underline">{product.numberOfReviews || 0} reviews</span>
                  </a>
                </div>
              </div>

              <Prices contentClass="py-1.5 px-3 text-2xl font-black" price={s.activePrice} compareAtPrice={s.activeCompareAtPrice} />

              {s.isOutOfStock ? (
                <p className="text-sm font-bold uppercase text-red-600">Sold out</p>
              ) : lowStock ? (
                <p className="text-sm font-bold uppercase text-red-600">Only {s.activeStock} left in stock - order soon</p>
              ) : null}

              <div className="space-y-5">
                <AttributeSwatches product={product} selections={s.selections} selectAttribute={s.selectAttribute} skipAttributeName="size" />
              </div>
              {s.sizeAttribute && (
                <SizeGrid product={product} variants={variants} sizeAttribute={s.sizeAttribute} sizeSelected={s.sizeSelected} selectAttribute={s.selectAttribute} />
              )}

              <div className="flex space-x-3.5">
                <div className="flex items-center justify-center bg-slate-100/70 dark:bg-slate-800/70 px-2 py-3 sm:p-3.5 rounded-md border border-[var(--border)]">
                  <NcInputNumber defaultValue={s.qualitySelected} onChange={s.setQualitySelected} max={s.isOutOfStock ? 1 : undefined} />
                </div>
                <ButtonPrimary
                  className="flex-1 flex-shrink-0 uppercase font-bold tracking-wider"
                  onClick={s.notifyAddTocart}
                  disabled={s.isOutOfStock}
                >
                  <BagIcon className="hidden sm:inline-block w-5 h-5 mb-0.5" />
                  <span className="ml-3">{s.isOutOfStock ? "Sold out" : "Add to cart"}</span>
                </ButtonPrimary>
              </div>

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

              <Policy />
            </div>
          </div>
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
