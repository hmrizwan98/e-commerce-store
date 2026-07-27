import React from "react";
import { getAllThemesForAdmin, DEFAULT_THEME } from "@/lib/firebase/repositories/themes";
import ThemeEditor from "./ThemeEditor";

export const dynamic = "force-dynamic";

export default async function AdminThemePage() {
  const themes = await getAllThemesForAdmin();
  const active = themes.find((t) => t.isActive) ?? DEFAULT_THEME;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Theme</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Customize the storefront&apos;s brand identity, colors, typography, and layout. Changes go live on the
          storefront only after you publish a theme.
        </p>
      </div>
      <ThemeEditor themes={themes} activeThemeId={active.id} defaultTheme={DEFAULT_THEME} />
    </div>
  );
}
