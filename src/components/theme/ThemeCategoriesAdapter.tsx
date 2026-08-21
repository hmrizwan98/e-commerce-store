"use client";

import React from "react";
import LuxeCategories from "./variants/categories/LuxeCategories";
import MinimalCategories from "./variants/categories/MinimalCategories";
import BoldStreetCategories from "./variants/categories/BoldStreetCategories";
import TechCategories from "./variants/categories/TechCategories";
import SectionGridMoreExplore from "@/components/SectionGridMoreExplore/SectionGridMoreExplore";
import BackgroundSection from "@/components/BackgroundSection/BackgroundSection";
import type { CategoriesThemeConfig, ThemePresetId } from "@/lib/theme/theme-types";
import type { ExploreType } from "@/components/SectionGridMoreExplore/data";

export interface ThemeCategoriesAdapterProps {
  categoriesSettings?: CategoriesThemeConfig;
  data?: ExploreType[];
  presetId?: ThemePresetId;
  columns?: number;
  heading?: string;
  subHeading?: string;
}

export default function ThemeCategoriesAdapter({
  categoriesSettings,
  data,
  presetId,
  columns,
  heading,
  subHeading,
}: ThemeCategoriesAdapterProps) {
  switch (categoriesSettings?.variant) {
    case "luxe":
      return <LuxeCategories data={data} presetId={presetId} heading={heading} subHeading={subHeading} />;
    case "minimal":
      return <MinimalCategories data={data} presetId={presetId} heading={heading} subHeading={subHeading} />;
    case "bold-street":
      return <BoldStreetCategories data={data} presetId={presetId} heading={heading} subHeading={subHeading} />;
    case "tech":
      return <TechCategories data={data} presetId={presetId} heading={heading} subHeading={subHeading} />;
    default: {
      const cols = columns ?? 3;
      return (
        <div className="relative py-24 lg:py-32">
          <BackgroundSection />
          <SectionGridMoreExplore
            heading={heading}
            subHeading={subHeading}
            data={data}
            gridClassName={`grid-cols-1 md:grid-cols-2 xl:grid-cols-${cols}`}
          />
        </div>
      );
    }
  }
}
