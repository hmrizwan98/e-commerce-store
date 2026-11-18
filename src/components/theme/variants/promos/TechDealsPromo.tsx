"use client";

import React from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import type { ThemePresetId } from "@/lib/theme/theme-types";

export interface TechDealsPromoProps {
  banner?: any;
  presetId?: ThemePresetId;
}

export default function TechDealsPromo({ banner, presetId }: TechDealsPromoProps) {
  // Store Admin → Promo Banners (or the section's own text/image) only - never demo copy/photos.
  if (!banner?.title && !banner?.image) return null;
  const badge = banner?.badgeText || banner?.subtitle;
  return (
    <div className="relative my-12 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-8 lg:p-12 rounded-3xl border border-blue-800/50 shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/30 text-sky-400 text-xs font-bold border border-blue-500/40">
              {badge}
            </div>
          )}
          <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-white">
            {banner?.title}
          </h2>
          {banner?.description && (<p className="text-slate-300 text-sm">{banner.description}</p>)}
          <div className="pt-2 flex items-center gap-3">
            <Link
              href={(banner?.ctaHref || "/collection") as any}
              className="inline-block px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30"
            >
              {banner?.ctaText || "Shop Electronics Deals →"}
            </Link>
          </div>
        </div>

        {banner?.image && (
        <div className="lg:col-span-5">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
            {banner?.imageMobile ? (
              <>
                <NcImage
                  src={banner.imageMobile}
                  alt="Tech Deals Promo"
                  fill
                  containerClassName="md:hidden w-full h-full"
                  className="object-contain p-4 w-full h-full"
                />
                <NcImage
                  src={banner.image}
                  alt="Tech Deals Promo"
                  fill
                  containerClassName="hidden md:block w-full h-full"
                  className="object-contain p-4 w-full h-full"
                />
              </>
            ) : (
              <NcImage
                src={banner?.image}
                alt="Tech Deals Promo"
                fill
                containerClassName="w-full h-full"
                className="object-contain p-4 w-full h-full"
              />
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
