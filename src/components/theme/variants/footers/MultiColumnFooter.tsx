"use client";

import React from "react";
import Logo from "@/shared/Logo/Logo";
import SocialsList1 from "@/shared/SocialsList1/SocialsList1";
import PaymentIcons from "@/components/PaymentIcons";
import { useMenu } from "@/hooks/useMenu";
import type { FooterThemeConfig } from "@/lib/theme/theme-types";

export interface FooterVariantProps {
  footerSettings?: FooterThemeConfig;
  storeName?: string;
}

export default function MultiColumnFooter({ footerSettings, storeName = "Tradz Glint" }: FooterVariantProps) {
  const footerItems = useMenu("footer");
  const showCopyright = footerSettings?.showCopyright ?? true;
  const showPaymentIcons = footerSettings?.showPaymentIcons ?? false;
  const copyrightText = footerSettings?.copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

  return (
    <footer className="relative py-16 lg:py-20 border-t border-[var(--border)] bg-[var(--footer-bg)] text-[var(--text)]">
      <div className="container grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-10">
        <div className="md:col-span-2 lg:col-span-2 space-y-4">
          <Logo />
          <p className="text-sm text-[var(--muted)] max-w-sm">
            Discover modern essentials crafted for everyday living. High quality products delivered directly to your doorstep.
          </p>
          <SocialsList1 />
        </div>

        {footerItems.map((item, idx) => (
          <div key={idx} className="text-sm space-y-3">
            <h3 className="font-semibold text-[var(--heading)]">{item.name}</h3>
            <ul className="space-y-2">
              {(item.children ?? []).map((child, cIdx) => (
                <li key={cIdx}>
                  <a href={child.href} className="text-[var(--muted)] hover:text-[var(--primary-600,#0284c7)] transition-colors">
                    {child.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container mt-12 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
        {showCopyright && <p>{copyrightText}</p>}
        {showPaymentIcons && <PaymentIcons />}
      </div>
    </footer>
  );
}
