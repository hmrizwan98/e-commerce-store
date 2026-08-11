import React from "react";
import { getActiveThemeConfig } from "@/lib/theme/theme-repository";
import { THEME_PRESETS } from "@/lib/theme/theme-presets";
import ThemesSelectorClient from "./ThemesSelectorClient";

export const dynamic = "force-dynamic";

export default async function AdminAppearanceThemesPage() {
  const activeTheme = await getActiveThemeConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Theme Catalog</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Select a storefront preset theme to customize your store&apos;s visual appearance.
        </p>
      </div>
      <ThemesSelectorClient activePresetId={activeTheme.presetId} presets={Object.values(THEME_PRESETS)} />
    </div>
  );
}
