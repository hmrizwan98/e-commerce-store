"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon, SparklesIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/themes", label: "Themes" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

/** Self-contained - no tenant/theme dependency. */
export default function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md transition-colors">
      <div className="container flex items-center justify-between h-16 sm:h-20">
        <Link href={"/" as any} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-6000 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary-6000/20 group-hover:scale-105 transition-transform">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight text-neutral-900 dark:text-white">
            Tradez Glint <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-6000 via-indigo-600 to-cyan-500 font-extrabold">Platform</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 px-3 py-1.5 rounded-full border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-100/50 dark:bg-neutral-900/50 backdrop-blur-sm text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href as any}
              className="px-3.5 py-1.5 rounded-full text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-800/80 transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href={"/login" as any}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href={"/book-demo" as any}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-6000 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-primary-6000/25 hover:shadow-lg hover:shadow-primary-6000/35 hover:-translate-y-0.5 transition-all"
          >
            <span>Book a Demo</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                className="px-4 py-2.5 rounded-xl text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2.5">
            <Link
              href={"/login" as any}
              className="w-full text-center px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-medium text-neutral-800 dark:text-neutral-200"
              onClick={() => setMobileOpen(false)}
            >
              Sign In to Admin
            </Link>
            <Link
              href={"/book-demo" as any}
              className="w-full text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-6000 to-indigo-600 text-white font-semibold shadow-md"
              onClick={() => setMobileOpen(false)}
            >
              Book a Demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

