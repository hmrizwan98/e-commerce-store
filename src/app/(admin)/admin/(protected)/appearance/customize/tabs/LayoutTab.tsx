"use client";

import React from "react";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";
import type { TransitionSpeed } from "@/types/theme";

export interface TabProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

const SPEED_OPTIONS: { value: TransitionSpeed; label: string }[] = [
  { value: "fast", label: "Fast (100ms)" },
  { value: "normal", label: "Normal (200ms)" },
  { value: "slow", label: "Slow (350ms)" },
];

export default function LayoutTab({ draft, onChange }: TabProps) {
  const layout = draft.layout ?? {};
  const setLayout = (patch: Partial<typeof layout>) => onChange({ layout: { ...layout, ...patch } });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Layout &amp; Spacing</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure container widths, grid gaps, section padding, and global animation speeds.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Container Width ({layout.containerWidthPx ?? 1280}px)
          </label>
          <input
            type="range"
            min={1024}
            max={1600}
            step={32}
            value={layout.containerWidthPx ?? 1280}
            onChange={(e) => setLayout({ containerWidthPx: parseInt(e.target.value, 10) })}
            className="w-full"
          />
        </div>

        <div className="space-y-1.5">
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
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Section Padding ({layout.sectionPaddingPx ?? 96}px)
          </label>
          <input
            type="range"
            min={32}
            max={144}
            step={8}
            value={layout.sectionPaddingPx ?? 96}
            onChange={(e) => setLayout({ sectionPaddingPx: parseInt(e.target.value, 10) })}
            className="w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Section Margin ({layout.sectionMarginPx ?? 96}px)
          </label>
          <input
            type="range"
            min={32}
            max={144}
            step={8}
            value={layout.sectionMarginPx ?? 96}
            onChange={(e) => setLayout({ sectionMarginPx: parseInt(e.target.value, 10) })}
            className="w-full"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Global Motion / Animation Speed
          </label>
          <select
            value={layout.animationSpeed ?? "normal"}
            onChange={(e) => setLayout({ animationSpeed: e.target.value as TransitionSpeed })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            {SPEED_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
