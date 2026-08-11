"use client";

import React from "react";
import Logo from "@/shared/Logo/Logo";
import SocialsList1 from "@/shared/SocialsList1/SocialsList1";
import { useMenu } from "@/hooks/useMenu";
import type { FooterThemeConfig } from "@/lib/theme/theme-types";

export interface FooterVariantProps {
  footerSettings?: FooterThemeConfig;
  storeName?: string;
}

export default function MinimalFooter({ footerSettings, storeName = "Tradz Glint" }: FooterVariantProps) {
  const footerItems = useMenu("footer");
  const copyrightText = footerSettings?.copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

  return (
    <footer className="relative bg-[var(--footer-bg)] border-t border-[var(--border)]/60 text-[var(--text)] py-20 text-center">
      <div className="container max-w-4xl mx-auto space-y-8">
        <div className="flex justify-center">
          <Logo />
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
