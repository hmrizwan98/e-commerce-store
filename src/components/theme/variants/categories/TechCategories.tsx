"use client";

import React from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import type { ExploreType } from "@/components/SectionGridMoreExplore/data";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { getThemeDefaultAssets } from "@/lib/theme/theme-assets";
import type { ThemePresetId } from "@/lib/theme/theme-types";

export interface TechCategoriesProps {
  data?: ExploreType[];
  presetId?: ThemePresetId;
  heading?: string;
  subHeading?: string;
}

export default function TechCategories({
  data,
  presetId,
  heading = "Explore Tech Categories",
  subHeading,
}: TechCategoriesProps) {
  const defaults = getThemeDefaultAssets(presetId).categories;
  const categories = data?.length
    ? data
    : defaults.map((d, i) => ({ id: String(i + 1), name: d.name, desc: d.desc, count: 29 + i * 10, image: d.image }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sky-400 font-bold">⚡</span>
          <div>
            <h2 className="text-xl font-extrabold uppercase tracking-wider text-white">
              {heading}
            </h2>
            {subHeading && <p className="text-xs text-slate-400 font-normal">{subHeading}</p>}
          </div>
        </div>
        <Link href={"/collection" as any} className="text-xs font-bold text-sky-400 hover:underline">
          View All Products &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {categories.slice(0, 6).map((item) => (
          <Link
            key={item.id}
            href={`/collection/${item.id}` as any}
            className="group relative flex flex-col bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-2xl p-4 transition-all shadow-md block"
          >
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 mb-3">
              <NcImage
                src={typeof item.image === "string" ? safeImageSrc(item.image) : item.image}
                alt={item.name}
                fill
                containerClassName="w-full h-full"
                className="object-contain p-2 w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{item.name}</h3>
                {item.count != null && <span className="text-[11px] text-slate-400">{item.count} Devices Available</span>}
              </div>
              <span className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                Explore
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
