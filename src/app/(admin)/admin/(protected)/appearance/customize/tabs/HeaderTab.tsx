"use client";

import React from "react";
import type { SystemThemeConfig, HeaderThemeConfig } from "@/lib/theme/theme-types";

export interface TabProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

const VARIANTS: { value: NonNullable<HeaderThemeConfig["variant"]>; label: string; description: string }[] = [
  { value: "centered", label: "Centered", description: "Logo centered above a simple nav row." },
  { value: "mega-menu", label: "Mega menu", description: "Wide dropdown navigation with grouped columns." },
  { value: "transparent-overlay", label: "Transparent overlay", description: "Floats over the hero, ideal for large banner imagery." },
];

const SHADOWS = ["none", "sm", "md", "lg", "xl"] as const;

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

export default function HeaderTab({ draft, onChange }: TabProps) {
  const header = draft.header ?? {};
  const topBar = header.topBar ?? {};

  const setHeader = (patch: Partial<HeaderThemeConfig>) => onChange({ header: { ...header, ...patch } });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Header</h2>
        <p className="text-sm text-slate-500 mt-1">
          Controls the header variant already live on the storefront (CenteredHeader / MegaMenuHeader /
          TransparentHeader).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {VARIANTS.map((v) => {
          const selected = (header.variant ?? "centered") === v.value;
          return (
            <button
              key={v.value}
              onClick={() => setHeader({ variant: v.value })}
              className={`text-left border rounded-xl p-4 space-y-1 transition-all ${
                selected ? "border-sky-500 ring-2 ring-sky-500/20" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="font-semibold text-sm">{v.label}</div>
              <div className="text-xs text-slate-500">{v.description}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
        <Toggle label="Sticky on scroll" checked={header.sticky ?? true} onChange={(v) => setHeader({ sticky: v })} />
        <div className="space-y-1.5 py-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Logo alignment
          </label>
          <select
            value={header.logoAlignment ?? "left"}
            onChange={(e) => setHeader({ logoAlignment: e.target.value as any })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
          </select>
        </div>
        <div className="space-y-1.5 py-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Shadow
          </label>
          <select
            value={header.shadow ?? "none"}
            onChange={(e) => setHeader({ shadow: e.target.value as any })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            {SHADOWS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
        <h3 className="font-bold text-sm mb-2">Visible icons</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6">
          <Toggle label="Search" checked={header.showSearch ?? true} onChange={(v) => setHeader({ showSearch: v })} />
          <Toggle label="Wishlist" checked={header.showWishlist ?? true} onChange={(v) => setHeader({ showWishlist: v })} />
          <Toggle label="Compare" checked={header.showCompare ?? true} onChange={(v) => setHeader({ showCompare: v })} />
          <Toggle label="Account" checked={header.showAccount ?? true} onChange={(v) => setHeader({ showAccount: v })} />
          <Toggle label="Cart" checked={header.showCart ?? true} onChange={(v) => setHeader({ showCart: v })} />
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
        <Toggle
          label="Enable top bar"
          checked={topBar.enabled ?? false}
          onChange={(v) => setHeader({ topBar: { ...topBar, enabled: v } })}
        />
        {topBar.enabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Announcement text
              </label>
              <input
                type="text"
                value={topBar.text ?? ""}
                onChange={(e) => setHeader({ topBar: { ...topBar, text: e.target.value } })}
                placeholder="e.g. Free shipping on orders over $50"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Phone
              </label>
              <input
                type="text"
                value={topBar.phone ?? ""}
                onChange={(e) => setHeader({ topBar: { ...topBar, phone: e.target.value } })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Email
              </label>
              <input
                type="text"
                value={topBar.email ?? ""}
                onChange={(e) => setHeader({ topBar: { ...topBar, email: e.target.value } })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
              />
            </div>
            <Toggle
              label="Show social icons"
              checked={topBar.showSocialIcons ?? true}
              onChange={(v) => setHeader({ topBar: { ...topBar, showSocialIcons: v } })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
