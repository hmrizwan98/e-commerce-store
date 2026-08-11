"use client";

import React from "react";
import CenteredHeader from "./variants/headers/CenteredHeader";
import MegaMenuHeader from "./variants/headers/MegaMenuHeader";
import TransparentHeader from "./variants/headers/TransparentHeader";
import type { HeaderThemeConfig, CartThemeConfig } from "@/lib/theme/theme-types";

export interface ThemeHeaderAdapterProps {
  headerSettings?: HeaderThemeConfig;
  cartSettings?: CartThemeConfig;
}

export default function ThemeHeaderAdapter({ headerSettings, cartSettings }: ThemeHeaderAdapterProps) {
  const variant = headerSettings?.variant || "centered";

  switch (variant) {
    case "mega-menu":
      return <MegaMenuHeader headerSettings={headerSettings} cartSettings={cartSettings} />;
    case "transparent-overlay":
      return <TransparentHeader headerSettings={headerSettings} cartSettings={cartSettings} />;
    case "centered":
    default:
      return <CenteredHeader headerSettings={headerSettings} cartSettings={cartSettings} />;
  }
}
