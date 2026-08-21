"use client";

import React from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import { getThemeDefaultAssets } from "@/lib/theme/theme-assets";
import type { ThemePresetId } from "@/lib/theme/theme-types";

export interface BoldStreetPromoProps {
  banner?: any;
  presetId?: ThemePresetId;
}

export default function BoldStreetPromo({ banner, presetId }: BoldStreetPromoProps) {
  const defaults = getThemeDefaultAssets(presetId).promo;
  return (
    <div className="relative my-12 bg-neutral-950 text-white p-8 lg:p-12 border-2 border-rose-600 rounded-none overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-block bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1">
            ⚡ FLASH DROP 50% OFF
          </div>
          <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter leading-none text-white">
            {banner?.title || defaults.title || "EXCLUSIVE OFFERS LIMITED TIME ONLY"}
          </h2>
          <p className="text-neutral-400 font-bold uppercase tracking-wider text-sm">
            {banner?.description || defaults.description || "Heavyweight hoodies, cargo pants & limited retro sneakers drop available now."}
          </p>
          <div className="pt-2">
            <Link
              href="/collection"
              className="inline-block px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest"
            >
              GRAB DROP NOW →
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative aspect-[4/3] bg-neutral-900 border border-neutral-800">
            <NcImage
              src={banner?.image || defaults.image}
              alt="Bold Street Promo"
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
