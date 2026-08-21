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
        <h1 className="text-2xl font-bold">Theme</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Your store&apos;s default theme. Customize colors, typography, and section content below.
        </p>
      </div>
      <ThemesSelectorClient
        activePresetId={activeTheme.presetId}
        presets={Object.values(THEME_PRESETS).filter((p): p is NonNullable<typeof p> => Boolean(p))}
      />
    </div>
  );
}
