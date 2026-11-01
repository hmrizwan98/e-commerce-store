"use client";

import NativeSelect from "@/components/ui/NativeSelect";
import React from "react";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";
import { isThemeTopBarActive } from "@/lib/theme/announcement";

export interface AnnouncementBarInspectorProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function AnnouncementBarInspector({ draft, onChange }: AnnouncementBarInspectorProps) {
  // Nothing saved = the storefront shows no theme bar, so show it as off/empty here too.
  const topBar = draft.header?.topBar ?? { enabled: false, text: "" };
  const active = isThemeTopBarActive(topBar);

  const updateTopBar = (patch: Partial<NonNullable<SystemThemeConfig["header"]["topBar"]>>) => {
    onChange({
      header: {
        ...draft.header,
        topBar: { ...topBar, ...patch },
      },
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Announcement Bar Settings
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize the top message banner displayed across all store pages.
        </p>
      </div>

      {/* The store shows ONE bar: this one when it's on and has text, otherwise the one from
          Content -> Announcements. */}
      <p
        className={`text-[11px] leading-snug p-2.5 rounded-lg border ${
          active
            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
            : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900"
        }`}
      >
        {active
          ? "This bar is shown on your store. It replaces the bar from Content → Announcements."
          : topBar.enabled
          ? "Add some text below to show this bar. Until then your store shows the bar from Content → Announcements (if any)."
          : "This bar is off, so your store shows the bar from Content → Announcements (if any). Turn it on to use your own text here."}
      </p>

      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Announcement Bar Style
          </label>
          <NativeSelect size="sm"
            className={inputClass}
            value={draft.announcementBar?.variant ?? "generic"}
            onChange={(e) => onChange({ announcementBar: { ...draft.announcementBar, variant: e.target.value as any } })}
          >
            <option value="generic">Generic (default bar)</option>
            <option value="luxe">Luxe (centered serif)</option>
            <option value="minimal">Minimal (clean, compact)</option>
            <option value="bold-street">Bold Street (high-contrast)</option>
            <option value="tech">Tech (dark, accented)</option>
          </NativeSelect>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={topBar.enabled ?? false}
            onChange={(e) => updateTopBar({ enabled: e.target.checked })}
            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
          />
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Enable Top Announcement Bar
          </span>
        </label>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Banner Text
          </label>
          <input
            type="text"
            className={inputClass}
            value={topBar.text ?? ""}
            placeholder="e.g. Free delivery on orders over Rs 3,000"
            onChange={(e) => updateTopBar({ text: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Top Bar Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
              value={draft.colors?.topBarBackground ?? "#000000"}
              onChange={(e) =>
                onChange({
                  colors: { ...draft.colors, topBarBackground: e.target.value },
                })
              }
            />
            <input
              type="text"
              className={inputClass}
              value={draft.colors?.topBarBackground ?? "#000000"}
              onChange={(e) =>
                onChange({
                  colors: { ...draft.colors, topBarBackground: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
            <input
              type="text"
              className={inputClass}
              value={topBar.phone ?? ""}
              placeholder="+1 (555) 000-0000"
              onChange={(e) => updateTopBar({ phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="text"
              className={inputClass}
              value={topBar.email ?? ""}
              placeholder="support@yourstore.com"
              onChange={(e) => updateTopBar({ email: e.target.value })}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={topBar.showSocialIcons ?? false}
            onChange={(e) => updateTopBar({ showSocialIcons: e.target.checked })}
            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
          />
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Show Social Icons in Top Bar
          </span>
        </label>
      </div>
    </div>
  );
}
