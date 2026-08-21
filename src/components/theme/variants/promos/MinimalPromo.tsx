"use client";

import React from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import { getThemeDefaultAssets } from "@/lib/theme/theme-assets";
import type { ThemePresetId } from "@/lib/theme/theme-types";

export interface MinimalPromoProps {
  banner?: any;
  presetId?: ThemePresetId;
}

export default function MinimalPromo({ banner, presetId }: MinimalPromoProps) {
  const defaults = getThemeDefaultAssets(presetId).promo;
  return (
    <div className="relative my-12 bg-slate-50 dark:bg-slate-900 p-8 lg:p-12 rounded-3xl border border-slate-100 dark:border-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
            LIMITED TIME OFFER
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {banner?.title || defaults.title || "Simplicity is the ultimate sophistication."}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {banner?.description || defaults.description || "Save 20% off this holiday season on minimalist apparel and everyday essentials."}
          </p>
          <div className="pt-2">
            <Link
              href="/collection"
              className="inline-block px-7 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-md"
            >
              Shop Sale Items →
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
            <NcImage
              src={banner?.image || defaults.image}
              alt="Minimal Promo"
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
