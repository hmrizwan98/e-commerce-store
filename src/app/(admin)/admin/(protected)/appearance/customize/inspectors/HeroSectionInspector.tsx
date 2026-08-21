"use client";

import React from "react";
import Link from "next/link";
import { PlusIcon, ArrowTopRightOnSquareIcon, PhotoIcon } from "@heroicons/react/24/outline";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";

export interface HeroSectionInspectorProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function HeroSectionInspector({ draft, onChange }: HeroSectionInspectorProps) {
  const banner = draft.banner ?? {
    heightPx: 400,
    textAlign: "center",
    overlayEnabled: true,
    overlayOpacity: 0.3,
  };

  const updateBanner = (patch: Partial<NonNullable<SystemThemeConfig["banner"]>>) => {
    onChange({ banner: { ...banner, ...patch } });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Hero Banner Inspector
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure hero slider presentation, banner height, alignment, and slide contents.
        </p>
      </div>

      {/* Hero Slides Direct Action Box */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
            <PhotoIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Hero Slider Management</span>
          </div>
          <span className="text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
            Multiple Slides Supported
          </span>
        </div>
        <p className="text-xs text-indigo-900/70 dark:text-indigo-300/70 leading-relaxed">
          Add, edit, reorder slide images, main headings, sub-headings, and shop now buttons.
        </p>
        <div className="flex flex-col gap-2 pt-1">
          <a
            href="/admin/hero-slides/new"
            target="_blank"
            rel="noreferrer"
            className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add New Hero Slide ↗
          </a>
          <a
            href="/admin/hero-slides"
            target="_blank"
            rel="noreferrer"
            className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            Manage &amp; Reorder All Slides
          </a>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Hero Style
          </label>
          <select
            className={inputClass}
            value={draft.hero?.variant ?? "generic"}
            onChange={(e) => onChange({ hero: { ...draft.hero, variant: e.target.value as any } })}
          >
            <option value="image-only">🖼️ Full-Width Image Only (Pure Banners, No Text)</option>
            <option value="generic">Generic (default slider with text overlay)</option>
            <option value="luxe">Luxe (editorial, serif copy)</option>
            <option value="minimal">Minimal (clean, lifestyle banner)</option>
            <option value="bold-street">Bold Street (dark, high-contrast)</option>
            <option value="tech">Tech (category sidebar + deal card)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Banner Height (px)
          </label>
          <input
            type="number"
            className={inputClass}
            value={banner.heightPx ?? 400}
            onChange={(e) => updateBanner({ heightPx: Number(e.target.value) || 400 })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Text Alignment
          </label>
          <select
            className={inputClass}
            value={banner.textAlign ?? "center"}
            onChange={(e) => updateBanner({ textAlign: e.target.value as "left" | "center" | "right" })}
          >
            <option value="left">Left Aligned</option>
            <option value="center">Centered</option>
            <option value="right">Right Aligned</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Overlay Opacity ({Math.round((banner.overlayOpacity ?? 0.3) * 100)}%)
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            className="w-full cursor-pointer accent-sky-600"
            value={banner.overlayOpacity ?? 0.3}
            onChange={(e) => updateBanner({ overlayOpacity: Number(e.target.value) })}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={banner.overlayEnabled ?? true}
            onChange={(e) => updateBanner({ overlayEnabled: e.target.checked })}
            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
          />
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Enable Banner Overlay Shade
          </span>
        </label>
      </div>
    </div>
  );
}
