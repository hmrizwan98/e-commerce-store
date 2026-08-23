"use client";

import React from "react";
import { THEME_PRESETS } from "@/lib/theme/theme-presets";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";

export interface TabProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

export default function ThemeTab({ draft, onChange }: TabProps) {
  return (
    <div className="space-y-5 w-full min-w-0">
      <div>
        <h2 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Theme Preset</h2>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          Choosing a preset updates colors, typography, header, footer, and card styling in your draft.
        </p>
      </div>

      <div className="space-y-3 w-full min-w-0">
        {Object.values(THEME_PRESETS).map((preset) => {
          const isSelected = draft.presetId === preset.presetId;
          return (
            <button
              key={preset.presetId}
              type="button"
              onClick={() => onChange(preset)}
              className={`w-full text-left border rounded-xl p-4 space-y-2.5 transition-all cursor-pointer ${
                isSelected
                  ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-white dark:bg-slate-900/60"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">{preset.name}</h3>
                {isSelected && (
                  <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0">
                    Selected
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {[preset.colors.primary, preset.colors.secondary, preset.colors.accent].map((c, i) => (
                  <span key={i} className="w-5 h-5 rounded-full border border-black/10 shadow-2xs shrink-0" style={{ background: c }} />
                ))}
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
                <p className="truncate"><span className="font-bold text-slate-700 dark:text-slate-300 font-sans">Header:</span> {preset.header.variant}</p>
                <p className="truncate"><span className="font-bold text-slate-700 dark:text-slate-300 font-sans">Footer:</span> {preset.footer.variant}</p>
                <p className="truncate"><span className="font-bold text-slate-700 dark:text-slate-300 font-sans">Font:</span> {preset.typography.headingFont}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
