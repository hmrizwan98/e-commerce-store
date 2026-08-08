import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckIcon, ArrowRightIcon, BanknotesIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Pricing — Tradez Glint Platform",
  description: "Commission-based pricing for the Tradez Glint eCommerce SaaS platform - no flat license fee.",
  openGraph: {
    title: "Pricing — Tradez Glint Platform",
    description: "Commission-based pricing for the Tradez Glint eCommerce SaaS platform - no flat license fee.",
    url: "/pricing",
    siteName: "Tradez Glint",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — Tradez Glint Platform",
    description: "Commission-based pricing - no flat license fee.",
  },
  alternates: { canonical: "/pricing" },
};

const INCLUDED = [
  "Full Store Admin panel — products, inventory, orders, CRM, finance & CMS",
  "Theme Builder with 4 production-ready starter themes",
  "Drag-and-configure Homepage Builder and full custom page builder",
  "Cloudinary-backed media pipeline for every product & banner asset",
  "Tenant-isolated Firestore data with role-based access & audit logs",
  "Fast, server-rendered Next.js hosting — zero servers to configure",
];

const NO_FEES = ["Zero Setup Fee", "Zero Monthly Base Fee", "Zero Hidden Charges", "Zero Infrastructure Overhead"];

export default function PricingPage() {
  return (
    <div className="container py-16 lg:py-24 space-y-16 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <BanknotesIcon className="w-4 h-4 text-emerald-500" />
          <span>Growth-Aligned Revenue Model</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
          Simple, commission-based pricing
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          We don&apos;t charge a flat monthly license fee to run your store. Each store configures a commission model with us (percentage, fixed per order, or custom) — so we only succeed when your store sells.
        </p>
      </div>

      <div className="relative rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden p-8 sm:p-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-6000/10 text-primary-6000 border border-primary-6000/20">
              Complete Platform Plan
            </span>
            <h2 className="font-extrabold text-2xl text-neutral-900 dark:text-white mt-2 tracking-tight">Everything Included</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">No feature-gated tiers or hidden add-ons.</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-6000/10 via-indigo-500/10 to-transparent border border-primary-6000/20 text-center sm:text-right shrink-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-primary-6000 tracking-tight">Commission Model</div>
            <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1">Tailored on your demo call</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {NO_FEES.map((item) => (
            <div key={item} className="px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60 flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
              <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
            Included with every tenant
          </h3>
          <ul className="grid sm:grid-cols-2 gap-4 text-sm text-neutral-700 dark:text-neutral-300">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-primary-6000 shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4">
          <Link
            href={"/book-demo" as any}
            className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 rounded-full bg-gradient-to-r from-primary-6000 via-indigo-600 to-indigo-700 text-white font-bold text-base shadow-xl shadow-primary-6000/25 hover:shadow-primary-6000/40 hover:-translate-y-0.5 transition-all"
          >
            <span>Book a Demo to Discuss Tailored Rates</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-neutral-400 font-medium">
        This page describes our platform pricing model. Specific commercial terms are finalized during onboarding.
      </p>
    </div>
  );
}

