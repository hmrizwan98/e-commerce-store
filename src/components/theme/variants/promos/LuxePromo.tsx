"use client";

import React from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import type { ThemePresetId } from "@/lib/theme/theme-types";

export interface LuxePromoProps {
  banner?: any;
  presetId?: ThemePresetId;
}

export default function LuxePromo({ banner, presetId }: LuxePromoProps) {
  // Store Admin → Promo Banners (or the section's own text/image) only - never demo copy/photos.
  if (!banner?.title && !banner?.image) return null;
  const badge = banner?.badgeText || banner?.subtitle;
  return (
    <div className="relative my-16 bg-[#FAF8F5] dark:bg-stone-950 p-8 lg:p-16 rounded-3xl border border-stone-200 dark:border-stone-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4 text-stone-950 dark:text-stone-50">
          {badge && (
            <span className="text-xs font-serif tracking-[0.2em] text-amber-700 dark:text-amber-400 uppercase block">
              {badge}
            </span>
          )}
          <h2 className="font-serif text-3xl lg:text-5xl font-bold leading-tight">
            {banner?.title}
          </h2>
          {banner?.description && (<p className="font-serif text-stone-600 dark:text-stone-300 text-sm lg:text-base leading-relaxed">{banner.description}</p>)}
          <div className="pt-4">
            <Link
              href={(banner?.ctaHref || "/collection") as any}
              className="inline-block px-8 py-4 bg-stone-900 hover:bg-stone-800 text-amber-50 font-serif font-bold text-xs uppercase tracking-widest"
            >
              {banner?.ctaText || "Explore Collection →"}
            </Link>
          </div>
        </div>

        {/* Banner image (+ its mobile image as the second tile when the merchant set one). */}
        {banner?.image && (
          <div className={`lg:col-span-6 grid ${banner?.imageMobile ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-stone-800">
              <NcImage
                src={banner.image}
                alt={banner?.title || "Promotion"}
                fill
                containerClassName="w-full h-full"
                className="object-cover w-full h-full"
              />
            </div>
            {banner?.imageMobile && (
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-stone-800 mt-8">
                <NcImage
                  src={banner.imageMobile}
                  alt={banner?.title || "Promotion"}
                  fill
                  containerClassName="w-full h-full"
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
