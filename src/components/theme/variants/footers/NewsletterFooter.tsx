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

export interface FooterVariantProps {
  footerSettings?: FooterThemeConfig;
  storeName?: string;
}

export default function NewsletterFooter({ footerSettings, storeName = "Tradz Glint" }: FooterVariantProps) {
  const footerItems = useMenu("footer");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
          <p className="text-sm text-[var(--muted)]">Subscribe to get exclusive discounts, flash sales & insider product releases.</p>
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
          <Logo />
          <SocialsList1 />
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
        <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        <PaymentIcons />
      </div>
    </footer>
  );
}
