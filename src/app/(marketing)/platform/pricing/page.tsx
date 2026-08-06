import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckIcon } from "@heroicons/react/24/outline";

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
  "Full Store Admin panel - products, orders, customers, finance, CMS",
  "Theme Builder with 4 production-ready starter themes",
  "Homepage Builder and full CMS",
  "Cloudinary-backed media pipeline for every image",
  "Tenant-isolated data with enterprise security and audit logs",
  "Fast, server-rendered hosting - no infrastructure to manage",
];

const NO_FEES = ["No setup fee", "No monthly fee", "No hidden charges"];

export default function PricingPage() {
  return (
    <div className="container py-16 lg:py-24">
      <h1 className="text-3xl sm:text-4xl font-semibold text-center">Simple, commission-based pricing</h1>
      <p className="mt-4 text-center text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
        We don&apos;t charge a flat license fee to run your store. Instead, each store configures a commission rate
        with us (percentage, fixed per order, or none) - so we only grow when your sales do. Final rates are
        confirmed when you book a demo.
      </p>

      <div className="mt-16 max-w-xl mx-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-8">
          <h2 className="font-semibold text-lg mb-1">Everything, one plan</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            No feature-gated tiers. Every store gets the full platform.
          </p>

          <div className="p-5 rounded-xl bg-primary-6000/5 border border-primary-6000/20 mb-6">
            <div className="text-xl font-semibold text-primary-6000">Commission-based</div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Rate confirmed on your demo call
            </div>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 text-xs text-neutral-500 dark:text-neutral-400">
            {NO_FEES.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckIcon className="w-3.5 h-3.5 text-primary-6000" />
                {item}
              </span>
            ))}
          </div>

          <ul className="space-y-3 text-sm mb-8">
            {INCLUDED.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckIcon className="w-5 h-5 text-primary-6000 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href={"/book-demo" as any}
            className="block text-center px-6 py-3 rounded-full bg-primary-6000 text-white font-medium"
          >
            Book a Demo to Discuss Rates
          </Link>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-neutral-400">
        This page describes our pricing model only - no billing or payment is collected here.
      </p>
    </div>
  );
}
