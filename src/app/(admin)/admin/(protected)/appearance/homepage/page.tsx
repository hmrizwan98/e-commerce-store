import React from "react";
import { getDraftThemeConfig, getActiveThemeConfig } from "@/lib/theme/theme-repository";
import HomepageBuilderClient from "./HomepageBuilderClient";

export const dynamic = "force-dynamic";

export default async function AdminAppearanceHomepagePage() {
  const draftTheme = await getDraftThemeConfig();
  const activeTheme = await getActiveThemeConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Homepage Builder</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Reorder, toggle, and configure sections for your store&apos;s homepage. Edits are saved to your draft before publishing.
        </p>
      </div>
      <HomepageBuilderClient draftTheme={draftTheme} activeTheme={activeTheme} />
    </div>
  );
}
