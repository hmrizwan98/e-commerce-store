"use client";

import React from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import type { ThemePresetId } from "@/lib/theme/theme-types";

export interface MinimalPromoProps {
  banner?: any;
  presetId?: ThemePresetId;
}

export default function MinimalPromo({ banner, presetId }: MinimalPromoProps) {
  // Store Admin → Promo Banners (or the section's own text/image) only - never demo copy/photos.
  if (!banner?.title && !banner?.image) return null;
  const badge = banner?.badgeText || banner?.subtitle;
  return (
    <div className="relative my-12 bg-slate-50 dark:bg-slate-900 p-8 lg:p-12 rounded-3xl border border-slate-100 dark:border-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4">
          {badge && (
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
              {badge}
            </span>
          )}
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {banner?.title}
          </h2>
          {banner?.description && (<p className="text-slate-500 dark:text-slate-400 text-sm">{banner.description}</p>)}
          <div className="pt-2">
            <Link
              href={(banner?.ctaHref || "/collection") as any}
              className="inline-block px-7 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-md"
            >
              {banner?.ctaText || "Shop Sale Items →"}
            </Link>
          </div>
        </div>

        {banner?.image && (
        <div className="lg:col-span-6">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
            {banner?.imageMobile ? (
              <>
                <NcImage
                  src={banner.imageMobile}
                  alt="Minimal Promo"
                  fill
                  containerClassName="md:hidden w-full h-full"
                  className="object-cover w-full h-full"
                />
                <NcImage
                  src={banner.image}
                  alt="Minimal Promo"
                  fill
                  containerClassName="hidden md:block w-full h-full"
                  className="object-cover w-full h-full"
                />
              </>
            ) : (
              <NcImage
                src={banner?.image}
                alt="Minimal Promo"
                fill
                containerClassName="w-full h-full"
                className="object-cover w-full h-full"
              />
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
