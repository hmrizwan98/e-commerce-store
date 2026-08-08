import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Tradez Glint Platform",
  description: "Privacy policy for the Tradez Glint eCommerce SaaS platform website.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PlatformPrivacyPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-neutral-500 font-mono">Platform Marketing Privacy Standards</p>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-xl shadow-neutral-900/5 prose dark:prose-invert max-w-none">
        <p>
          This policy covers the Tradez Glint platform marketing website (this site) — information submitted through
          our Book a Demo and Contact forms, such as your name, email, company, and message. It does not cover any
          individual store built on the platform; each store maintains its own privacy policy for its customers.
        </p>
        <h2>What we collect</h2>
        <p>
          Demo requests and contact submissions are stored securely so our team can follow up with you. We do not sell this
          information to third parties.
        </p>
        <h2>Your rights</h2>
        <p>
          You may request a copy of the information you&apos;ve submitted to us, or request that we delete it, by
          reaching us via the Contact page.
        </p>
      </div>
    </div>
  );
}

