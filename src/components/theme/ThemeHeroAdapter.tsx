import React from "react";
import FullWidthImageHero from "./variants/heroes/FullWidthImageHero";
import LuxeHero from "./variants/heroes/LuxeHero";
import MinimalHero from "./variants/heroes/MinimalHero";
import BoldStreetHero from "./variants/heroes/BoldStreetHero";
import TechHero from "./variants/heroes/TechHero";
import SectionHero2 from "@/components/SectionHero/SectionHero2";
import type { HeroThemeConfig, ThemePresetId } from "@/lib/theme/theme-types";
import type { Hero2DataType } from "@/components/SectionHero/data";
import type { ThemeBanner } from "@/types/theme";

export interface ThemeHeroAdapterProps {
  heroSettings?: HeroThemeConfig;
  data?: Hero2DataType[];
  presetId?: ThemePresetId;
  banner?: ThemeBanner;
}

export default function ThemeHeroAdapter({ heroSettings, data, presetId, banner }: ThemeHeroAdapterProps) {
  // Use FullWidthImageHero for generic, image-only, or default to ensure pure clean full-width image slider
  switch (heroSettings?.variant) {
    case "luxe":
      return <LuxeHero data={data} presetId={presetId} banner={banner} />;
    case "minimal":
      return <MinimalHero data={data} presetId={presetId} banner={banner} />;
    case "bold-street":
      return <BoldStreetHero data={data} presetId={presetId} banner={banner} />;
    case "tech":
      return <TechHero data={data} presetId={presetId} banner={banner} />;
    case "image-only":
    case "generic":
    default:
      return <FullWidthImageHero data={data} banner={banner} />;
  }
}
