"use client";

import React from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import type { Hero2DataType } from "@/components/SectionHero/data";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { getObjectPositionClass } from "@/lib/banners/position";
import type { ThemePresetId } from "@/lib/theme/theme-types";
import type { ThemeBanner } from "@/types/theme";

export interface LuxeHeroProps {
  data?: Hero2DataType[];
  presetId?: ThemePresetId;
  banner?: ThemeBanner;
}

export default function LuxeHero({ data, presetId, banner }: LuxeHeroProps) {
  // Merchant data only (Store Admin → Hero Slides); the adapter skips this when there are none.
  const slide = data?.[0];
  if (!slide) return null;

  const imageSrc = typeof slide.image === "string" ? safeImageSrc(slide.image) : slide.image;
  const mobileSrc = slide.imageMobile ? safeImageSrc(slide.imageMobile) : null;
  const bgPosClass = getObjectPositionClass(slide.backgroundPosition);
  const imageAspectClass = mobileSrc ? "aspect-[3/4]" : "aspect-[16/10] sm:aspect-[4/3] lg:aspect-[3/4]";
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
          {slide.badgeText && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs font-serif tracking-widest uppercase">
              <span>✦</span> {slide.badgeText}
            </div>
          )}

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight !leading-[1.15] text-stone-950 dark:text-stone-50">
            {slide.heading}
          </h1>

          <p className="text-base lg:text-xl text-stone-600 dark:text-stone-300 max-w-2xl font-serif leading-relaxed">
            {slide.subHeading || slide.description}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href={(slide.btnLink as any) || "/collection"}
              className="px-8 py-4 bg-stone-900 hover:bg-stone-800 text-amber-50 font-serif font-medium text-sm tracking-wider uppercase rounded-none shadow-lg transition-all"
            >
              {slide.btnText || "Shop now"}
            </Link>
            {slide.btnText2 && slide.btnLink2 && (
              <Link
                href={slide.btnLink2 as any}
                className="px-8 py-4 border border-stone-900 text-stone-900 dark:text-stone-100 dark:border-stone-100 font-serif text-sm tracking-wider uppercase rounded-none hover:bg-stone-900 hover:text-white transition-all"
              >
                {slide.btnText2}
              </Link>
            )}
          </div>

        </div>

        {/* Right Overlapping Image Collage */}
        <div className="lg:col-span-5 relative">
          <div className={`relative w-full ${imageAspectClass} rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-900`}>
            {mobileSrc ? (
              <>
                <NcImage
                  src={mobileSrc}
                  alt={slide.heading}
                  fill
                  containerClassName="md:hidden w-full h-full"
                  className={`object-cover w-full h-full ${bgPosClass}`}
                  priority
                />
                <NcImage
                  src={imageSrc}
                  alt={slide.heading}
                  fill
                  containerClassName="hidden md:block w-full h-full"
                  className={`object-cover w-full h-full ${bgPosClass}`}
                  priority
                />
              </>
            ) : (
              <NcImage
                src={imageSrc}
                alt={slide.heading}
                fill
                containerClassName="w-full h-full"
                className={`object-cover w-full h-full ${bgPosClass}`}
                priority
              />
            )}
          </div>

          {(slide.discountText || slide.offerText) && (
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-stone-900 p-4 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 max-w-xs space-y-1">
              {slide.discountText && <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600">{slide.discountText}</span>}
              {slide.offerText && <p className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">{slide.offerText}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
