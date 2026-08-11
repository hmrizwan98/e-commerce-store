"use client";

import React from "react";
import { FONT_PRESETS, FONT_KEYS } from "@/lib/theme/fonts";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";

export interface TabProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

const HEADING_WEIGHTS = [400, 500, 600, 700, 800] as const;
const BODY_WEIGHTS = [400, 500, 600] as const;

export default function TypographyTab({ draft, onChange }: TabProps) {
  const typography = draft.typography ?? {};

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Typography</h2>
        <p className="text-sm text-slate-500 mt-1">
          Fonts are chosen from a curated, self-hosted set - no arbitrary font names or external font requests.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Heading font
          </label>
          <select
            value={typography.headingFont ?? "poppins"}
            onChange={(e) => onChange({ typography: { ...typography, headingFont: e.target.value as any } })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            {FONT_KEYS.map((key) => (
              <option key={key} value={key}>
                {FONT_PRESETS[key].label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Body font
          </label>
          <select
            value={typography.bodyFont ?? "poppins"}
            onChange={(e) => onChange({ typography: { ...typography, bodyFont: e.target.value as any } })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            {FONT_KEYS.map((key) => (
              <option key={key} value={key}>
                {FONT_PRESETS[key].label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Base font size ({typography.baseFontSizePx ?? 16}px)
          </label>
          <input
            type="range"
            min={12}
            max={20}
            step={1}
            value={typography.baseFontSizePx ?? 16}
            onChange={(e) => onChange({ typography: { ...typography, baseFontSizePx: parseInt(e.target.value, 10) } })}
            className="w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Line height ({(typography.lineHeight ?? 1.5).toFixed(2)})
          </label>
          <input
            type="range"
            min={1.2}
            max={2}
            step={0.05}
            value={typography.lineHeight ?? 1.5}
            onChange={(e) => onChange({ typography: { ...typography, lineHeight: parseFloat(e.target.value) } })}
            className="w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Heading weight
          </label>
          <select
            value={typography.headingWeight ?? 600}
            onChange={(e) => onChange({ typography: { ...typography, headingWeight: parseInt(e.target.value, 10) as any } })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            {HEADING_WEIGHTS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Body weight
          </label>
          <select
            value={typography.bodyWeight ?? 400}
            onChange={(e) => onChange({ typography: { ...typography, bodyWeight: parseInt(e.target.value, 10) as any } })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            {BODY_WEIGHTS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
