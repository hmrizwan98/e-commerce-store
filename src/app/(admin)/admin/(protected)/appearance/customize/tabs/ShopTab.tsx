"use client";

import React from "react";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";

export interface TabProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

/**
 * Collection/category listing page settings. Product-by-product rendering
 * (card style, badges, quick add) lives in the Product tab and is shared
 * with every other product grid on the site - this tab only covers the
 * Shop/Collection page's own grid density.
 */
export default function ShopTab({ draft, onChange }: TabProps) {
  const layout = draft.layout ?? {};
  const setLayout = (patch: Partial<typeof layout>) => onChange({ layout: { ...layout, ...patch } });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Shop &amp; Collection Pages</h2>
        <p className="text-sm text-slate-500 mt-1">
          Controls the product grid spacing on collection, category, brand and search result pages.
          Product card design itself (image ratio, badges, quick add) is shared with every grid on
          the storefront - configure that under the <span className="font-semibold">Product</span> tab.
        </p>
      </div>

      <div className="space-y-1.5 max-w-xs">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Grid Gap ({layout.gridGapPx ?? 24}px)
        </label>
        <input
          type="range"
          min={12}
          max={48}
          step={4}
          value={layout.gridGapPx ?? 24}
          onChange={(e) => setLayout({ gridGapPx: parseInt(e.target.value, 10) })}
          className="w-full"
        />
        <p className="text-xs text-slate-400">Shared with every product grid, including homepage sections.</p>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">Product card style</p>
        <p>Every product grid across the storefront - including collection pages - renders using the card style, aspect ratio and badge settings configured in the Product tab.</p>
      </div>
    </div>
  );
}
