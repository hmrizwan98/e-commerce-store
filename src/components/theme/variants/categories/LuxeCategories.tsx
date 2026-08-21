"use client";

import React from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import type { ExploreType } from "@/components/SectionGridMoreExplore/data";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { getThemeDefaultAssets } from "@/lib/theme/theme-assets";
import type { ThemePresetId } from "@/lib/theme/theme-types";

export interface LuxeCategoriesProps {
  data?: ExploreType[];
  presetId?: ThemePresetId;
  heading?: string;
  subHeading?: string;
}

export default function LuxeCategories({ data, presetId, heading = "Shop By Luxe Category", subHeading }: LuxeCategoriesProps) {
  const defaults = getThemeDefaultAssets(presetId).categories;
  const categories = data?.length
    ? data
    : defaults.map((d, i) => ({ id: String(i + 1), name: d.name, desc: d.desc, count: 30 + i * 7, image: d.image }));

  return (
    <div className="space-y-8">
      {heading && (
        <div className="text-center space-y-2">
          <span className="text-xs font-serif tracking-[0.2em] text-amber-700 dark:text-amber-400 uppercase block">
            CURATED SELECTION
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100">
            {heading}
          </h2>
          {subHeading && <p className="text-sm text-stone-500 dark:text-stone-400">{subHeading}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.slice(0, 6).map((item) => (
          <Link
            key={item.id}
            href={`/collection/${item.id}` as any}
            className="group relative flex flex-col bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-md hover:shadow-2xl transition-all block"
          >
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-stone-100 dark:bg-stone-800">
              <NcImage
                src={typeof item.image === "string" ? safeImageSrc(item.image) : item.image}
                alt={item.name}
                fill
                containerClassName="w-full h-full"
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                {item.count != null && (
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 block">
                    {item.count} PRODUCTS
                  </span>
                )}
                <h3 className="font-serif text-2xl font-bold">{item.name}</h3>
                {item.desc && <p className="text-xs text-stone-300 line-clamp-1">{item.desc}</p>}
                <span className="inline-block pt-2 text-xs font-serif font-bold tracking-wider uppercase text-amber-200 group-hover:text-white transition-colors">
                  View Collection &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
