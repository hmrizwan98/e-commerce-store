"use client";

import React from "react";
import type { SystemThemeConfig, ProductCardThemeConfig } from "@/lib/theme/theme-types";

export interface TabProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

const VARIANTS: { value: NonNullable<ProductCardThemeConfig["variant"]>; label: string; description: string }[] = [
  { value: "trend-glass", label: "Trend Glass (2026 Modern)", description: "Gradient discount badge, frosted glass buttons, savings pill." },
  { value: "deal-card", label: "Deal Card (SS3 Style)", description: "Top original price, red discount badge, pill Buy Now button." },
  { value: "minimal", label: "Minimal", description: "Clean rounded cards, soft hover reveal." },
  { value: "bold-grid", label: "Bold grid", description: "Sharp corners, high contrast, dense grid." },
  { value: "editorial", label: "Editorial", description: "Serif type, 3:4 imagery, understated actions." },
];

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 py-2 cursor-pointer">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
      />
    </label>
  );
}

export default function ProductCardTab({ draft, onChange }: TabProps) {
  const productCard = draft.productCard ?? {};
  const setProductCard = (patch: Partial<ProductCardThemeConfig>) => onChange({ productCard: { ...productCard, ...patch } });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Product cards</h2>
        <p className="text-sm text-slate-500 mt-1">
          Controls every product grid storefront-wide (collections, search, homepage, related products) via the
          same ThemeProductCardAdapter.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {VARIANTS.map((v) => {
          const selected = (productCard.variant ?? "minimal") === v.value;
          return (
            <button
              key={v.value}
              onClick={() => setProductCard({ variant: v.value })}
              className={`text-left border rounded-xl p-4 space-y-1 transition-all ${
                selected ? "border-sky-500 ring-2 ring-sky-500/20" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="font-semibold text-sm">{v.label}</div>
              <div className="text-xs text-slate-500">{v.description}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
        <div className="space-y-1.5 py-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Image aspect ratio
          </label>
          <select
            value={productCard.aspectRatio ?? "1:1"}
            onChange={(e) => setProductCard({ aspectRatio: e.target.value as any })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            <option value="1:1">Square (1:1)</option>
            <option value="4:3">Landscape (4:3)</option>
            <option value="3:4">Portrait (3:4)</option>
            <option value="4:5">Portrait (4:5)</option>
          </select>
        </div>
        <div className="space-y-1.5 py-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Badge position
          </label>
          <select
            value={productCard.badgePosition ?? "top-left"}
            onChange={(e) => setProductCard({ badgePosition: e.target.value as any })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            <option value="top-left">Top left</option>
            <option value="top-right">Top right</option>
          </select>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        <Toggle
          label="Secondary image on hover"
          checked={productCard.showSecondaryImageOnHover ?? true}
          onChange={(v) => setProductCard({ showSecondaryImageOnHover: v })}
        />
        <Toggle label="Quick add / hover actions" checked={productCard.showQuickAdd ?? true} onChange={(v) => setProductCard({ showQuickAdd: v })} />
        <Toggle label="Wishlist" checked={productCard.showWishlist ?? true} onChange={(v) => setProductCard({ showWishlist: v })} />
        <Toggle label="Compare" checked={productCard.showCompare ?? true} onChange={(v) => setProductCard({ showCompare: v })} />
        <Toggle label="Quick view" checked={productCard.showQuickView ?? true} onChange={(v) => setProductCard({ showQuickView: v })} />
      </div>
    </div>
  );
}
