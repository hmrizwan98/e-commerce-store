"use client";

import React from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import type { ExploreType } from "@/components/SectionGridMoreExplore/data";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { getThemeDefaultAssets } from "@/lib/theme/theme-assets";
import type { ThemePresetId } from "@/lib/theme/theme-types";

export interface MinimalCategoriesProps {
  data?: ExploreType[];
  presetId?: ThemePresetId;
  heading?: string;
  subHeading?: string;
}

export default function MinimalCategories({
  data,
  presetId,
  heading = "Featured Collections",
  subHeading,
}: MinimalCategoriesProps) {
  const defaults = getThemeDefaultAssets(presetId).categories;
  const categories = data?.length
    ? data
    : defaults.map((d, i) => ({ id: String(i + 1), name: d.name, desc: d.desc, count: 18 + i * 12, image: d.image }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {heading}
          </h2>
          {subHeading && <p className="text-xs text-slate-500 mt-1">{subHeading}</p>}
        </div>
        <Link href={"/collection" as any} className="text-xs font-bold text-orange-600 hover:underline">
          Browse All Collections &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {categories.slice(0, 6).map((item) => (
          <Link
            key={item.id}
            href={`/collection/${item.id}` as any}
            className="group relative flex flex-col bg-slate-50 dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 hover:border-slate-300 transition-all block"
          >
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white dark:bg-slate-800 mb-4">
              <NcImage
                src={typeof item.image === "string" ? safeImageSrc(item.image) : item.image}
                alt={item.name}
                fill
                containerClassName="w-full h-full"
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.name}</h3>
                {item.count != null && <span className="text-xs text-slate-400">{item.count} items</span>}
              </div>
              <span className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white font-bold group-hover:bg-slate-900 group-hover:text-white transition-colors">
                &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
