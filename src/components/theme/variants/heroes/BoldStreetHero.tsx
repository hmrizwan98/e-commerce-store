"use client";

import React from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import type { Hero2DataType } from "@/components/SectionHero/data";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { getThemeDefaultAssets } from "@/lib/theme/theme-assets";
import type { ThemePresetId } from "@/lib/theme/theme-types";
import type { ThemeBanner } from "@/types/theme";

export interface BoldStreetHeroProps {
  data?: Hero2DataType[];
  presetId?: ThemePresetId;
  banner?: ThemeBanner;
}

export default function BoldStreetHero({ data, presetId, banner }: BoldStreetHeroProps) {
  const defaults = getThemeDefaultAssets(presetId).hero;
  const slide = data?.[0] ?? {
    heading: defaults.heading ?? "OWN THE DARKNESS",
    subHeading: defaults.subHeading ?? "PREMIUM STREETWEAR FOR THE FEARLESS",
    btnText: "SHOP DROP NOW →",
    btnLink: "/collection",
    image: defaults.image,
  };

  const imageSrc = typeof slide.image === "string" ? safeImageSrc(slide.image) : slide.image;
  const textAlignClass = banner?.textAlign === "center" ? "text-center items-center" : banner?.textAlign === "right" ? "text-right items-end" : "";

  return (
    <div
      className="relative bg-neutral-950 text-white py-16 lg:py-24 overflow-hidden border-b-4 border-rose-600"
      style={banner?.heightPx ? { minHeight: banner.heightPx } : undefined}
    >
      {banner?.overlayEnabled && (
        <div className="absolute inset-0 bg-black pointer-events-none z-[1]" style={{ opacity: banner.overlayOpacity ?? 0.2 }} />
      )}
      <div className={`container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${textAlignClass}`}>
        {/* Left Urban Copy */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-rose-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1 rounded-sm shadow-md">
            🔥 URBAN DROP 2026 • LIMITED STOCK
          </div>

          <h1 className="font-extrabold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tighter uppercase leading-none text-white drop-shadow-lg">
            {slide.heading}
          </h1>

          <p className="text-lg lg:text-xl font-bold tracking-wider uppercase text-neutral-400 max-w-xl">
            {slide.subHeading}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href={(slide.btnLink as any) || "/collection"}
              className="px-10 py-5 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm tracking-widest uppercase rounded-none shadow-xl transition-all border-2 border-rose-600"
            >
              {slide.btnText || "SHOP DROP NOW →"}
            </Link>
            <Link
              href="/collection"
              className="px-10 py-5 bg-transparent hover:bg-white hover:text-black text-white font-black text-sm tracking-widest uppercase rounded-none transition-all border-2 border-white"
            >
              VIEW ALL DROPS
            </Link>
          </div>
        </div>

        {/* Right Streetwear Campaign Image */}
        <div className="lg:col-span-5 relative">
          <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-neutral-900 border-2 border-neutral-800 shadow-2xl">
            <NcImage
              src={imageSrc}
              alt={slide.heading}
              fill
              containerClassName="w-full h-full"
              className="object-cover w-full h-full"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/80 backdrop-blur-md border border-neutral-800">
              <span className="text-xs font-black text-rose-500 uppercase tracking-widest block">AUTHENTIC STREETWEAR</span>
              <span className="text-sm font-bold text-white uppercase">Heavyweight Graphic Oversized Hoodie</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
