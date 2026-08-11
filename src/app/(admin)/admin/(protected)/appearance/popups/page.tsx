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
        <h1 className="text-2xl font-bold">Popups & Modals Builder</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Configure promo popups, delay triggers, exit-intent banners, and discount modals for your store.
        </p>
      </div>
      <PopupsBuilderClient draftTheme={draftTheme} activeTheme={activeTheme} />
    </div>
  );
}
