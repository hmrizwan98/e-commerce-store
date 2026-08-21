"use client";

import React from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import type { Hero2DataType } from "@/components/SectionHero/data";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { getThemeDefaultAssets } from "@/lib/theme/theme-assets";
import type { ThemePresetId } from "@/lib/theme/theme-types";
import type { ThemeBanner } from "@/types/theme";

export interface MinimalHeroProps {
  data?: Hero2DataType[];
  presetId?: ThemePresetId;
  banner?: ThemeBanner;
}

export default function MinimalHero({ data, presetId, banner }: MinimalHeroProps) {
  const defaults = getThemeDefaultAssets(presetId).hero;
  const slide = data?.[0] ?? {
    heading: defaults.heading ?? "Style That Inspires",
    subHeading: defaults.subHeading ?? "Discover the latest trends & exclusive minimal designs.",
    btnText: "Shop Now →",
    btnLink: "/collection",
    image: defaults.image,
  };

  const imageSrc = typeof slide.image === "string" ? safeImageSrc(slide.image) : slide.image;
  const textAlignClass = banner?.textAlign === "center" ? "text-center items-center" : banner?.textAlign === "right" ? "text-right items-end" : "";

  return (
    <div
      className="relative bg-white dark:bg-slate-950 py-12 lg:py-20 border-b border-slate-100 dark:border-slate-800"
      style={banner?.heightPx ? { minHeight: banner.heightPx } : undefined}
    >
      {banner?.overlayEnabled && (
        <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: banner.overlayOpacity ?? 0.2 }} />
      )}
      <div className={`container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${textAlignClass}`}>
        {/* Left Copy */}
        <div className="lg:col-span-6 space-y-6">
          <span className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
            SPRING / SUMMER 2026
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            {slide.heading}
          </h1>
          <p className="text-base lg:text-lg text-slate-500 dark:text-slate-400 max-w-lg">
            {slide.subHeading}
          </p>

          <div className="pt-2">
            <Link
              href={(slide.btnLink as any) || "/collection"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-orange-600/20 transition-all"
            >
              {slide.btnText || "Shop Now →"}
            </Link>
          </div>
        </div>

        {/* Right Lifestyle Banner */}
        <div className="lg:col-span-6">
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
            <NcImage
              src={imageSrc}
              alt={slide.heading}
              fill
              containerClassName="w-full h-full"
              className="object-cover w-full h-full"
              priority
            />
          </div>
        </div>
      </div>

      {/* 3-Column Trust Strip matching reference Theme 02 */}
      <div className="container mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3">
          <span className="text-2xl">🚚</span>
          <div className="text-left">
            <span className="block text-xs font-bold text-slate-900 dark:text-white">Free Shipping</span>
            <span className="block text-[11px] text-slate-400">On all orders over $50</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3">
          <span className="text-2xl">🎁</span>
          <div className="text-left">
            <span className="block text-xs font-bold text-slate-900 dark:text-white">Special Offers</span>
            <span className="block text-[11px] text-slate-400">Up to 30% discount on bundles</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div className="text-left">
            <span className="block text-xs font-bold text-slate-900 dark:text-white">Secure Checkout</span>
            <span className="block text-[11px] text-slate-400">Encrypted payment processing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
