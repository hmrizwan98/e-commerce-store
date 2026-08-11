"use client";

import React from "react";
import type { SystemThemeConfig, CartThemeConfig } from "@/lib/theme/theme-types";

export interface TabProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

const VARIANTS: { value: NonNullable<CartThemeConfig["variant"]>; label: string; description: string }[] = [
  { value: "minimal", label: "Minimal", description: "Clean rows, rounded summary card." },
  { value: "bold", label: "Bold", description: "Dense rows, high contrast, strong CTA." },
  { value: "luxury", label: "Luxury", description: "Spacious rows, serif totals, understated CTA." },
];

export default function CartTab({ draft, onChange }: TabProps) {
  const cart = draft.cart ?? {};
  const setCart = (patch: Partial<CartThemeConfig>) => onChange({ cart: { ...cart, ...patch } });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Cart</h2>
        <p className="text-sm text-slate-500 mt-1">
          Controls the /cart page and the header&apos;s cart drawer. Quantity, remove, and totals math are
          unchanged - Redux and computeOrderTotals stay the source of truth.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-bold mb-2">Cart page layout</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {VARIANTS.map((v) => {
            const selected = (cart.variant ?? "minimal") === v.value;
            return (
              <button
                key={v.value}
                onClick={() => setCart({ variant: v.value })}
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 border-t border-slate-200 dark:border-slate-800 pt-4">
        <div className="space-y-1.5 py-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Cart drawer style
          </label>
          <select
            value={cart.drawerStyle ?? "standard"}
            onChange={(e) => setCart({ drawerStyle: e.target.value as any })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            <option value="standard">Standard</option>
            <option value="compact">Compact</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        <div className="space-y-1.5 py-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Item layout (cart page)
          </label>
          <select
            value={cart.itemLayout ?? "detailed"}
            onChange={(e) => setCart({ itemLayout: e.target.value as any })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            <option value="detailed">Detailed</option>
            <option value="compact">Compact</option>
          </select>
        </div>
      </div>
    </div>
  );
}
