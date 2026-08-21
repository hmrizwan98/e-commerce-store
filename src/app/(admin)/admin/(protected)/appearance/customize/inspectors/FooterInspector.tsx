"use client";

import React from "react";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";

export interface FooterInspectorProps {
  draft: SystemThemeConfig;
  onChange: (patch: Partial<SystemThemeConfig>) => void;
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function FooterInspector({ draft, onChange }: FooterInspectorProps) {
  const footer = draft.footer ?? {};

  const updateFooter = (patch: Partial<NonNullable<SystemThemeConfig["footer"]>>) => {
    onChange({ footer: { ...footer, ...patch } });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Footer Inspector
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize footer column layout, newsletter signup, payment icons, and copyright text.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Footer Layout Variant
          </label>
          <select
            className={inputClass}
            value={footer.variant ?? "multi-column"}
            onChange={(e) => updateFooter({ variant: e.target.value as "multi-column" | "minimal-centered" | "newsletter-focused" })}
          >
            <option value="multi-column">Multi-Column Standard Footer</option>
            <option value="minimal-centered">Minimal Centered Footer</option>
            <option value="newsletter-focused">Newsletter-Focused Footer</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Footer Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
              value={draft.colors?.footerBackground ?? "#ffffff"}
              onChange={(e) =>
                onChange({
                  colors: { ...draft.colors, footerBackground: e.target.value },
                })
              }
            />
            <input
              type="text"
              className={inputClass}
              value={draft.colors?.footerBackground ?? "#ffffff"}
              onChange={(e) =>
                onChange({
                  colors: { ...draft.colors, footerBackground: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Custom Copyright Line
          </label>
          <input
            type="text"
            className={inputClass}
            value={footer.copyrightText ?? ""}
            placeholder="© 2026 Your Store Name. All Rights Reserved."
            onChange={(e) => updateFooter({ copyrightText: e.target.value })}
          />
        </div>

        <div className="space-y-2 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={footer.showNewsletter ?? true}
              onChange={(e) => updateFooter({ showNewsletter: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Show Newsletter Subscription Form
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={footer.showPaymentIcons ?? true}
              onChange={(e) => updateFooter({ showPaymentIcons: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Show Accepted Payment Icons (Visa, Mastercard, Stripe)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={footer.showCopyright ?? true}
              onChange={(e) => updateFooter({ showCopyright: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Show Bottom Copyright Row
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
