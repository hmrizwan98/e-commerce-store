"use client";

import React from "react";
import { ADMIN_THEME_PRESETS, type AdminThemeKey } from "@/lib/theme/admin-theme-presets";
import { CheckIcon } from "@heroicons/react/24/outline";

interface AdminThemeSelectorProps {
  selectedTheme: string;
  onSelect: (themeId: string) => void;
}

/** Short, plain-language descriptions shown on the cards (preset ids/classes are unchanged). */
const CARD_TEXT: Record<string, string> = {
  indigo: "Navy sidebar, indigo-to-sky header",
  emerald: "Charcoal sidebar, emerald-to-teal header",
  sunset: "Plum sidebar, purple-to-rose header",
  midnight: "Black sidebar, deep slate header",
  ocean: "Sapphire sidebar, blue-to-teal header",
  amber: "Espresso sidebar, amber-to-gold header",
};

/** Miniature of the real admin layout: sidebar with an active item, gradient header, content. */
function MiniAdmin({ themeKey }: { themeKey: AdminThemeKey }) {
  const preset = ADMIN_THEME_PRESETS[themeKey];
  return (
    <div className="rounded-xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10 shadow-2xs flex h-24 bg-[#f0f4fa] dark:bg-slate-950" aria-hidden="true">
      <div className={`w-14 ${preset.sidebarBg} flex flex-col gap-1.5 py-2 pl-1.5`}>
        <div className="w-6 h-1.5 rounded-full bg-white/50 ml-0.5 mb-1" />
        {[0, 1, 2, 3].map((i) =>
          i === 1 ? (
            // Active tab - same "cut-out" look as the real sidebar, in the theme's accent.
            <div key={i} className="h-3 rounded-l-md bg-[#f0f4fa] dark:bg-slate-950 flex items-center pl-1.5">
              <div className="w-6 h-1 rounded-full" style={{ background: preset.accentColor }} />
            </div>
          ) : (
            <div key={i} className="w-8 h-1 rounded-full bg-white/25 ml-1.5 my-1" />
          )
        )}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className={`h-5 ${preset.headerGradient} flex items-center justify-end gap-1 px-1.5`}>
          <span className="w-2 h-2 rounded-full bg-white/40" />
          <span className="w-2 h-2 rounded-full bg-white/40" />
        </div>
        <div className="flex-1 p-1.5 grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded bg-white dark:bg-slate-900 ring-1 ring-black/5 p-1 flex flex-col justify-between">
              <div className="w-3/4 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="w-1/2 h-1.5 rounded-full" style={{ background: i === 0 ? preset.accentColor : "rgb(203 213 225)" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminThemeSelector({ selectedTheme, onSelect }: AdminThemeSelectorProps) {
  const current = (selectedTheme || "indigo") as AdminThemeKey;
  const keys = Object.keys(ADMIN_THEME_PRESETS) as AdminThemeKey[];

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = keys[(index + delta + keys.length) % keys.length];
    onSelect(next);
    (e.currentTarget.parentElement?.children[(index + delta + keys.length) % keys.length] as HTMLElement | undefined)?.focus();
  };

  return (
    <div className="space-y-3">
      <div>
        <p id="admin-theme-label" className="block text-sm font-bold text-slate-900 dark:text-slate-100">
          Store Admin Color Theme
        </p>
        <p className="text-xs text-slate-500">
          Colours for this admin panel only (sidebar, header and highlights) - your storefront isn&apos;t affected. Click Save Changes to apply.
        </p>
      </div>

      <div role="radiogroup" aria-labelledby="admin-theme-label" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {keys.map((key, index) => {
          const preset = ADMIN_THEME_PRESETS[key];
          const isSelected = current === key;
          return (
            <button
              type="button"
              key={key}
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelect(key)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={`text-left p-3 rounded-2xl border-2 transition-all relative flex flex-col gap-2.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 ${
                isSelected
                  ? "bg-white dark:bg-slate-900 shadow-md"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 bg-white dark:bg-slate-900"
              }`}
              style={isSelected ? { borderColor: preset.accentColor, boxShadow: `0 0 0 4px ${preset.accentColor}22` } : undefined}
            >
              <MiniAdmin themeKey={key} />
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="block text-xs font-extrabold tracking-tight text-slate-900 dark:text-white">{preset.name}</span>
                  <span className="block text-[11px] text-slate-500 leading-snug mt-0.5">{CARD_TEXT[key] ?? preset.description}</span>
                </div>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${isSelected ? "text-white" : "ring-1 ring-slate-300 dark:ring-slate-700"}`}
                  style={isSelected ? { background: preset.accentColor } : undefined}
                >
                  {isSelected && <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
