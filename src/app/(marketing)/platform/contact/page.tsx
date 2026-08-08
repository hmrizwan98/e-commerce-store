import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { EnvelopeIcon, SparklesIcon, CalendarIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Contact — Tradez Glint Platform",
  description: "Get in touch with the Tradez Glint eCommerce SaaS platform team.",
  openGraph: {
    title: "Contact — Tradez Glint Platform",
    description: "Get in touch with the Tradez Glint eCommerce SaaS platform team.",
    url: "/contact",
    siteName: "Tradez Glint",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Tradez Glint Platform",
    description: "Get in touch with the Tradez Glint eCommerce SaaS platform team.",
  },
  alternates: { canonical: "/contact" },
};

export default function PlatformContactPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-2xl mx-auto space-y-10 text-center">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary-6000/20 bg-primary-6000/10 text-primary-700 dark:text-primary-300 text-xs font-semibold">
          <SparklesIcon className="w-4 h-4 text-primary-6000" />
          <span>Direct Team Reach</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
          Get in touch
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
          Have a question about the platform that isn&apos;t covered in our FAQ? Reach out and our team will get back to you promptly.
        </p>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-xl shadow-neutral-900/5 space-y-6">
        <a
          href="mailto:hello@tradezglint.com"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-primary-6000 via-indigo-600 to-indigo-700 text-white font-extrabold text-base shadow-xl shadow-primary-6000/25 hover:shadow-primary-6000/40 hover:-translate-y-0.5 transition-all"
        >
          <EnvelopeIcon className="w-5 h-5" />
          <span>hello@tradezglint.com</span>
        </a>

        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-sm text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-2">
          <CalendarIcon className="w-4 h-4 text-primary-6000" />
          <span>Prefer a live walkthrough?</span>
          <Link href={"/book-demo" as any} className="font-bold text-primary-6000 hover:underline">
            Book a demo
          </Link>
        </div>
      </div>
    </div>
  );
}

