import React from "react";
import { getDraftThemeConfig, getActiveThemeConfig } from "@/lib/theme/theme-repository";
import PopupsBuilderClient from "./PopupsBuilderClient";

export const dynamic = "force-dynamic";

export default async function AdminAppearancePopupsPage() {
  const draftTheme = await getDraftThemeConfig();
  const activeTheme = await getActiveThemeConfig();

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-wider mb-2">
          📣 Storefront Marketing &amp; Engagement
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Popups &amp; Modals Builder
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure promo popups, delay triggers, exit-intent banners, and discount modals for your store.
        </p>
      </div>
      <PopupsBuilderClient draftTheme={draftTheme} activeTheme={activeTheme} />
    </div>
  );
}
