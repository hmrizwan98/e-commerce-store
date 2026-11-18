import React from "react";
import FullWidthImageHero from "./variants/heroes/FullWidthImageHero";
import LuxeHero from "./variants/heroes/LuxeHero";
import MinimalHero from "./variants/heroes/MinimalHero";
import BoldStreetHero from "./variants/heroes/BoldStreetHero";
import TechHero from "./variants/heroes/TechHero";
import type { HeroThemeConfig, ThemePresetId } from "@/lib/theme/theme-types";
import type { Hero2DataType } from "@/components/SectionHero/data";
import type { ThemeBanner } from "@/types/theme";

export interface ThemeHeroAdapterProps {
  heroSettings?: HeroThemeConfig;
  data?: Hero2DataType[];
  presetId?: ThemePresetId;
  banner?: ThemeBanner;
  /** The store's own categories - only the "tech" hero shows them (sidebar). */
  categories?: { name: string; href: string }[];
}

/** Renders only the merchant's own hero slides (Store Admin → Hero Slides). Callers don't render
 * this at all when there are none - no variant has demo slides anymore. */
export default function ThemeHeroAdapter({ heroSettings, data, presetId, banner, categories }: ThemeHeroAdapterProps) {
  if (!data?.length) return null;
  // Use FullWidthImageHero for generic, image-only, or default to ensure pure clean full-width image slider
  switch (heroSettings?.variant) {
    case "luxe":
      return <LuxeHero data={data} presetId={presetId} banner={banner} />;
    case "minimal":
      return <MinimalHero data={data} presetId={presetId} banner={banner} />;
    case "bold-street":
      return <BoldStreetHero data={data} presetId={presetId} banner={banner} />;
    case "tech":
      return <TechHero data={data} presetId={presetId} banner={banner} categories={categories} />;
    case "image-only":
    case "generic":
    default:
      return <FullWidthImageHero data={data} banner={banner} />;
  }
}
