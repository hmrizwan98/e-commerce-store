import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "How It Works — Tradez Glint Platform",
  description: "How a store gets provisioned and run on the Tradez Glint eCommerce SaaS platform.",
  openGraph: {
    title: "How It Works — Tradez Glint Platform",
    description: "How a store gets provisioned and run on the Tradez Glint eCommerce SaaS platform.",
    url: "/how-it-works",
    siteName: "Tradez Glint",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works — Tradez Glint Platform",
    description: "How a store gets provisioned and run on the Tradez Glint eCommerce SaaS platform.",
  },
  alternates: { canonical: "/how-it-works" },
};

const STEPS: { num: string; title: string; description: string; tag: string }[] = [
  {
    num: "01",
    tag: "Walkthrough",
    title: "Book a personalized demo",
    description:
      "Tell us about your retail business and goals. We'll walk you through Store Admin & Super Admin, answer technical questions, and discuss your commission structure.",
  },
  {
    num: "02",
    tag: "Super Admin",
    title: "Tenant provisioning",
    description:
      "Our Super Admin provisions a dedicated, fully isolated tenant boundary for your store — complete with isolated data rules, Cloudinary media folder, and custom domain configuration.",
  },
  {
    num: "03",
    tag: "Store Admin",
    title: "Pick a theme & setup catalog",
    description:
      "Choose from four production-ready starter themes, configure your colors/typography, upload products and categories, and configure shipping & payment integrations.",
  },
  {
    num: "04",
    tag: "Live Launch",
    title: "Launch & scale daily operations",
    description:
      "Open your store to customers: track real-time orders, manage fulfillment, monitor customer CRM data, and track net sales & commission payouts in your financial ledger.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container py-16 lg:py-24 space-y-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary-6000/20 bg-primary-6000/10 text-primary-700 dark:text-primary-300 text-xs font-semibold">
          <SparklesIcon className="w-4 h-4 text-primary-6000" />
          <span>Simple 4-Step Journey</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
          How the platform works
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          From initial walkthrough to live merchant operations — zero server management required.
        </p>
      </div>

      {/* Connected Timeline */}
      <div className="relative space-y-8 before:absolute before:inset-0 before:left-8 sm:before:left-12 before:w-0.5 before:bg-gradient-to-b before:from-primary-6000 before:via-indigo-500 before:to-emerald-500 before:hidden sm:before:block">
        {STEPS.map((step) => (
          <div key={step.num} className="relative flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-6000 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-6000/20 z-10 font-mono">
              {step.num}
            </div>

            <div className="flex-1 p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-primary-6000 dark:text-primary-400">
                  {step.tag}
                </span>
              </div>
              <h2 className="font-extrabold text-2xl text-neutral-900 dark:text-white tracking-tight">{step.title}</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="text-center pt-8">
        <Link
          href={"/book-demo" as any}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary-6000 via-indigo-600 to-indigo-700 text-white font-bold text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
        >
          <span>Get Started — Book a Demo</span>
          <ArrowRightIcon className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

