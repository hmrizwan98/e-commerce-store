import React from "react";
import type { Metadata } from "next";

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

const FEATURE_GROUPS: { title: string; items: string[] }[] = [
  {
    title: "Catalog & Inventory",
    items: [
      "Product management with variants, SKUs, and auto-generated codes",
      "Collections, suppliers, and brand organization",
      "Real-time stock tracking with low-stock alerts",
      "Bulk import/export architecture for catalog data",
    ],
  },
  {
    title: "Orders & Fulfillment",
    items: [
      "Full order lifecycle: status history, shipment tracking, cancellations, refunds, returns",
      "Order timeline merging status, payment, and fulfillment events",
      "Invoice, packing slip, and shipping label architecture",
      "Advanced order filtering and export",
    ],
  },
  {
    title: "Customers & CRM",
    items: [
      "Unified customer profiles for registered accounts and guest checkouts",
      "Computed analytics: lifetime value, average order value, order history",
      "Automatic customer segmentation and custom tags",
      "GDPR-ready data export and account deletion requests",
    ],
  },
  {
    title: "Finance",
    items: [
      "Per-store transaction ledger with payment and refund history",
      "Configurable commission engine (percentage, fixed, or none)",
      "Store financial summaries: gross sales, net sales, commission, payouts",
      "Platform-wide revenue dashboard for operators",
    ],
  },
  {
    title: "Design & Content",
    items: [
      "Drag-and-configure Homepage Builder",
      "Full CMS for custom pages",
      "Theme Builder with instant preview",
      "Four production-ready starter themes (see our Themes showcase)",
    ],
  },
  {
    title: "Platform & Operations",
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
    <div className="container py-16 lg:py-24">
      <h1 className="text-3xl sm:text-4xl font-semibold text-center">Everything you need to run a serious store</h1>
      <p className="mt-4 text-center text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
        Every store on the platform gets the full feature set below - no tiers that lock core functionality away.
      </p>

      <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {FEATURE_GROUPS.map((group) => (
          <div key={group.title} className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <h2 className="font-semibold mb-4">{group.title}</h2>
            <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400 list-disc list-inside">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
