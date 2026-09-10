"use client";

import React from "react";
import Logo from "@/shared/Logo/Logo";
import SocialsList1 from "@/shared/SocialsList1/SocialsList1";
import { useMenu } from "@/hooks/useMenu";
import type { FooterThemeConfig } from "@/lib/theme/theme-types";
import type { ThemeLogos } from "@/types/theme";

import type { GeneralSettings } from "@/types/site-settings";

export interface FooterVariantProps {
  footerSettings?: FooterThemeConfig;
  logos?: ThemeLogos;
  storeName?: string;
  socialLinks?: GeneralSettings["socialLinks"];
}

import FooterSocials from "@/components/FooterSocials";

export default function MinimalFooter({ footerSettings, logos, storeName = "Webriiz", socialLinks }: FooterVariantProps) {
  const footerItems = useMenu("footer");
  const copyrightText = footerSettings?.copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

  const footerLogoImage = footerSettings?.footerLogo || logos?.footerLogo || logos?.logoLight;

  return (
    <footer className="relative bg-[var(--footer-bg)] border-t border-[var(--border)]/60 text-[var(--text)] py-16 text-center">
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

        <div className="pt-6 border-t border-[var(--border)]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
          <p className="tracking-widest uppercase">
            {copyrightText}
          </p>
          <FooterSocials socialLinks={socialLinks} />
        </div>
      </div>
    </footer>
  );
}
