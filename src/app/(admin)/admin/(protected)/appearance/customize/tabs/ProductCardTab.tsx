"use client";

import NativeSelect from "@/components/ui/NativeSelect";
import React from "react";
import type { SystemThemeConfig, ProductCardThemeConfig } from "@/lib/theme/theme-types";

export interface TabProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

const VARIANTS: { value: NonNullable<ProductCardThemeConfig["variant"]>; label: string; description: string }[] = [
  { value: "sleek-pill", label: "Sleek Pill", description: "Soft image tile, price pill and rating. Default for Modern Minimal." },
  { value: "trend-glass", label: "Trend Glass (2026 Modern)", description: "Gradient discount badge, frosted glass buttons, savings pill." },
  { value: "deal-card", label: "Deal Card (SS3 Style)", description: "Top original price, red discount badge, pill Buy Now button." },
  { value: "minimal", label: "Minimal", description: "Clean rounded cards, soft hover reveal." },
  { value: "bold-grid", label: "Bold grid", description: "Sharp corners, high contrast, dense grid." },
  { value: "editorial", label: "Editorial", description: "Serif type, 3:4 imagery, understated actions." },
];

type CardOption = "aspectRatio" | "badgePosition" | "showSecondaryImageOnHover" | "showQuickAdd" | "showWishlist" | "showCompare" | "showQuickView" | "showColorSwatches";

/** Which options each card design actually renders (checked against the card components). */
const SUPPORTED: Record<string, CardOption[]> = {
  "sleek-pill": ["aspectRatio", "badgePosition", "showSecondaryImageOnHover", "showWishlist", "showColorSwatches"],
  "trend-glass": ["aspectRatio", "badgePosition", "showSecondaryImageOnHover", "showQuickAdd", "showWishlist", "showQuickView"],
  "deal-card": ["aspectRatio", "badgePosition", "showSecondaryImageOnHover", "showQuickAdd", "showWishlist", "showCompare", "showQuickView"],
  minimal: ["aspectRatio", "badgePosition", "showSecondaryImageOnHover", "showQuickAdd", "showWishlist", "showCompare", "showQuickView"],
  "bold-grid": ["aspectRatio", "badgePosition", "showSecondaryImageOnHover", "showQuickAdd", "showWishlist", "showCompare", "showQuickView", "showColorSwatches"],
  editorial: ["aspectRatio", "badgePosition", "showSecondaryImageOnHover", "showQuickAdd", "showWishlist", "showCompare", "showQuickView"],
  classic: ["showColorSwatches"],
};

function Toggle({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex items-center justify-between gap-3 py-2 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
      <span className="text-sm font-medium">
        {label}
        {disabled && <span className="block text-[11px] font-normal text-slate-500">Not part of this card design</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
      />
    </label>
  );
}

export default function ProductCardTab({ draft, onChange }: TabProps) {
  const productCard = draft.productCard ?? {};
  const setProductCard = (patch: Partial<ProductCardThemeConfig>) => onChange({ productCard: { ...productCard, ...patch } });
  // No saved design = the storefront's classic card; "sleek" is an older alias of sleek-pill.
  const activeVariant = productCard.variant === "sleek" ? "sleek-pill" : productCard.variant ?? "classic";
  const supports = (o: CardOption) => (SUPPORTED[activeVariant] ?? []).includes(o);

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
          const selected = activeVariant === v.value;
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

      {activeVariant === "classic" && (
        <p className="text-xs text-slate-500 -mt-4">No design chosen yet - your store uses the classic card. Pick one above to unlock its options.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
        <div className={`space-y-1.5 py-2 ${supports("aspectRatio") ? "" : "opacity-50"}`}>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Image aspect ratio
          </label>
          <NativeSelect size="sm"
            disabled={!supports("aspectRatio")}
            value={productCard.aspectRatio ?? "1:1"}
            onChange={(e) => setProductCard({ aspectRatio: e.target.value as any })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            <option value="1:1">Square (1:1)</option>
            <option value="4:3">Landscape (4:3)</option>
            <option value="3:4">Portrait (3:4)</option>
            <option value="4:5">Portrait (4:5)</option>
          </NativeSelect>
        </div>
        <div className={`space-y-1.5 py-2 ${supports("badgePosition") ? "" : "opacity-50"}`}>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Badge position
          </label>
          <NativeSelect size="sm"
            disabled={!supports("badgePosition")}
            value={productCard.badgePosition ?? "top-left"}
            onChange={(e) => setProductCard({ badgePosition: e.target.value as any })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            <option value="top-left">Top left</option>
            <option value="top-right">Top right</option>
          </NativeSelect>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        <Toggle
          label="Secondary image on hover"
          disabled={!supports("showSecondaryImageOnHover")}
          checked={productCard.showSecondaryImageOnHover ?? true}
          onChange={(v) => setProductCard({ showSecondaryImageOnHover: v })}
        />
        <Toggle label="Quick add / hover actions" disabled={!supports("showQuickAdd")} checked={productCard.showQuickAdd ?? true} onChange={(v) => setProductCard({ showQuickAdd: v })} />
        <Toggle label="Wishlist" disabled={!supports("showWishlist")} checked={productCard.showWishlist ?? true} onChange={(v) => setProductCard({ showWishlist: v })} />
        <Toggle label="Compare" disabled={!supports("showCompare")} checked={productCard.showCompare ?? true} onChange={(v) => setProductCard({ showCompare: v })} />
        <Toggle label="Quick view" disabled={!supports("showQuickView")} checked={productCard.showQuickView ?? true} onChange={(v) => setProductCard({ showQuickView: v })} />
        <Toggle label="Show color swatches (circles)" disabled={!supports("showColorSwatches")} checked={productCard.showColorSwatches ?? true} onChange={(v) => setProductCard({ showColorSwatches: v })} />
      </div>
    </div>
  );
}
