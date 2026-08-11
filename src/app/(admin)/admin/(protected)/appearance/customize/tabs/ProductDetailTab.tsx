"use client";

import React from "react";
import type { SystemThemeConfig, ProductDetailThemeConfig } from "@/lib/theme/theme-types";

export interface TabProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

const VARIANTS: { value: NonNullable<ProductDetailThemeConfig["variant"]>; label: string; description: string }[] = [
  { value: "minimal", label: "Minimal", description: "Clean 2-column layout, standard purchase panel." },
  { value: "bold", label: "Bold", description: "Sticky purchase panel, strong CTA, stock urgency." },
  { value: "luxury", label: "Luxury", description: "Editorial imagery, serif type, spacious accordion." },
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

export default function ProductDetailTab({ draft, onChange }: TabProps) {
  const productDetail = draft.productDetail ?? {};
  const setProductDetail = (patch: Partial<ProductDetailThemeConfig>) => onChange({ productDetail: { ...productDetail, ...patch } });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Product detail page</h2>
        <p className="text-sm text-slate-500 mt-1">
          Controls the product page layout. Variant selection, quantity, add-to-cart, reviews and related products
          are unchanged - only presentation and arrangement differ.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {VARIANTS.map((v) => {
          const selected = (productDetail.variant ?? "minimal") === v.value;
          return (
            <button
              key={v.value}
              onClick={() => setProductDetail({ variant: v.value })}
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
            Gallery
          </label>
          <select
            value={productDetail.galleryStyle ?? "clickable-thumbnails"}
            onChange={(e) => setProductDetail({ galleryStyle: e.target.value as any })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            <option value="clickable-thumbnails">Clickable thumbnails</option>
            <option value="static">Static thumbnails</option>
          </select>
        </div>
        <div className="space-y-1.5 py-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Purchase panel
          </label>
          <select
            value={productDetail.purchasePanelStyle ?? "standard"}
            onChange={(e) => setProductDetail({ purchasePanelStyle: e.target.value as any })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            <option value="standard">Standard</option>
            <option value="sticky">Sticky</option>
            <option value="compact">Compact</option>
          </select>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
        <Toggle label="Compare button" checked={productDetail.showCompare ?? true} onChange={(v) => setProductDetail({ showCompare: v })} />
      </div>
    </div>
  );
}
