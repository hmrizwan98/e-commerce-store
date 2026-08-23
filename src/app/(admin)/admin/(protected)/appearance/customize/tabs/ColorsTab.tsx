"use client";

import React from "react";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";
import type { ThemeColors, ThemeDarkColors } from "@/types/theme";

export interface TabProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value?: string;
  fallback: string;
  onChange: (hex: string) => void;
}) {
  const safeValue = value && HEX_RE.test(value) ? value : fallback;

  return (
    <div className="space-y-1 min-w-0 w-full">
      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
        {label}
      </label>
      <div className="flex items-center gap-1.5 min-w-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
        {/* Visual Color Swatch Box */}
        <div
          className="w-6 h-6 rounded-lg shrink-0 border border-slate-300 dark:border-slate-700 relative overflow-hidden shadow-2xs cursor-pointer"
          style={{ backgroundColor: safeValue }}
          title={`Click to pick color (${safeValue})`}
        >
          <input
            type="color"
            value={safeValue}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </div>
        {/* Hex Code Input Field */}
        <input
          type="text"
          value={value ?? ""}
          placeholder={fallback}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "" || HEX_RE.test(v)) onChange(v);
          }}
          style={{ border: "none", outline: "none", boxShadow: "none" }}
          className="w-full min-w-0 bg-transparent text-xs font-mono font-bold text-slate-800 dark:text-slate-100 border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none shadow-none px-1"
        />
      </div>
    </div>
  );
}

const LIGHT_FIELDS: { key: keyof ThemeColors; label: string; fallback: string }[] = [
  { key: "primary", label: "Primary", fallback: "#0284c7" },
  { key: "secondary", label: "Secondary", fallback: "#16a34a" },
  { key: "accent", label: "Accent", fallback: "#7c3aed" },
  { key: "background", label: "Background", fallback: "#ffffff" },
  { key: "surface", label: "Surface", fallback: "#f8fafc" },
  { key: "card", label: "Card", fallback: "#ffffff" },
  { key: "border", label: "Border", fallback: "#e5e7eb" },
  { key: "heading", label: "Heading Text", fallback: "#111827" },
  { key: "text", label: "Body Text", fallback: "#111827" },
  { key: "mutedText", label: "Muted Text", fallback: "#6b7280" },
  { key: "buttonBackground", label: "Button Background", fallback: "#0f172a" },
  { key: "buttonText", label: "Button Text", fallback: "#f8fafc" },
];

const DARK_FIELDS: { key: keyof ThemeDarkColors; label: string; fallback: string }[] = [
  { key: "primary", label: "Primary", fallback: "#0284c7" },
  { key: "background", label: "Background", fallback: "#0a0a0a" },
  { key: "card", label: "Card", fallback: "#171717" },
  { key: "text", label: "Body Text", fallback: "#e5e5e5" },
  { key: "headerBackground", label: "Header Background", fallback: "#171717" },
  { key: "footerBackground", label: "Footer Background", fallback: "#171717" },
  { key: "border", label: "Border", fallback: "#262626" },
];

export default function ColorsTab({ draft, onChange }: TabProps) {
  const colors = draft.colors ?? {};
  const darkColors = draft.darkColors ?? {};
  const darkModeEnabled = draft.darkMode?.enabled ?? false;

  return (
    <div className="space-y-6 w-full min-w-0">
      <div>
        <h2 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Colors &amp; Palette</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Customize light and dark mode colors. All inputs update live in real-time.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full min-w-0">
        {LIGHT_FIELDS.map((f) => (
          <ColorField
            key={f.key}
            label={f.label}
            value={(colors as any)[f.key]}
            fallback={f.fallback}
            onChange={(hex) => onChange({ colors: { ...colors, [f.key]: hex } })}
          />
        ))}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4 w-full min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Dark mode</h3>
            <p className="text-[11px] text-slate-500">Lets storefront visitors switch to dark mode.</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
            <input
              type="checkbox"
              checked={darkModeEnabled}
              onChange={(e) => onChange({ darkMode: { ...draft.darkMode, enabled: e.target.checked } })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            {darkModeEnabled ? "Enabled" : "Disabled"}
          </label>
        </div>

        {darkModeEnabled && (
          <div className="grid grid-cols-2 gap-3 w-full min-w-0 pt-2">
            {DARK_FIELDS.map((f) => (
              <ColorField
                key={f.key}
                label={f.label}
                value={(darkColors as any)[f.key]}
                fallback={f.fallback}
                onChange={(hex) => onChange({ darkColors: { ...darkColors, [f.key]: hex } })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
