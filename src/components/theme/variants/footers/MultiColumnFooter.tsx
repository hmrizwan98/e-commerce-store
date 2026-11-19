"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import Logo from "@/shared/Logo/Logo";
import PaymentIcons from "@/components/PaymentIcons";
import FooterSocials, { activeSocialLinks } from "@/components/FooterSocials";
import { useMenu } from "@/hooks/useMenu";
import { groupFooterMenu } from "@/lib/nav/footer-groups";
import { contactInfoRows } from "@/lib/contact/contact-info";
import { subscribeToNewsletter } from "@/lib/newsletter/actions";
import type { FooterThemeConfig } from "@/lib/theme/theme-types";
import type { ThemeLogos } from "@/types/theme";
import type { GeneralSettings } from "@/types/site-settings";

export interface FooterVariantProps {
  footerSettings?: FooterThemeConfig;
  logos?: ThemeLogos;
  storeName?: string;
  socialLinks?: GeneralSettings["socialLinks"];
  /** Settings → General address/email/phone (only filled ones are shown). */
  storeContact?: Pick<GeneralSettings, "storeAddress" | "storeEmail" | "storePhone">;
}

const CONTACT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "🗺 ADDRESS": MapPinIcon,
  "💌 EMAIL": EnvelopeIcon,
  "☎ PHONE": PhoneIcon,
};

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold tracking-wide text-[var(--heading,#0f172a)] dark:text-slate-100">
      {children}
      <span className="block mt-2 h-0.5 w-8 rounded-full bg-[var(--primary-600,#0284c7)]" aria-hidden />
    </h3>
  );
}

/**
 * Multi-column footer. Everything comes from the store: footer menu (grouped into columns -
 * see groupFooterMenu), logo/description/copyright/newsletter/payment-icon switches
 * (Customizer → Footer), social links (Settings → Social) and contact details
 * (Settings → General). Nothing is hardcoded store content.
 */
export default function MultiColumnFooter({ footerSettings, logos, storeName = "Webriiz", socialLinks, storeContact }: FooterVariantProps) {
  const footerItems = useMenu("footer");
  const groups = groupFooterMenu(footerItems);
  const showCopyright = footerSettings?.showCopyright ?? true;
  const showPaymentIcons = footerSettings?.showPaymentIcons ?? false;
  const showNewsletter = footerSettings?.showNewsletter ?? false;
  const copyrightText = footerSettings?.copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;
  const footerLogoImage = footerSettings?.footerLogo || logos?.footerLogo || logos?.logoLight;
  const descriptionText = footerSettings?.description?.trim() || "";
  const contactRows = storeContact ? contactInfoRows(storeContact) : [];
  const hasSocials = activeSocialLinks(socialLinks).length > 0;

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await subscribeToNewsletter(email);
      if (res.ok) {
        toast.success(res.message);
        setEmail("");
      } else toast.error(res.message);
    } finally {
      setSubmitting(false);
    }
  };

  const showContactColumn = contactRows.length > 0 || showNewsletter;

  return (
    <footer className="relative border-t border-[var(--border,#e5e7eb)] dark:border-slate-800 bg-[var(--footer-bg,white)] dark:bg-slate-950 text-[var(--text,#111827)] dark:text-slate-100">
      <div className="container py-12 lg:py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-x-6 gap-y-10 lg:gap-x-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-4 lg:col-span-4 space-y-4">
          <Logo img={footerLogoImage} storeName={storeName} logoHeightPx={footerSettings?.logoHeightPx} />
          {descriptionText && <p className="text-sm leading-relaxed text-[var(--muted,#64748b)] max-w-sm">{descriptionText}</p>}
          {hasSocials && <FooterSocials socialLinks={socialLinks} className="pt-1" />}
        </div>

        {/* Link columns from the footer menu */}
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title} className="col-span-1 lg:col-span-2 space-y-4 min-w-0">
            <ColumnHeading>{group.title}</ColumnHeading>
            <ul className="space-y-2.5 text-sm">
              {group.links.map((link) => (
                <li key={`${link.href}-${link.name}`}>
                  <Link
                    href={link.href as any}
                    {...(link.targetBlank ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-[var(--muted,#64748b)] hover:text-[var(--primary-600,#0284c7)] transition-colors break-words"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Contact + newsletter */}
        {showContactColumn && (
          <div className="col-span-2 md:col-span-2 lg:col-span-4 lg:col-start-auto space-y-4">
            <ColumnHeading>Contact</ColumnHeading>
            {contactRows.length > 0 && (
              <ul className="space-y-3 text-sm">
                {contactRows.map((row) => {
                  const Icon = CONTACT_ICONS[row.title] ?? EnvelopeIcon;
                  const href = row.title.includes("EMAIL") ? `mailto:${row.desc}` : row.title.includes("PHONE") ? `tel:${row.desc.replace(/[^\d+]/g, "")}` : null;
                  return (
                    <li key={row.title} className="flex items-start gap-2.5 text-[var(--muted,#64748b)]">
                      <Icon className="w-4 h-4 mt-0.5 shrink-0 text-[var(--primary-600,#0284c7)]" />
                      {href ? (
                        <a href={href} className="hover:text-[var(--primary-600,#0284c7)] break-all">
                          {row.desc}
                        </a>
                      ) : (
                        <span className="whitespace-pre-line">{row.desc}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {showNewsletter && (
              <form onSubmit={subscribe} className="pt-1 space-y-2 max-w-sm">
                <label htmlFor="footer-newsletter" className="block text-sm text-[var(--muted,#64748b)]">
                  Subscribe to our newsletter
                </label>
                <div className="flex gap-2">
                  <input
                    id="footer-newsletter"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="min-w-0 flex-1 px-4 py-2.5 text-sm rounded-full border border-[var(--border,#e5e7eb)] dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary-600,#0284c7)]/30"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-sm font-semibold rounded-full text-white bg-[var(--primary-600,#0284c7)] hover:opacity-90 disabled:opacity-60"
                  >
                    {submitting ? "…" : "Subscribe"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {(showCopyright || showPaymentIcons) && (
        <div className="border-t border-[var(--border,#e5e7eb)] dark:border-slate-800">
          <div className="container py-6 flex flex-col-reverse md:flex-row items-center justify-between gap-4 text-xs text-[var(--muted,#64748b)]">
            {showCopyright ? <p className="text-center md:text-left">{copyrightText}</p> : <span />}
            {showPaymentIcons && <PaymentIcons />}
          </div>
        </div>
      )}
    </footer>
  );
}
