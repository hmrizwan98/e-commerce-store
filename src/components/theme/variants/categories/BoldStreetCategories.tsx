"use client";

import React from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import type { ExploreType } from "@/components/SectionGridMoreExplore/data";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { getThemeDefaultAssets } from "@/lib/theme/theme-assets";
import type { ThemePresetId } from "@/lib/theme/theme-types";

export interface BoldStreetCategoriesProps {
  data?: ExploreType[];
  presetId?: ThemePresetId;
  heading?: string;
  subHeading?: string;
}

export default function BoldStreetCategories({
  data,
  presetId,
  heading = "CATEGORIES DROP",
  subHeading,
}: BoldStreetCategoriesProps) {
  const defaults = getThemeDefaultAssets(presetId).categories;
  const categories = data?.length
    ? data
    : defaults.map((d, i) => ({ id: String(i + 1), name: d.name.toUpperCase(), desc: d.desc, count: 19 + i * 6, image: d.image }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b-2 border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 bg-rose-600 rounded-none" />
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
              {heading}
            </h2>
            {subHeading && <p className="text-xs text-neutral-400 font-normal">{subHeading}</p>}
          </div>
        </div>
        <Link href={"/collection" as any} className="text-xs font-black uppercase tracking-widest text-rose-500 hover:underline">
          ALL CATEGORIES &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {categories.slice(0, 6).map((item) => (
          <Link
            key={item.id}
            href={`/collection/${item.id}` as any}
            className="group relative flex flex-col bg-neutral-900 border-2 border-neutral-800 hover:border-rose-600 rounded-none overflow-hidden transition-colors block"
          >
            <div className="relative w-full aspect-[4/3] bg-neutral-950 overflow-hidden">
              <NcImage
                src={typeof item.image === "string" ? safeImageSrc(item.image) : item.image}
                alt={item.name}
                fill
                containerClassName="w-full h-full"
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
              {item.count != null && (
                <div className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1">
                  {item.count} ITEMS
                </div>
              )}
            </div>
            <div className="p-4 bg-black flex items-center justify-between">
              <h3 className="text-base font-black uppercase tracking-wider text-white">{item.name}</h3>
              <span className="text-rose-500 font-black text-sm">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
