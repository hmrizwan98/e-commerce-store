"use client";

import React from "react";
import HeaderLogged from "@/components/Header/HeaderLogged";
import { useThemeMode } from "@/hooks/useThemeMode";
import { useChromeSuppressed } from "@/lib/tenant/useChromeSuppressed";
import ThemeHeaderAdapter from "@/components/theme/ThemeHeaderAdapter";
import type { HeaderThemeConfig, CartThemeConfig } from "@/lib/theme/theme-types";
import type { ThemeLogos } from "@/types/theme";

export interface SiteHeaderProps {
  headerSettings?: HeaderThemeConfig;
  cartSettings?: CartThemeConfig;
  logos?: ThemeLogos;
  storeName?: string;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ headerSettings, cartSettings, logos, storeName }) => {
  useThemeMode();

  const isSuppressed = useChromeSuppressed();
  if (isSuppressed) return null;

  if (headerSettings?.variant) {
    return <ThemeHeaderAdapter headerSettings={headerSettings} cartSettings={cartSettings} logos={logos} storeName={storeName} />;
  }

  return <HeaderLogged headerSettings={headerSettings} cartSettings={cartSettings} logos={logos} storeName={storeName} />;
};

export default SiteHeader;
