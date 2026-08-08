import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircleIcon,
  SparklesIcon,
  ShoppingBagIcon,
  TruckIcon,
  UsersIcon,
  BanknotesIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Features — Tradez Glint Platform",
  description: "Everything included with every store on the Tradez Glint eCommerce SaaS platform.",
  openGraph: {
    title: "Features — Tradez Glint Platform",
    description: "Everything included with every store on the Tradez Glint eCommerce SaaS platform.",
    url: "/features",
    siteName: "Tradez Glint",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Features — Tradez Glint Platform",
    description: "Everything included with every store on the Tradez Glint eCommerce SaaS platform.",
  },
  alternates: { canonical: "/features" },
};

const FEATURE_GROUPS: { title: string; icon: React.ComponentType<{ className?: string }>; items: string[] }[] = [
  {
    title: "Catalog & Inventory",
    icon: ShoppingBagIcon,
    items: [
      "Product management with variants, SKUs, and auto-generated codes",
      "Collections, suppliers, and brand organization",
      "Real-time stock tracking with low-stock alerts",
      "Bulk import/export architecture for catalog data",
    ],
  },
  {
    title: "Orders & Fulfillment",
    icon: TruckIcon,
    items: [
      "Full order lifecycle: status history, shipment tracking, cancellations, refunds, returns",
      "Order timeline merging status, payment, and fulfillment events",
      "Invoice, packing slip, and shipping label architecture",
      "Advanced order filtering and export",
    ],
  },
  {
    title: "Customers & CRM",
    icon: UsersIcon,
    items: [
      "Unified customer profiles for registered accounts and guest checkouts",
      "Computed analytics: lifetime value, average order value, order history",
      "Automatic customer segmentation and custom tags",
      "GDPR-ready data export and account deletion requests",
    ],
  },
  {
    title: "Finance & Commission",
    icon: BanknotesIcon,
    items: [
      "Per-store transaction ledger with payment and refund history",
      "Configurable commission engine (percentage, fixed, or none)",
      "Store financial summaries: gross sales, net sales, commission, payouts",
      "Platform-wide revenue dashboard for operators",
    ],
  },
  {
    title: "Design & Content CMS",
    icon: PaintBrushIcon,
    items: [
      "Drag-and-configure Homepage Builder",
      "Full CMS for custom pages",
      "Theme Builder with instant live preview",
      "Four production-ready starter themes included day one",
    ],
  },
  {
    title: "Platform & Security",
    icon: ShieldCheckIcon,
    items: [
      "Dedicated Store Admin and Super Admin panels",
      "Custom domain support per store",
      "Cloudinary-backed media pipeline for every image upload",
      "Tenant-isolated data, role-based access, and full activity audit logs",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="container py-16 lg:py-24 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary-6000/20 bg-primary-6000/10 text-primary-700 dark:text-primary-300 text-xs font-semibold">
          <SparklesIcon className="w-4 h-4 text-primary-6000" />
          <span>Full Platform Capability</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
          Everything you need to run a serious store
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Every store on the platform gets the complete feature suite below — no feature-gated tiers locking core tools away.
        </p>
      </div>

      {/* Bento Feature Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {FEATURE_GROUPS.map((group) => {
          const Icon = group.icon;
          return (
            <div
              key={group.title}
              className="p-7 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-xs hover:border-primary-6000/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-6000/10 dark:bg-primary-6000/20 text-primary-6000 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="font-bold text-xl text-neutral-900 dark:text-white mb-4 tracking-tight">{group.title}</h2>
                <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-normal">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-2xl font-bold tracking-tight">Want to see all tools live in Store Admin?</h3>
          <p className="text-sm text-neutral-400 max-w-lg">
            Schedule a walkthrough and we&apos;ll demonstrate order processing, theme customization, and inventory controls.
          </p>
        </div>
        <Link
          href={"/book-demo" as any}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-neutral-950 font-bold text-sm shrink-0 hover:bg-neutral-100 transition-colors"
        >
          <span>Book a Demo</span>
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

