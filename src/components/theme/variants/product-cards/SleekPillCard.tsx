"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import NcImage from "@/shared/NcImage/NcImage";
import ModalQuickView from "@/components/ModalQuickView";
import Prices from "@/components/Prices";
import { trackEvent } from "@/lib/analytics/track";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { aspectRatioClass, type ProductCardVariantProps } from "./ProductCardVariantProps";

const COLOR_NAME_MAP: Record<string, string> = {
  black: "#18181b",
  white: "#ffffff",
  red: "#ef4444",
  blue: "#3b82f6",
  sky: "#0ea5e9",
  navy: "#1e3a8a",
  green: "#22c55e",
  yellow: "#eab308",
  amber: "#f59e0b",
  orange: "#f97316",
  purple: "#a855f7",
  pink: "#ec4899",
  rose: "#f43f5e",
  brown: "#78350f",
  grey: "#6b7280",
  gray: "#6b7280",
  slate: "#64748b",
};

function getColorHexByName(name: string): string {
  if (!name) return "#6366f1";
  const lower = name.toLowerCase().trim();
  for (const [key, hex] of Object.entries(COLOR_NAME_MAP)) {
    if (lower.includes(key)) return hex;
  }
  return "#6366f1";
}

export default function SleekPillCard({ data, className = "", productCardSettings }: ProductCardVariantProps) {
  const {
    id,
    name,
    price,
    compareAtPrice,
    shortDescription,
    description,
    badge,
    images,
    slug,
    rating = 4.8,
    numberOfReviews = 98,
    attributes = [],
    colorFacets = [],
  } = data;

  const [isLiked, setIsLiked] = useState(false);
  const [showModalQuickView, setShowModalQuickView] = useState(false);

  const mainImage = safeImageSrc(images[0]);
  const secondaryImage = images[1] ? safeImageSrc(images[1]) : undefined;
  const showSecondaryImageOnHover = (productCardSettings?.showSecondaryImageOnHover ?? true) && Boolean(secondaryImage);

  // Derive color swatches dynamically from product attributes or colorFacets
  const colorAttr = attributes.find((a) => a.type === "color" || a.name.toLowerCase() === "color");
  const colorValues: any[] = colorAttr?.values ?? (colorFacets.length ? colorFacets : []);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Selected color label subtitle
  const selectedColorLabel =
    colorValues.length > 0
      ? typeof colorValues[selectedColorIndex] === "object"
        ? (colorValues[selectedColorIndex] as any).label
        : String(colorValues[selectedColorIndex])
      : null;

  // Badge label & icon logic
  const renderBadge = () => {
    if (badge === "new") {
      return (
        <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 shadow-xs flex items-center gap-1.5">
          <span>✨</span>
          <span>New in</span>
        </span>
      );
    }
    if (compareAtPrice && compareAtPrice > price) {
      const discount = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
      return (
        <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 shadow-xs flex items-center gap-1.5">
          <span>🏷️</span>
          <span>{discount}% Discount</span>
        </span>
      );
    }
    if (badge === "sold_out") {
      return (
        <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 shadow-xs flex items-center gap-1.5">
          <span>🚫</span>
          <span>Sold Out</span>
        </span>
      );
    }
    if (badge) {
      return (
        <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 shadow-xs flex items-center gap-1.5 capitalize">
          <span>🔥</span>
          <span>{badge.replace("_", " ")}</span>
        </span>
      );
    }
    return null;
  };

  return (
    <>
      <div
        className={`group relative flex flex-col bg-transparent border-0 shadow-none p-0 ${className}`}
      >
        <Link
          href={`/product/${slug}`}
          className="absolute inset-0 z-[1]"
          onClick={() => trackEvent("product_click", { productId: id })}
        />

        {/* Soft Background Image Wrapper */}
        <div
          className={`relative w-full ${aspectRatioClass(
            productCardSettings?.aspectRatio,
            "1:1"
          )} bg-slate-100/80 dark:bg-slate-800/60 rounded-3xl overflow-hidden p-6 flex items-center justify-center transition-all duration-300 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800/90`}
        >
          {/* Badge Top Left */}
          <div className="absolute top-3.5 start-3.5 z-10">{renderBadge()}</div>

          {/* Heart Wishlist Button Top Right */}
          <button
            type="button"
            className="absolute top-3.5 end-3.5 z-10 w-9 h-9 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
              trackEvent("product_click", { productId: id });
            }}
          >
            {isLiked ? (
              <HeartSolid className="w-5 h-5 text-rose-500" />
            ) : (
              <HeartOutline className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            )}
          </button>

          {/* Product Image */}
          <NcImage
            src={mainImage}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
            containerClassName="w-full h-full p-4 flex items-center justify-center"
            className={`object-contain max-h-full w-full transition-all duration-500 group-hover:scale-105 ${
              showSecondaryImageOnHover ? "group-hover:opacity-0" : ""
            }`}
            alt={name}
          />
          {showSecondaryImageOnHover && secondaryImage && (
            <NcImage
              src={secondaryImage}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
              containerClassName="absolute inset-0 w-full h-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center"
              className="object-contain max-h-full w-full"
              alt={name}
            />
          )}
        </div>

        {/* Dynamic Color Swatches - Only rendered if product actually has color variants */}
        {colorValues.length > 0 && (
          <div className="mt-3 mb-1 flex items-center gap-2 px-0.5 z-[2]">
            {colorValues.map((val: any, idx: number) => {
              const hex = typeof val === "object" ? val.hex : undefined;
              const label = typeof val === "object" ? val.label : String(val);
              const computedBg = hex || getColorHexByName(label);

              return (
                <button
                  key={idx}
                  type="button"
                  title={label}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedColorIndex(idx);
                  }}
                  className={`w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 transition-all ${
                    idx === selectedColorIndex
                      ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-110"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: computedBg }}
                />
              );
            })}
          </div>
        )}

        {/* Product Title & Subtitle */}
        <div className="px-0.5 mt-2 flex-1 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
              {name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5 line-clamp-1">
              {selectedColorLabel || shortDescription || description || "Standard edition"}
            </p>
          </div>

          {/* Bottom Row: Green Outline Price Pill Badge + Star Rating */}
          <div className="flex items-center justify-between mt-3 pt-0.5">
            <div className="border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold px-3.5 py-1 rounded-xl text-sm tracking-tight flex items-center justify-center">
              <Prices price={price} compareAtPrice={compareAtPrice} contentClass="text-emerald-600 dark:text-emerald-400 font-bold text-sm" />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <StarIcon className="w-4 h-4 text-amber-400" />
              <span>
                {rating} <span className="font-normal text-slate-400">({numberOfReviews} reviews)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {showModalQuickView && (
        <ModalQuickView
          product={data}
          show={showModalQuickView}
          onCloseModalQuickView={() => setShowModalQuickView(false)}
        />
      )}
    </>
  );
}
