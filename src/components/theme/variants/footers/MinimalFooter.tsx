"use client";

import React from "react";
import Logo from "@/shared/Logo/Logo";
import SocialsList1 from "@/shared/SocialsList1/SocialsList1";
import { useMenu } from "@/hooks/useMenu";
import type { FooterThemeConfig } from "@/lib/theme/theme-types";
import type { ThemeLogos } from "@/types/theme";

export interface FooterVariantProps {
  footerSettings?: FooterThemeConfig;
  logos?: ThemeLogos;
  storeName?: string;
}

export default function MinimalFooter({ footerSettings, logos, storeName = "Tradz Glint" }: FooterVariantProps) {
  const footerItems = useMenu("footer");
  const copyrightText = footerSettings?.copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

  const footerLogoImage = footerSettings?.footerLogo || logos?.footerLogo || logos?.logoLight;

  return (
    <footer className="relative bg-[var(--footer-bg)] border-t border-[var(--border)]/60 text-[var(--text)] py-20 text-center">
      <div className="container max-w-4xl mx-auto space-y-8">
        <div className="flex justify-center">
          <Logo img={footerLogoImage} storeName={storeName} logoHeightPx={footerSettings?.logoHeightPx} />
        </div>

        <nav className="flex flex-wrap justify-center gap-8 text-sm tracking-wide text-[var(--muted)] font-serif">
          {footerItems.map((item, idx) => (
            <a key={idx} href={item.href} className="hover:text-[var(--heading)] transition-colors">
              {item.name}
            </a>
          ))}
        </nav>

        <div className="flex justify-center">
          <SocialsList1 />
        </div>

        <p className="text-xs text-[var(--muted)]/80 tracking-widest uppercase pt-6 border-t border-[var(--border)]/40">
          {copyrightText}
        </p>
      </div>
    </footer>
  );
}
