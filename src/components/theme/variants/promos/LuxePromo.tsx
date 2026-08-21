"use client";

import React from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import { getThemeDefaultAssets } from "@/lib/theme/theme-assets";
import type { ThemePresetId } from "@/lib/theme/theme-types";

export interface LuxePromoProps {
  banner?: any;
  presetId?: ThemePresetId;
}

export default function LuxePromo({ banner, presetId }: LuxePromoProps) {
  const defaults = getThemeDefaultAssets(presetId).promo;
  return (
    <div className="relative my-16 bg-[#FAF8F5] dark:bg-stone-950 p-8 lg:p-16 rounded-3xl border border-stone-200 dark:border-stone-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4 text-stone-950 dark:text-stone-50">
          <span className="text-xs font-serif tracking-[0.2em] text-amber-700 dark:text-amber-400 uppercase block">
            EXCLUSIVE OFFERS
          </span>
          <h2 className="font-serif text-3xl lg:text-5xl font-bold leading-tight">
            {banner?.title || defaults.title || "Redefining Everyday Elegance"}
          </h2>
          <p className="font-serif text-stone-600 dark:text-stone-300 text-sm lg:text-base leading-relaxed">
            {banner?.description || defaults.description || "Curated luxury fashion pieces crafted with silk, cashmere & fine leather for timeless sophistication."}
          </p>
          <div className="pt-4">
            <Link
              href="/collection"
              className="inline-block px-8 py-4 bg-stone-900 hover:bg-stone-800 text-amber-50 font-serif font-bold text-xs uppercase tracking-widest"
            >
              Explore Collection →
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-stone-800">
            <NcImage
              src={banner?.image || defaults.image}
              alt="Luxe Promo"
              fill
              containerClassName="w-full h-full"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-stone-800 mt-8">
            <NcImage
              src={defaults.secondaryImage || defaults.image}
              alt="Luxe Promo 2"
              fill
              containerClassName="w-full h-full"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
