"use client";

import React from "react";
import type { SystemThemeConfig, FooterThemeConfig } from "@/lib/theme/theme-types";

export interface TabProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

const VARIANTS: { value: NonNullable<FooterThemeConfig["variant"]>; label: string; description: string }[] = [
  { value: "multi-column", label: "Multi column", description: "Several link columns plus a bottom bar." },
  { value: "newsletter-focused", label: "Newsletter focused", description: "Leads with an email signup block." },
  { value: "minimal-centered", label: "Minimal centered", description: "A compact, centered single row." },
];

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

export default function FooterTab({ draft, onChange }: TabProps) {
  const footer = draft.footer ?? {};
  const setFooter = (patch: Partial<FooterThemeConfig>) => onChange({ footer: { ...footer, ...patch } });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Footer</h2>
        <p className="text-sm text-slate-500 mt-1">
          Controls the footer variant already live on the storefront (MultiColumnFooter / NewsletterFooter /
          MinimalFooter).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {VARIANTS.map((v) => {
          const selected = (footer.variant ?? "multi-column") === v.value;
          return (
            <button
              key={v.value}
              onClick={() => setFooter({ variant: v.value })}
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

      <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-1">
        <Toggle
          label="Show copyright line"
          checked={footer.showCopyright ?? true}
          onChange={(v) => setFooter({ showCopyright: v })}
        />
        {footer.showCopyright && (
          <input
            type="text"
            value={footer.copyrightText ?? ""}
            onChange={(e) => setFooter({ copyrightText: e.target.value })}
            placeholder="Leave blank to use the default store name copyright"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          />
        )}
        <Toggle
          label="Show payment icons"
          checked={footer.showPaymentIcons ?? false}
          onChange={(v) => setFooter({ showPaymentIcons: v })}
        />
        <Toggle
          label="Show newsletter signup"
          checked={footer.showNewsletter ?? false}
          onChange={(v) => setFooter({ showNewsletter: v })}
        />
      </div>
    </div>
  );
}
