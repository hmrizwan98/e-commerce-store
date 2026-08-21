"use client";

import React from "react";
import CenteredHeader from "./variants/headers/CenteredHeader";
import MegaMenuHeader from "./variants/headers/MegaMenuHeader";
import TransparentHeader from "./variants/headers/TransparentHeader";
import type { HeaderThemeConfig, CartThemeConfig } from "@/lib/theme/theme-types";
import type { ThemeLogos } from "@/types/theme";

export interface ThemeHeaderAdapterProps {
  headerSettings?: HeaderThemeConfig;
  cartSettings?: CartThemeConfig;
  logos?: ThemeLogos;
  storeName?: string;
}

export default function ThemeHeaderAdapter({ headerSettings, cartSettings, logos, storeName }: ThemeHeaderAdapterProps) {
  const variant = headerSettings?.variant || "centered";

  switch (variant) {
    case "mega-menu":
      return <MegaMenuHeader headerSettings={headerSettings} cartSettings={cartSettings} logos={logos} storeName={storeName} />;
    case "transparent-overlay":
      return <TransparentHeader headerSettings={headerSettings} cartSettings={cartSettings} logos={logos} storeName={storeName} />;
    case "centered":
    default:
      return <CenteredHeader headerSettings={headerSettings} cartSettings={cartSettings} logos={logos} storeName={storeName} />;
  }
}
