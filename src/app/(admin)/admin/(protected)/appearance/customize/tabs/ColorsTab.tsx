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
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value ?? ""}
          placeholder={fallback}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "" || HEX_RE.test(v)) onChange(v);
          }}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
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
  { key: "heading", label: "Heading text", fallback: "#111827" },
  { key: "text", label: "Body text", fallback: "#111827" },
  { key: "mutedText", label: "Muted text", fallback: "#6b7280" },
  { key: "buttonBackground", label: "Button background", fallback: "#0f172a" },
  { key: "buttonText", label: "Button text", fallback: "#f8fafc" },
];

const DARK_FIELDS: { key: keyof ThemeDarkColors; label: string; fallback: string }[] = [
  { key: "primary", label: "Primary", fallback: "#0284c7" },
  { key: "background", label: "Background", fallback: "#0a0a0a" },
  { key: "card", label: "Card", fallback: "#171717" },
  { key: "text", label: "Body text", fallback: "#e5e5e5" },
  { key: "headerBackground", label: "Header background", fallback: "#171717" },
  { key: "footerBackground", label: "Footer background", fallback: "#171717" },
  { key: "border", label: "Border", fallback: "#262626" },
];

export default function ColorsTab({ draft, onChange }: TabProps) {
  const colors = draft.colors ?? {};
  const darkColors = draft.darkColors ?? {};
  const darkModeEnabled = draft.darkMode?.enabled ?? false;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold">Colors</h2>
        <p className="text-sm text-slate-500 mt-1">
          Every value is validated as a hex color before it can ever reach the storefront&apos;s stylesheet.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

      <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">Dark mode</h3>
            <p className="text-xs text-slate-500">Lets storefront visitors switch to a dark color scheme.</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
            <input
              type="checkbox"
              checked={darkModeEnabled}
              onChange={(e) => onChange({ darkMode: { ...draft.darkMode, enabled: e.target.checked } })}
              className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
            />
            {darkModeEnabled ? "Enabled" : "Disabled"}
          </label>
        </div>

        {darkModeEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
