"use client";

import React from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import { getThemeDefaultAssets } from "@/lib/theme/theme-assets";
import type { ThemePresetId } from "@/lib/theme/theme-types";

export interface TechDealsPromoProps {
  banner?: any;
  presetId?: ThemePresetId;
}

export default function TechDealsPromo({ banner, presetId }: TechDealsPromoProps) {
  const defaults = getThemeDefaultAssets(presetId).promo;
  return (
    <div className="relative my-12 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-8 lg:p-12 rounded-3xl border border-blue-800/50 shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/30 text-sky-400 text-xs font-bold border border-blue-500/40">
            <span>⚡</span> DEALS OF THE DAY • COUNTDOWN LIVE
          </div>
          <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-white">
            {banner?.title || defaults.title || "Experience Innovation Like Never Before."}
          </h2>
          <p className="text-slate-300 text-sm">
            {banner?.description || defaults.description || "High-resolution OLED displays, ultra-fast processors & noise-cancelling wireless audio gear."}
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/collection"
              className="inline-block px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30"
            >
              Shop Electronics Deals →
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
            <NcImage
              src={banner?.image || defaults.image}
              alt="Tech Deals Promo"
              fill
              containerClassName="w-full h-full"
              className="object-contain p-4 w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
