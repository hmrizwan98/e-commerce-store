"use client";

import Logo from "@/shared/Logo/Logo";
import SocialsList1 from "@/shared/SocialsList1/SocialsList1";
import React, { useState } from "react";
import { useMenu } from "@/hooks/useMenu";
import { useChromeSuppressed } from "@/lib/tenant/useChromeSuppressed";
import PaymentIcons from "@/components/PaymentIcons";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { subscribeToNewsletter } from "@/lib/newsletter/actions";
import toast from "react-hot-toast";
import ThemeFooterAdapter from "@/components/theme/ThemeFooterAdapter";
import type { FooterThemeConfig } from "@/lib/theme/theme-types";
import type { ThemeLogos } from "@/types/theme";

export interface WidgetFooterMenuLink {
  href: string;
  label: string;
}

export interface WidgetFooterMenu {
  id: string;
  title: string;
  menus: WidgetFooterMenuLink[];
}

export interface FooterProps {
  footerSettings?: FooterThemeConfig;
  logos?: ThemeLogos;
  storeName?: string;
}

const Footer: React.FC<FooterProps> = ({ footerSettings, logos, storeName = "Tradz Glint" }) => {
  const isSuppressed = useChromeSuppressed();
  const footerItems = useMenu("footer");
  const widgetMenus: WidgetFooterMenu[] = footerItems.map((item) => ({
    id: item.id,
    title: item.name,
    menus: (item.children ?? []).map((child) => ({
      href: child.href,
      label: child.name,
    })),
  }));

  const showCopyright = footerSettings?.showCopyright ?? true;
  const showPaymentIcons = footerSettings?.showPaymentIcons ?? false;
  const showNewsletter = footerSettings?.showNewsletter ?? false;
  const copyrightText =
    footerSettings?.copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await subscribeToNewsletter(email);
    if (result.ok) {
      toast.success(result.message);
      setEmail("");
    } else {
      toast.error(result.message);
    }
    setSubmitting(false);
  };

  if (isSuppressed) return null;

  if (footerSettings?.variant) {
    return <ThemeFooterAdapter footerSettings={footerSettings} logos={logos} storeName={storeName} />;
  }

  const renderWidgetMenuItem = (menu: WidgetFooterMenu, index: number) => {
    return (
      <div key={index} className="text-sm">
        <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">
          {menu.title}
        </h2>
        <ul className="mt-5 space-y-4">
          {menu.menus.map((item, index) => (
            <li key={index}>
              <a
                key={index}
                className="text-neutral-6000 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="nc-Footer relative py-20 lg:pt-28 lg:pb-24 border-t border-neutral-200 dark:border-neutral-700 bg-[var(--footer-bg)]">
      <div className="container grid grid-cols-2 gap-y-10 gap-x-5 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10 ">
        <div className="grid grid-cols-4 gap-5 col-span-2 md:col-span-4 lg:md:col-span-1 lg:flex lg:flex-col">
          <div className="col-span-2 md:col-span-1">
            <Logo img={footerSettings?.footerLogo} storeName={storeName} logoHeightPx={footerSettings?.logoHeightPx} />
          </div>
          <div className="col-span-2 flex items-center md:col-span-3">
            <SocialsList1 className="flex items-center space-x-2 lg:space-x-0 lg:flex-col lg:space-y-3 lg:items-start" />
          </div>
        </div>
        {widgetMenus.map(renderWidgetMenuItem)}
        {showNewsletter && (
          <div className="col-span-2 md:col-span-4 lg:col-span-5">
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm">
              <Input
                required
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <ButtonPrimary type="submit" loading={submitting}>
                Subscribe
              </ButtonPrimary>
            </form>
          </div>
        )}
        {showCopyright && (
          <div className="col-span-2 md:col-span-4 lg:col-span-5 pt-10 mt-4 border-t border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">{copyrightText}</span>
            {showPaymentIcons && <PaymentIcons />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Footer;
