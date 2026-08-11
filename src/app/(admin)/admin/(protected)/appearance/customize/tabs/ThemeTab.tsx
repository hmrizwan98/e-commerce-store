"use client";

import React from "react";
import { THEME_PRESETS } from "@/lib/theme/theme-presets";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";

export interface TabProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

/**
 * Selecting a preset here only updates the in-memory draft (via onChange) -
 * unlike /admin/appearance/themes' "Activate & Publish" button, it never
 * touches the live storefront until the toolbar's Save Draft/Publish runs.
 */
export default function ThemeTab({ draft, onChange }: TabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Theme preset</h2>
        <p className="text-sm text-slate-500 mt-1">
          Choosing a preset replaces colors, typography, header, footer and product card styling in your draft.
          Nothing changes on your live storefront until you publish.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(THEME_PRESETS).map((preset) => {
          const isSelected = draft.presetId === preset.presetId;
          return (
            <button
              key={preset.presetId}
              onClick={() => onChange(preset)}
              className={`text-left border rounded-2xl p-5 space-y-3 transition-all ${
                isSelected
                  ? "border-sky-500 ring-2 ring-sky-500/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{preset.name}</h3>
                {isSelected && (
                  <span className="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
              </div>
              <div className="flex gap-1.5">
                {[preset.colors.primary, preset.colors.secondary, preset.colors.accent].map((c, i) => (
                  <span key={i} className="w-6 h-6 rounded-full border border-black/10" style={{ background: c }} />
                ))}
              </div>
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <p>Header: {preset.header.variant}</p>
                <p>Footer: {preset.footer.variant}</p>
                <p>Font: {preset.typography.headingFont}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
