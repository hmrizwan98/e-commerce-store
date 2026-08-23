import React from "react";
import { getActiveThemeConfig } from "@/lib/theme/theme-repository";
import { THEME_PRESETS } from "@/lib/theme/theme-presets";
import ThemesSelectorClient from "./ThemesSelectorClient";

export const dynamic = "force-dynamic";

export default async function AdminAppearanceThemesPage() {
  const activeTheme = await getActiveThemeConfig();

  return (
    <ThemesSelectorClient
      activePresetId={activeTheme.presetId}
      presets={Object.values(THEME_PRESETS).filter((p): p is NonNullable<typeof p> => Boolean(p))}
    />
  );
}
