"use client";

import React from "react";
import Link from "next/link";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import NcImage from "@/shared/NcImage/NcImage";
import type { Hero2DataType } from "@/components/SectionHero/data";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { getThemeDefaultAssets } from "@/lib/theme/theme-assets";
import type { ThemePresetId } from "@/lib/theme/theme-types";
import type { ThemeBanner } from "@/types/theme";

export interface LuxeHeroProps {
  data?: Hero2DataType[];
  presetId?: ThemePresetId;
  banner?: ThemeBanner;
}

export default function LuxeHero({ data, presetId, banner }: LuxeHeroProps) {
  const defaults = getThemeDefaultAssets(presetId).hero;
  const slide = data?.[0] ?? {
    heading: defaults.heading ?? "Dive Into A World Of Endless Fashion Possibilities",
    subHeading: defaults.subHeading ?? "LUXURY WOMEN FASHION COLLECTION 2026",
    badgeText: "ELEGANCE REDEFINED",
    discountText: "NEW ARRIVALS",
    offerText: "Bespoke Italian Craftsmanship & Premium Silks",
    btnText: "Explore New Collection →",
    btnLink: "/collection",
    image: defaults.image,
  };

  const imageSrc = typeof slide.image === "string" ? safeImageSrc(slide.image) : slide.image;
  const textAlignClass = banner?.textAlign === "center" ? "text-center items-center" : banner?.textAlign === "right" ? "text-right items-end" : "";

  return (
    <div
      className="relative bg-[#FAF8F5] dark:bg-stone-950 py-16 lg:py-24 border-b border-amber-900/10"
      style={banner?.heightPx ? { minHeight: banner.heightPx } : undefined}
    >
      {banner?.overlayEnabled && (
        <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: banner.overlayOpacity ?? 0.2 }} />
      )}
      <div className={`container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${textAlignClass}`}>
        {/* Left Editorial Copy Column */}
        <div className="lg:col-span-7 space-y-6 text-slate-900 dark:text-stone-100">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs font-serif tracking-widest uppercase">
            <span>✦</span> {slide.badgeText || "ELEGANCE REDEFINED"}
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight !leading-[1.15] text-stone-950 dark:text-stone-50">
            {slide.heading}
          </h1>

          <p className="text-base lg:text-xl text-stone-600 dark:text-stone-300 max-w-2xl font-serif leading-relaxed">
            {slide.subHeading || slide.offerText}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href={(slide.btnLink as any) || "/collection"}
              className="px-8 py-4 bg-stone-900 hover:bg-stone-800 text-amber-50 font-serif font-medium text-sm tracking-wider uppercase rounded-none shadow-lg transition-all"
            >
              {slide.btnText || "Explore New Collection →"}
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 border border-stone-900 text-stone-900 dark:text-stone-100 dark:border-stone-100 font-serif text-sm tracking-wider uppercase rounded-none hover:bg-stone-900 hover:text-white transition-all"
            >
              View Lookbook
            </Link>
          </div>

          {/* Luxe Trust Badges */}
          <div className="pt-8 grid grid-cols-3 gap-4 border-t border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-serif text-xs">
            <div>
              <span className="block font-bold text-sm text-stone-900 dark:text-stone-100">100% Handcrafted</span>
              <span>Premium Silk &amp; Leather</span>
            </div>
            <div>
              <span className="block font-bold text-sm text-stone-900 dark:text-stone-100">Express Delivery</span>
              <span>Worldwide Insured Shipping</span>
            </div>
            <div>
              <span className="block font-bold text-sm text-stone-900 dark:text-stone-100">Bespoke Fitting</span>
              <span>Personal Styling Advice</span>
            </div>
          </div>
        </div>

        {/* Right Overlapping Image Collage */}
        <div className="lg:col-span-5 relative">
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-900">
            <NcImage
              src={imageSrc}
              alt={slide.heading}
              fill
              containerClassName="w-full h-full"
              className="object-cover w-full h-full"
              priority
            />
          </div>

          {/* Overlapping secondary card badge */}
          <div className="absolute -bottom-6 -left-6 bg-white dark:bg-stone-900 p-4 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 max-w-xs space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600">NEW ARRIVAL</span>
            <p className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">Silk Couture Trench Coat</p>
            <p className="text-xs text-stone-500 font-semibold">$1,490 • Limited Edition</p>
          </div>
        </div>
      </div>
    </div>
  );
}
