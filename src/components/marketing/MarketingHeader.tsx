"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/themes", label: "Themes" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

/** Self-contained - no tenant/theme dependency. This is the marketing site's own
 * chrome; the storefront's SiteHeader/Footer/AnnouncementBar/WhatsAppButton
 * suppress themselves whenever no tenant resolves (see middleware.ts's
 * platform-domain detection and each component's own useTenantId() check). */
export default function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
      <div className="container flex items-center justify-between h-16">
        <Link href={"/" as any} className="font-semibold text-lg">
          Tradez Glint <span className="text-primary-6000">Platform</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href as any} className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link href={"/login" as any} className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:underline">
            Login
          </Link>
          <Link
            href={"/book-demo" as any}
            className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium"
          >
            Book a Demo
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden p-2 text-neutral-500"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-neutral-200 dark:border-neutral-800 px-4 py-4 space-y-3 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href as any}
              className="block text-neutral-600 dark:text-neutral-300"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href={"/login" as any} className="block text-neutral-600 dark:text-neutral-300">
            Login
          </Link>
          <Link href={"/book-demo" as any} className="block px-4 py-2 rounded-full bg-primary-6000 text-white text-center">
            Book a Demo
          </Link>
        </nav>
      )}
    </header>
  );
}
