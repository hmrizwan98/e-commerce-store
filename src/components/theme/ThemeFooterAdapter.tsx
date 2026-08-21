"use client";

import React from "react";
import MultiColumnFooter from "./variants/footers/MultiColumnFooter";
import NewsletterFooter from "./variants/footers/NewsletterFooter";
import MinimalFooter from "./variants/footers/MinimalFooter";
import type { FooterThemeConfig } from "@/lib/theme/theme-types";
import type { ThemeLogos } from "@/types/theme";

export interface ThemeFooterAdapterProps {
  footerSettings?: FooterThemeConfig;
  logos?: ThemeLogos;
  storeName?: string;
}

export default function ThemeFooterAdapter({ footerSettings, logos, storeName }: ThemeFooterAdapterProps) {
  const variant = footerSettings?.variant || "multi-column";

  switch (variant) {
    case "newsletter-focused":
      return <NewsletterFooter footerSettings={footerSettings} logos={logos} storeName={storeName} />;
    case "minimal-centered":
      return <MinimalFooter footerSettings={footerSettings} logos={logos} storeName={storeName} />;
    case "multi-column":
    default:
      return <MultiColumnFooter footerSettings={footerSettings} logos={logos} storeName={storeName} />;
  }
}
