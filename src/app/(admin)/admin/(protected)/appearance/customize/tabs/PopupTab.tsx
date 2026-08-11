"use client";

import React from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import type { SystemThemeConfig, PopupThemeConfig } from "@/lib/theme/theme-types";

export interface TabProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 py-2 cursor-pointer">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
      />
    </label>
  );
}

export default function PopupTab({ draft, onChange }: TabProps) {
  const popup: PopupThemeConfig = draft.popup ?? {};
  const setPopup = (patch: Partial<PopupThemeConfig>) => onChange({ popup: { ...popup, ...patch } });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Popup</h2>
          <p className="text-sm text-slate-500 mt-1">
            A promotional modal shown to storefront visitors based on the trigger and frequency below.
          </p>
        </div>
        <Toggle label={popup.enabled ? "Enabled" : "Disabled"} checked={popup.enabled ?? false} onChange={(v) => setPopup({ enabled: v })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Title
          </label>
          <input
            type="text"
            value={popup.title ?? ""}
            onChange={(e) => setPopup({ title: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Button text
          </label>
          <input
            type="text"
            value={popup.buttonText ?? ""}
            onChange={(e) => setPopup({ buttonText: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Description
        </label>
        <textarea
          value={popup.description ?? ""}
          onChange={(e) => setPopup({ description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Button target URL
        </label>
        <input
          type="text"
          value={popup.buttonUrl ?? ""}
          onChange={(e) => setPopup({ buttonUrl: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Trigger
          </label>
          <select
            value={popup.trigger ?? "page-load"}
            onChange={(e) => setPopup({ trigger: e.target.value as any })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            <option value="page-load">Page load</option>
            <option value="delay">Time delay</option>
            <option value="exit-intent">Exit intent</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Delay (seconds)
          </label>
          <input
            type="number"
            min={0}
            max={60}
            value={popup.delaySeconds ?? 3}
            onChange={(e) => setPopup({ delaySeconds: parseInt(e.target.value, 10) || 0 })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Frequency
          </label>
          <select
            value={popup.frequency ?? "once-per-session"}
            onChange={(e) => setPopup({ frequency: e.target.value as any })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            <option value="once-per-session">Once per session</option>
            <option value="once-per-day">Once per day</option>
            <option value="always">Always</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Style
        </label>
        <select
          value={popup.styleVariant ?? "center-modal"}
          onChange={(e) => setPopup({ styleVariant: e.target.value as any })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        >
          <option value="center-modal">Center modal</option>
          <option value="bottom-slide">Bottom slide</option>
          <option value="full-overlay">Full overlay</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Image banner (optional)
        </label>
        <ImageUploader
          value={popup.imageUrl ? [popup.imageUrl] : []}
          onChange={(urls) => setPopup({ imageUrl: urls[0] || "" })}
          imageType="banner"
          multiple={false}
        />
      </div>
    </div>
  );
}
