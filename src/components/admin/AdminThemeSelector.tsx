"use client";

import React from "react";
import { ADMIN_THEME_PRESETS, type AdminThemeKey } from "@/lib/theme/admin-theme-presets";
import { CheckIcon } from "@heroicons/react/24/outline";

interface AdminThemeSelectorProps {
  selectedTheme: string;
  onSelect: (themeId: string) => void;
}

export default function AdminThemeSelector({ selectedTheme, onSelect }: AdminThemeSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
          Store Admin Color Theme
        </label>
        <p className="text-xs text-slate-500">
          Choose a harmonized theme palette where the top header and sidebar navigation match seamlessly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.keys(ADMIN_THEME_PRESETS) as AdminThemeKey[]).map((key) => {
          const preset = ADMIN_THEME_PRESETS[key];
          const isSelected = (selectedTheme || "indigo") === key;

          return (
            <div
              key={key}
              onClick={() => onSelect(key)}
              className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/30 shadow-sm ring-2 ring-indigo-500/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-white dark:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {preset.name}
                </span>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Live Mini Preview Frame */}
              <div className="rounded-xl overflow-hidden border border-slate-700/60 shadow-2xs flex">
                {/* Mini Sidebar */}
                <div className={`w-12 h-10 ${preset.sidebarBg} border-r border-slate-700/40 p-1 flex flex-col justify-between`}>
                  <div className="w-3 h-3 rounded bg-white/30" />
                  <div className="w-8 h-2 rounded bg-white/20" />
                </div>
                {/* Mini Header + Body */}
                <div className="flex-1 flex flex-col">
                  <div className={`h-4 ${preset.headerGradient}`} />
                  <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-1">
                    <div className="w-full h-full rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                {preset.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
