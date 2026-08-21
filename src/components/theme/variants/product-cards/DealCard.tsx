"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/solid";
import { ArrowsPointingOutIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import NcImage from "@/shared/NcImage/NcImage";
import Prices from "@/components/Prices";
import ProductStatus from "@/components/ProductStatus";
import LikeButton from "@/components/LikeButton";
import CompareButton from "@/components/CompareButton";
import ModalQuickView from "@/components/ModalQuickView";
import { showAddToBagToast } from "@/components/AddToBagToast";
import { trackEvent } from "@/lib/analytics/track";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { aspectRatioClass, type ProductCardVariantProps } from "./ProductCardVariantProps";

export default function DealCard({ data, className = "", productCardSettings }: ProductCardVariantProps) {
  const { name, price, compareAtPrice, shortDescription, description, badge, images, slug, rating, numberOfReviews } = data;
  const image = safeImageSrc(images[0]);
  const secondaryImage = images[1] ? safeImageSrc(images[1]) : undefined;

  const showWishlist = productCardSettings?.showWishlist ?? true;
  const showCompare = productCardSettings?.showCompare ?? true;
  const showQuickView = productCardSettings?.showQuickView ?? true;
  const showQuickAdd = productCardSettings?.showQuickAdd ?? true;
  const showSecondaryImageOnHover = (productCardSettings?.showSecondaryImageOnHover ?? true) && Boolean(secondaryImage);
  const badgePosition = productCardSettings?.badgePosition ?? "top-left";

  const [showModalQuickView, setShowModalQuickView] = useState(false);

  // Calculate discount percentage if compareAtPrice is higher than price
  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  return (
    <>
      <div className={`group relative flex flex-col bg-white dark:bg-slate-900 rounded-[1.75rem] border border-slate-200/90 dark:border-slate-800 p-3.5 transition-all duration-300 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 ${className}`}>
        <Link
          href={`/product/${slug}`}
          className="absolute inset-0 z-[1]"
          onClick={() => trackEvent("product_click", { productId: data.id })}
        />

        {/* Top Header Row: Original Price Badge or Status Badge */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2.5 px-0.5">
          {compareAtPrice ? (
            <span className="text-[11px] font-medium text-slate-400">
              Original: <span className="line-through">Rs {compareAtPrice.toLocaleString()}</span>
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">In Stock</span>
          )}
          {showWishlist && (
            <div className="relative z-10">
              <LikeButton productId={data.id} />
            </div>
          )}
        </div>

        {/* Product Image Container */}
        <div className={`relative w-full ${aspectRatioClass(productCardSettings?.aspectRatio, "1:1")} rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800`}>
          <NcImage
            src={image}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
            containerClassName="w-full h-full"
            className={`object-cover w-full h-full transition-all duration-500 group-hover:scale-105 ${showSecondaryImageOnHover ? "group-hover:opacity-0" : ""}`}
            alt={name}
          />
          {showSecondaryImageOnHover && secondaryImage && (
            <NcImage
              src={secondaryImage}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
              containerClassName="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              className="object-cover w-full h-full"
              alt={name}
            />
          )}

          <ProductStatus status={badge} position={badgePosition} />

          {showQuickView && (
            <button
              type="button"
              className="absolute top-2.5 end-2.5 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-slate-700 dark:text-slate-200 hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault();
                setShowModalQuickView(true);
              }}
              title="Quick View"
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Product Info Section */}
        <div className="pt-3 flex flex-col flex-1 justify-between space-y-2">
          <div>
            {/* Title & Discount Badge Row */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                {name}
              </h3>
              {discountPercent !== null && (
                <span className="flex-shrink-0 text-[11px] font-extrabold text-red-600 bg-red-50 dark:bg-red-950/60 dark:text-red-400 px-1.5 py-0.5 rounded-md border border-red-200/60 dark:border-red-900/60">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Subtitle / Short Description */}
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              {shortDescription || description || "High quality product"}
            </p>
          </div>

          {/* Bottom Row: Price & Buy Now Button */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80">
            <div>
              {compareAtPrice && compareAtPrice > price && (
                <div className="text-[11px] text-slate-400 line-through font-medium">
                  Rs {compareAtPrice.toLocaleString()}
                </div>
              )}
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                Rs {price.toLocaleString()}
              </div>
            </div>

            {showQuickAdd && (
              <button
                type="button"
                className="relative z-10 px-4 py-2 text-xs font-bold rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
                onClick={(e) => {
                  e.preventDefault();
                  showAddToBagToast({ product: data });
                }}
              >
                <ShoppingBagIcon className="w-3.5 h-3.5" />
                <span>Buy Now</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showQuickView && (
        <ModalQuickView product={data} show={showModalQuickView} onCloseModalQuickView={() => setShowModalQuickView(false)} />
      )}
    </>
  );
}
