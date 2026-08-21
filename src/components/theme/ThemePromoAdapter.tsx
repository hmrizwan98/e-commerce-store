"use client";

import React from "react";
import LuxePromo from "./variants/promos/LuxePromo";
import MinimalPromo from "./variants/promos/MinimalPromo";
import BoldStreetPromo from "./variants/promos/BoldStreetPromo";
import TechDealsPromo from "./variants/promos/TechDealsPromo";
import SectionPromo1 from "@/components/SectionPromo1";
import SectionPromo2 from "@/components/SectionPromo2";
import SectionPromo3 from "@/components/SectionPromo3";
import type { PromoThemeConfig, ThemePresetId } from "@/lib/theme/theme-types";

export interface ThemePromoAdapterProps {
  promoSettings?: PromoThemeConfig;
  banner?: any;
  presetId?: ThemePresetId;
  /** CMS promo-slot placement (1|2|3) - only consulted by the generic fallback branch. */
  numericVariant?: 1 | 2 | 3;
}

export default function ThemePromoAdapter({ promoSettings, banner, presetId, numericVariant }: ThemePromoAdapterProps) {
  switch (promoSettings?.styleVariant) {
    case "luxe":
      return <LuxePromo banner={banner} presetId={presetId} />;
    case "minimal":
      return <MinimalPromo banner={banner} presetId={presetId} />;
    case "bold-street":
      return <BoldStreetPromo banner={banner} presetId={presetId} />;
    case "tech":
      return <TechDealsPromo banner={banner} presetId={presetId} />;
    default: {
      const Promo = numericVariant === 2 ? SectionPromo2 : numericVariant === 3 ? SectionPromo3 : SectionPromo1;
      return <Promo banner={banner} />;
    }
  }
}
