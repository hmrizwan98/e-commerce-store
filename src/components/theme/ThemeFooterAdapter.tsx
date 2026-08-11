"use client";

import React from "react";
import MultiColumnFooter from "./variants/footers/MultiColumnFooter";
import NewsletterFooter from "./variants/footers/NewsletterFooter";
import MinimalFooter from "./variants/footers/MinimalFooter";
import type { FooterThemeConfig } from "@/lib/theme/theme-types";

export interface ThemeFooterAdapterProps {
  footerSettings?: FooterThemeConfig;
  storeName?: string;
}

export default function ThemeFooterAdapter({ footerSettings, storeName }: ThemeFooterAdapterProps) {
  const variant = footerSettings?.variant || "multi-column";

  switch (variant) {
    case "newsletter-focused":
      return <NewsletterFooter footerSettings={footerSettings} storeName={storeName} />;
    case "minimal-centered":
      return <MinimalFooter footerSettings={footerSettings} storeName={storeName} />;
    case "multi-column":
    default:
      return <MultiColumnFooter footerSettings={footerSettings} storeName={storeName} />;
  }
}
