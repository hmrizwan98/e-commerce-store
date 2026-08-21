"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/solid";
import { ArrowsPointingOutIcon, ShoppingBagIcon, SparklesIcon } from "@heroicons/react/24/outline";
import NcImage from "@/shared/NcImage/NcImage";
import ProductStatus from "@/components/ProductStatus";
import LikeButton from "@/components/LikeButton";
import ModalQuickView from "@/components/ModalQuickView";
import { showAddToBagToast } from "@/components/AddToBagToast";
import { trackEvent } from "@/lib/analytics/track";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { aspectRatioClass, type ProductCardVariantProps } from "./ProductCardVariantProps";

export default function TrendGlassCard({ data, className = "", productCardSettings }: ProductCardVariantProps) {
  const { name, price, compareAtPrice, shortDescription, description, badge, images, slug, rating, numberOfReviews } = data;
  const image = safeImageSrc(images[0]);
  const secondaryImage = images[1] ? safeImageSrc(images[1]) : undefined;

  const showWishlist = productCardSettings?.showWishlist ?? true;
  const showQuickView = productCardSettings?.showQuickView ?? true;
  const showQuickAdd = productCardSettings?.showQuickAdd ?? true;
  const showSecondaryImageOnHover = (productCardSettings?.showSecondaryImageOnHover ?? true) && Boolean(secondaryImage);
  const badgePosition = productCardSettings?.badgePosition ?? "top-left";

  const [showModalQuickView, setShowModalQuickView] = useState(false);

  // Calculate discount and savings amount
  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  const savingsAmount = compareAtPrice && compareAtPrice > price ? compareAtPrice - price : null;

  return (
    <>
      <div className={`group relative flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 p-3.5 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1.5 ${className}`}>
        <Link
          href={`/product/${slug}`}
          className="absolute inset-0 z-[1]"
          onClick={() => trackEvent("product_click", { productId: data.id })}
        />

        {/* Product Image Container */}
        <div className={`relative w-full ${aspectRatioClass(productCardSettings?.aspectRatio, "1:1")} rounded-[1.5rem] overflow-hidden bg-slate-100 dark:bg-slate-800/60 z-0`}>
          <NcImage
            src={image}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
            containerClassName="w-full h-full"
            className={`object-cover w-full h-full transition-all duration-500 group-hover:scale-106 ${showSecondaryImageOnHover ? "group-hover:opacity-0" : ""}`}
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

          {/* Badges Overlay */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
            {discountPercent !== null ? (
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-500 to-red-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-md shadow-rose-500/20 backdrop-blur-md tracking-tight pointer-events-auto">
                <SparklesIcon className="w-3 h-3" />
                {discountPercent}% OFF
              </span>
            ) : (
              <ProductStatus status={badge} position={badgePosition} />
            )}

            {showWishlist && (
              <div className="pointer-events-auto backdrop-blur-md bg-white/80 dark:bg-slate-900/80 rounded-full p-1 shadow-md hover:scale-110 transition-transform">
                <LikeButton productId={data.id} />
              </div>
            )}
          </div>

          {/* Quick View Button on Image Hover */}
          {showQuickView && (
            <button
              type="button"
              className="absolute bottom-3 end-3 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-100 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-500 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-md hover:scale-110"
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

        {/* Info & Pricing Section */}
        <div className="pt-3.5 flex flex-col flex-1 justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1">
                {name}
              </h3>
              {(rating || numberOfReviews) && (
                <span className="flex-shrink-0 inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 font-bold text-[11px] px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-900/30">
                  <StarIcon className="w-3 h-3 text-amber-400" />
                  {rating || "4.9"}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 font-normal">
              {shortDescription || description || "Trending luxury item"}
            </p>
          </div>

          {/* Bottom Pricing & Action */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                {compareAtPrice && compareAtPrice > price && (
                  <span className="text-xs text-slate-400 line-through font-medium me-1.5">
                    Rs {compareAtPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Rs {price.toLocaleString()}
                </span>
              </div>

              {savingsAmount && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  Save Rs {savingsAmount.toLocaleString()}
                </span>
              )}
            </div>

            {showQuickAdd && (
              <button
                type="button"
                className="relative z-10 w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-sky-600 dark:hover:bg-sky-500 hover:text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  showAddToBagToast({ product: data });
                }}
              >
                <ShoppingBagIcon className="w-4 h-4" />
                <span>Add to Bag</span>
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
