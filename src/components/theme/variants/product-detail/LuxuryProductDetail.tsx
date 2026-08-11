"use client";

import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import LikeButton from "@/components/LikeButton";
import CompareButton from "@/components/CompareButton";
import NcInputNumber from "@/components/NcInputNumber";
import Prices from "@/components/Prices";
import AccordionInfo from "@/components/AccordionInfo";
import ProductStatus from "@/components/ProductStatus";
import ProductGallery from "./ProductGallery";
import AttributeSwatches from "./AttributeSwatches";
import SizeGrid from "./SizeGrid";
import RelatedRailsAndReviews from "./RelatedRailsAndReviews";
import { useProductDetailState } from "./useProductDetailState";
import type { ProductDetailClientProps } from "@/app/product/[slug]/ProductDetailClient";
import type { ProductDetailThemeConfig } from "@/lib/theme/theme-types";

export interface LuxuryProductDetailProps extends ProductDetailClientProps {
  productDetailSettings?: ProductDetailThemeConfig;
}

export default function LuxuryProductDetail({
  product,
  variants,
  relatedProducts,
  reviews,
  crossSellProducts = [],
  upsellProducts = [],
  productCardSettings,
  productDetailSettings,
}: LuxuryProductDetailProps) {
  const s = useProductDetailState(product, variants);
  const showCompare = productDetailSettings?.showCompare ?? true;
  const clickableGallery = (productDetailSettings?.galleryStyle ?? "clickable-thumbnails") === "clickable-thumbnails";
  const isSticky = (productDetailSettings?.purchasePanelStyle ?? "sticky") !== "compact";

  return (
    <div className="nc-ProductDetailPage bg-[var(--background)]">
      <main className="container mt-8 lg:mt-16">
        <div className="lg:flex lg:items-start lg:gap-16">
          <div className="w-full lg:w-3/5">
            <div className="relative">
              <ProductGallery
                activeImage={s.activeImage}
                thumbnails={s.thumbnails}
                alt={product.name}
                clickable={clickableGallery}
                mainImageClassName="aspect-w-4 aspect-h-5"
              />
              <ProductStatus status={product.badge} />
              <LikeButton productId={product.id} className="absolute right-5 top-5" />
              {showCompare && <CompareButton productId={product.id} className="absolute right-5 top-20" />}
            </div>
          </div>

          <div className={`w-full lg:w-2/5 pt-12 lg:pt-0 ${isSticky ? "lg:sticky lg:top-24" : ""}`}>
            <div className="space-y-8 text-center lg:text-left">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl tracking-wide text-[var(--heading)]">{product.name}</h1>
                <div className="flex items-center justify-center lg:justify-start mt-4 gap-4">
                  <Prices contentClass="text-lg font-light tracking-widest" price={s.activePrice} />
                  <a href="#reviews" className="flex items-center text-xs uppercase tracking-widest text-[var(--muted)]">
                    <StarIcon className="w-4 h-4 mr-1 text-amber-400" />
                    {product.rating ? product.rating.toFixed(1) : "New"} · {product.numberOfReviews || 0}
                  </a>
                </div>
                {s.isOutOfStock && <p className="mt-2 text-xs uppercase tracking-widest text-red-600">Sold out</p>}
              </div>

              <div className="space-y-6 text-left">
                <AttributeSwatches product={product} selections={s.selections} selectAttribute={s.selectAttribute} skipAttributeName="size" />
              </div>
              {s.sizeAttribute && (
                <div className="text-left">
                  <SizeGrid product={product} variants={variants} sizeAttribute={s.sizeAttribute} sizeSelected={s.sizeSelected} selectAttribute={s.selectAttribute} />
                </div>
              )}

              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center justify-center bg-transparent border border-[var(--border)] px-2 py-3">
                  <NcInputNumber defaultValue={s.qualitySelected} onChange={s.setQualitySelected} max={s.isOutOfStock ? 1 : undefined} />
                </div>
                <button
                  type="button"
                  disabled={s.isOutOfStock}
                  onClick={s.notifyAddTocart}
                  className="flex-1 border border-[var(--heading)] text-[var(--heading)] py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-[var(--heading)] hover:text-[var(--background)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {s.isOutOfStock ? "Sold out" : "Add to Bag"}
                </button>
              </div>

              <div className="text-left pt-4 border-t border-[var(--border)]">
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
              </div>
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
