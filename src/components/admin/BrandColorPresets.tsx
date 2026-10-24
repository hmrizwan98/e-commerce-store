"use client";

import React from "react";

/** Curated primary/secondary pairs (readable white text on the primary). Clicking one only
 * fills the two colour fields - nothing is saved until "Save Changes". */
export const BRAND_COLOR_PAIRS: { name: string; primary: string; secondary: string }[] = [
  { name: "Indigo", primary: "#4f46e5", secondary: "#0ea5e9" },
  { name: "Emerald", primary: "#047857", secondary: "#14b8a6" },
  { name: "Royal", primary: "#1d4ed8", secondary: "#f59e0b" },
  { name: "Rose", primary: "#be123c", secondary: "#fb7185" },
  { name: "Plum", primary: "#7e22ce", secondary: "#ec4899" },
  { name: "Espresso", primary: "#78350f", secondary: "#d97706" },
  { name: "Charcoal", primary: "#1f2937", secondary: "#9ca3af" },
  { name: "Teal", primary: "#0f766e", secondary: "#f97316" },
];

const HEX = /^#[0-9a-f]{6}$/i;

export default function BrandColorPresets({
  primary,
  secondary,
  onPick,
}: {
  primary?: string;
  secondary?: string;
  onPick: (pair: { primary: string; secondary: string }) => void;
}) {
  const p = primary && HEX.test(primary) ? primary : "#4f46e5";
  const s = secondary && HEX.test(secondary) ? secondary : "#0ea5e9";
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Suggested colour pairs</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Used for your order emails and as a fallback on the storefront. Theme colours are set in Appearance → Customize Storefront.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {BRAND_COLOR_PAIRS.map((pair) => {
          const active = pair.primary.toLowerCase() === p.toLowerCase() && pair.secondary.toLowerCase() === s.toLowerCase();
          return (
            <button
              key={pair.name}
              type="button"
              onClick={() => onPick({ primary: pair.primary, secondary: pair.secondary })}
              aria-pressed={active}
              title={`${pair.name}: ${pair.primary} / ${pair.secondary}`}
              className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                active
                  ? "border-slate-900 dark:border-white text-slate-900 dark:text-white shadow-sm"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400"
              }`}
            >
              <span className="flex -space-x-1.5">
                <span className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-slate-900" style={{ background: pair.primary }} />
                <span className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-slate-900" style={{ background: pair.secondary }} />
              </span>
              {pair.name}
            </button>
          );
        })}
      </div>
      {/* Live sample of the current two colours */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
        <span className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm" style={{ background: p }}>
          Buy now
        </span>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white" style={{ background: s }}>
          New arrival
        </span>
        <span className="text-xs font-bold underline" style={{ color: p }}>
          Track your order
        </span>
      </div>
    </div>
  );
}
