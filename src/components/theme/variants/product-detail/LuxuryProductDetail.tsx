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
import StoreDeliveryInfo from "./StoreDeliveryInfo";
import { useProductDetailState } from "./useProductDetailState";
import { productInfoSections } from "@/lib/products/product-info";
import type { ProductDetailClientProps } from "@/app/product/[slug]/ProductDetailClient";
import type { ProductDetailThemeConfig } from "@/lib/theme/theme-types";

export interface LuxuryProductDetailProps extends ProductDetailClientProps {
  productDetailSettings?: ProductDetailThemeConfig;
}

/**
 * "Luxury" product page: thumbnail gallery + main image, a compact serif title, price with
 * discount, real rating (or "No reviews yet"), stock status, option swatches, quantity +
 * Add to Bag with wishlist, the store's real delivery/COD facts and the product's own details.
 */
export default function LuxuryProductDetail({
  product,
  variants,
  relatedProducts,
  reviews,
  crossSellProducts = [],
  upsellProducts = [],
  productCardSettings,
  productDetailSettings,
  storeInfo,
}: LuxuryProductDetailProps) {
  const s = useProductDetailState(product, variants);
  const showCompare = productDetailSettings?.showCompare ?? true;
  const clickableGallery = (productDetailSettings?.galleryStyle ?? "clickable-thumbnails") === "clickable-thumbnails";
  // Luxury's own default is a sticky panel; "standard" scrolls normally, "compact" also tightens spacing.
  const panelStyle = productDetailSettings?.purchasePanelStyle ?? "sticky";
  const isSticky = panelStyle === "sticky";
  const showWishlist = productDetailSettings?.showWishlist ?? true;
  const showRatings = productDetailSettings?.showRatings ?? true;

  const reviewCount = product.numberOfReviews ?? 0;
  const rating = product.rating ?? 0;
  const discount =
    s.activeCompareAtPrice && s.activeCompareAtPrice > s.activePrice
      ? Math.round(((s.activeCompareAtPrice - s.activePrice) / s.activeCompareAtPrice) * 100)
      : 0;
  const lowStockAt = product.lowStockThreshold ?? 5;
  const stockState = s.isOutOfStock
    ? { dot: "bg-rose-500", text: "Sold out" }
    : product.trackInventory && s.activeStock > 0 && s.activeStock <= lowStockAt
    ? { dot: "bg-amber-500", text: `Only ${s.activeStock} left` }
    : { dot: "bg-emerald-500", text: "In stock" };

  return (
    <div className="nc-ProductDetailPage bg-[var(--background)]">
      <main className="container mt-6 lg:mt-12">
        <div className="lg:flex lg:items-start lg:gap-12 xl:gap-16">
          <div className="w-full lg:w-[55%]">
            <div className="relative">
              <ProductGallery
                layout="thumbnails"
                images={s.images}
                activeImage={s.activeImage}
                thumbnails={s.thumbnails}
                alt={product.name}
                clickable={clickableGallery}
              />
              <ProductStatus status={product.badge} />
              {showCompare && <CompareButton productId={product.id} className="absolute right-3 top-3" />}
            </div>
          </div>

          <div className={`w-full lg:w-[45%] pt-8 lg:pt-0 ${isSticky ? "lg:sticky lg:top-24" : ""}`}>
            <div className={panelStyle === "compact" ? "space-y-5" : "space-y-7"}>
              <div className="space-y-3">
                <h1 className="font-serif text-2xl lg:text-[1.75rem] leading-snug tracking-wide text-[var(--heading)]">{product.name}</h1>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <Prices
                    price={s.activePrice}
                    compareAtPrice={s.activeCompareAtPrice}
                    contentClass="text-xl font-semibold tracking-wide text-[var(--heading)]"
                  />
                  {discount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-xs font-semibold">-{discount}%</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  {showRatings && (
                    reviewCount > 0 && rating > 0 ? (
                      <a href="#reviews" className="flex items-center gap-1 text-[var(--muted)] hover:text-[var(--heading)]">
                        <span className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <StarIcon key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`} />
                          ))}
                        </span>
                        <span className="font-medium text-[var(--heading)]">{rating.toFixed(1)}</span>
                        <span>({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</span>
                      </a>
                    ) : (
                      <a href="#reviews" className="text-[var(--muted)] hover:text-[var(--heading)]">
                        No reviews yet
                      </a>
                    )
                  )}
                  <span className="flex items-center gap-1.5 text-[var(--muted)]">
                    <span className={`w-2 h-2 rounded-full ${stockState.dot}`} />
                    {stockState.text}
                  </span>
                </div>
              </div>

              {product.attributes.some((a) => a.name.toLowerCase() !== "size") && (
                <div className="space-y-5 pt-6 border-t border-[var(--border)]">
                  <AttributeSwatches product={product} selections={s.selections} selectAttribute={s.selectAttribute} skipAttributeName="size" />
                </div>
              )}
              {s.sizeAttribute && (
                <SizeGrid product={product} variants={variants} sizeAttribute={s.sizeAttribute} sizeSelected={s.sizeSelected} selectAttribute={s.selectAttribute} />
              )}

              <div className="flex items-stretch gap-3">
                <div className="flex items-center justify-center border border-[var(--border)] rounded-full px-2">
                  <NcInputNumber defaultValue={s.qualitySelected} onChange={s.setQualitySelected} max={s.isOutOfStock ? 1 : undefined} />
                </div>
                <button
                  type="button"
                  disabled={s.isOutOfStock}
                  onClick={s.notifyAddTocart}
                  className="flex-1 rounded-full bg-[var(--heading)] text-[var(--background)] py-3.5 text-xs font-semibold uppercase tracking-[0.2em] hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {s.isOutOfStock ? "Sold out" : "Add to Bag"}
                </button>
                {showWishlist && (
                  <LikeButton productId={product.id} className="!w-12 !h-12 shrink-0 border border-[var(--border)] !shadow-none" />
                )}
              </div>

              <StoreDeliveryInfo info={storeInfo} />

              {productInfoSections(product).length > 0 && <AccordionInfo data={productInfoSections(product)} />}
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
          productDetailSettings={productDetailSettings}
          isOpenModalViewAllReviews={s.isOpenModalViewAllReviews}
          setIsOpenModalViewAllReviews={s.setIsOpenModalViewAllReviews}
        />
      </main>
    </div>
  );
}
