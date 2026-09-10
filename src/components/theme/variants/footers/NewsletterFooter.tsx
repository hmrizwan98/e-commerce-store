"use client";

import React, { useState } from "react";
import Logo from "@/shared/Logo/Logo";
import SocialsList1 from "@/shared/SocialsList1/SocialsList1";
import PaymentIcons from "@/components/PaymentIcons";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { useMenu } from "@/hooks/useMenu";
import { subscribeToNewsletter } from "@/lib/newsletter/actions";
import toast from "react-hot-toast";
import type { FooterThemeConfig } from "@/lib/theme/theme-types";
import type { ThemeLogos } from "@/types/theme";

import FooterSocials from "@/components/FooterSocials";
import type { GeneralSettings } from "@/types/site-settings";

export interface FooterVariantProps {
  footerSettings?: FooterThemeConfig;
  logos?: ThemeLogos;
  storeName?: string;
  socialLinks?: GeneralSettings["socialLinks"];
}

export default function NewsletterFooter({ footerSettings, logos, storeName = "Webriiz", socialLinks }: FooterVariantProps) {
  const footerItems = useMenu("footer");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const footerLogoImage = footerSettings?.footerLogo || logos?.footerLogo || logos?.logoLight;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await subscribeToNewsletter(email);
    if (res.ok) {
      toast.success(res.message);
      setEmail("");
    } else {
      toast.error(res.message);
    }
    setSubmitting(false);
  };

  return (
    <footer className="relative bg-[var(--footer-bg)] border-t-2 border-[var(--border)] text-[var(--text)] pt-16 pb-12">
      <div className="container mb-12 p-8 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center lg:text-left">
          <h3 className="text-xl font-bold uppercase tracking-wider text-[var(--heading)]">Stay Ahead of the Deals</h3>
          <p className="text-sm text-[var(--muted)]">Subscribe to get exclusive discounts, flash sales &amp; insider product releases.</p>
        </div>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <Input
            type="email"
            placeholder="Enter your email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full sm:w-80"
          />
          <ButtonPrimary type="submit" loading={submitting} className="w-full sm:w-auto uppercase font-bold">
            Subscribe
          </ButtonPrimary>
        </form>
      </div>

      <div className="container grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        <div className="col-span-2 space-y-4">
          <Logo img={footerLogoImage} storeName={storeName} logoHeightPx={footerSettings?.logoHeightPx} />
        </div>

        {footerItems.map((item, idx) => (
          <div key={idx} className="text-sm space-y-3">
            <h4 className="font-bold text-[var(--heading)] uppercase text-xs tracking-wider">{item.name}</h4>
            <ul className="space-y-2">
              {(item.children ?? []).map((child, cIdx) => (
                <li key={cIdx}>
                  <a href={child.href} className="text-[var(--muted)] hover:text-[var(--primary-600,#dc2626)] transition-colors">
                    {child.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[var(--muted)]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>🌐</span>
            <span>English (US)</span>
          </div>
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-6">
          <PaymentIcons />
          <FooterSocials socialLinks={socialLinks} />
        </div>
      </div>
    </footer>
  );
}
