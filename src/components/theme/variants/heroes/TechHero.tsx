"use client";

import React from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import type { Hero2DataType } from "@/components/SectionHero/data";
import { safeImageSrc } from "@/utils/safeImageSrc";
import {
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  HomeIcon,
  SpeakerWaveIcon,
  TvIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { getThemeDefaultAssets } from "@/lib/theme/theme-assets";
import type { ThemePresetId } from "@/lib/theme/theme-types";
import type { ThemeBanner } from "@/types/theme";

export interface TechHeroProps {
  data?: Hero2DataType[];
  presetId?: ThemePresetId;
  banner?: ThemeBanner;
}

const TECH_NAV_CATEGORIES = [
  { name: "Smartphones & Mobile", icon: DevicePhoneMobileIcon, href: "/category/smartphones" },
  { name: "Laptops & Computers", icon: ComputerDesktopIcon, href: "/category/laptops" },
  { name: "Smart Home & IoT", icon: HomeIcon, href: "/category/smart-home" },
  { name: "Audio & Headphones", icon: SpeakerWaveIcon, href: "/category/audio" },
  { name: "TVs & Entertainment", icon: TvIcon, href: "/category/tvs" },
  { name: "Wearables & Watches", icon: SparklesIcon, href: "/category/wearables" },
];

export default function TechHero({ data, presetId, banner }: TechHeroProps) {
  const defaults = getThemeDefaultAssets(presetId).hero;
  const slide = data?.[0] ?? {
    heading: defaults.heading ?? "Spark Your Savings on Electronics!",
    subHeading: defaults.subHeading ?? "Latest High-Performance Gadgets & Tech Accessories",
    btnText: "Shop Electronics Now →",
    btnLink: "/collection",
    image: defaults.image,
  };

  const imageSrc = typeof slide.image === "string" ? safeImageSrc(slide.image) : slide.image;

  return (
    <div
      className="relative bg-slate-900 text-white py-8 lg:py-12 border-b border-slate-800"
      style={banner?.heightPx ? { minHeight: banner.heightPx } : undefined}
    >
      {banner?.overlayEnabled && (
        <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: banner.overlayOpacity ?? 0.2 }} />
      )}
      <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Tech Category Sidebar Menu */}
        <div className="lg:col-span-3 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 hidden lg:flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-sky-400">
              <span>⚡</span> All Categories
            </div>
            <div className="space-y-1">
              {TECH_NAV_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.name}
                    href={cat.href as any}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-sky-400" />
                    <span>{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-800/50 text-[11px]">
            <span className="font-bold text-sky-300 block">FLASH SALE LIVE</span>
            <span className="text-slate-400">Up to 50% Off Top Brands Today</span>
          </div>
        </div>

        {/* Right Main Tech Hero Slider Card */}
        <div className="lg:col-span-9 relative bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-8 lg:p-12 overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-lg">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-extrabold tracking-wider uppercase">
              ENJOY UP TO 40% OFF
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {slide.heading}
            </h1>
            <p className="text-sm lg:text-base text-slate-300">
              {slide.subHeading}
            </p>
            <div className="pt-2">
              <Link
                href={(slide.btnLink as any) || "/collection"}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 transition-all"
              >
                {slide.btnText || "Shop Electronics Now →"}
              </Link>
            </div>
          </div>

          <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-800">
            <NcImage
              src={imageSrc}
              alt={slide.heading}
              fill
              containerClassName="w-full h-full"
              className="object-contain p-4 w-full h-full"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
