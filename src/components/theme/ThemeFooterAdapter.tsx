"use client";

import React from "react";
import MultiColumnFooter from "./variants/footers/MultiColumnFooter";
import NewsletterFooter from "./variants/footers/NewsletterFooter";
import MinimalFooter from "./variants/footers/MinimalFooter";
import type { FooterThemeConfig } from "@/lib/theme/theme-types";
import type { ThemeLogos } from "@/types/theme";

import type { GeneralSettings } from "@/types/site-settings";

export interface ThemeFooterAdapterProps {
  footerSettings?: FooterThemeConfig;
  logos?: ThemeLogos;
  storeName?: string;
  socialLinks?: GeneralSettings["socialLinks"];
}

export default function ThemeFooterAdapter({ footerSettings, logos, storeName, socialLinks }: ThemeFooterAdapterProps) {
  const variant = footerSettings?.variant || "multi-column";

  switch (variant) {
    case "newsletter-focused":
      return <NewsletterFooter footerSettings={footerSettings} logos={logos} storeName={storeName} socialLinks={socialLinks} />;
    case "minimal-centered":
      return <MinimalFooter footerSettings={footerSettings} logos={logos} storeName={storeName} socialLinks={socialLinks} />;
    case "multi-column":
    default:
      return <MultiColumnFooter footerSettings={footerSettings} logos={logos} storeName={storeName} socialLinks={socialLinks} />;
  }
}
