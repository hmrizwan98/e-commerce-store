import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Tradez Glint Platform",
  description: "Terms of service for the Tradez Glint eCommerce SaaS platform website.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function PlatformTermsPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Terms of Service</h1>
        <p className="text-sm text-neutral-500 font-mono">Platform Marketing Website Terms</p>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-xl shadow-neutral-900/5 prose dark:prose-invert max-w-none">
        <p>
          These terms govern your use of the Tradez Glint platform marketing website (this site). Terms governing an
          individual store&apos;s storefront, and the commercial agreement between a store owner and Tradez Glint, are
          addressed separately when you onboard — not on this page.
        </p>
        <h2>Use of this site</h2>
        <p>
          This site is provided for informational purposes to help you evaluate the platform. Content is provided
          as-is, and specific commitments (pricing, SLAs, feature availability) are confirmed directly when you book a
          demo.
        </p>
        <h2>Contact</h2>
        <p>Questions about these terms can be sent through our Contact page.</p>
      </div>
    </div>
  );
}

