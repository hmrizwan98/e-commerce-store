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
  title: "Features — Webriiz Platform",
  description: "Everything included with every Webriiz store: local payments, Pakistani courier tracking, WhatsApp order updates, COD order verification, themes and your own domain.",
  openGraph: {
    title: "Features — Webriiz Platform",
    description: "Everything included with every Webriiz store: local payments, Pakistani courier tracking, WhatsApp order updates, COD order verification, themes and your own domain.",
    url: "/features",
    siteName: "Webriiz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Features — Webriiz Platform",
    description: "Everything included with every Webriiz store: local payments, Pakistani courier tracking, WhatsApp order updates, COD order verification, themes and your own domain.",
  },
  alternates: { canonical: "/features" },
};

const FEATURE_GROUPS: { title: string; icon: React.ComponentType<{ className?: string }>; items: string[] }[] = [
  {
    title: "Catalog & Inventory",
    icon: ShoppingBagIcon,
    items: [
      "Products with sizes, colours and other options, plus auto-generated product codes",
      "Organize products by collection, brand and supplier",
      "Live stock levels with low-stock alerts",
    ],
  },
  {
    title: "Orders & Fulfillment",
    icon: TruckIcon,
    items: [
      "Order tracking page on your store with links for Couriers Next, TCS, PostEx, Trax, Leopards & CallCourier",
      "COD order verification - a quick risk check so you can confirm orders before shipping",
      "Full order history: status updates, shipment tracking, cancellations & refunds",
      "One-click WhatsApp order updates with the tracking link included",
      "Printable invoices, packing slips and shipping label details",
    ],
  },
  {
    title: "Customers",
    icon: UsersIcon,
    items: [
      "One customer list for account holders and guest checkouts",
      "See each customer's total spend, average order and order history",
      "Automatic customer groups and your own custom tags",
      "Customer data export and account deletion on request",
    ],
  },
  {
    title: "Payments & Finance",
    icon: BanknotesIcon,
    items: [
      "Cash on Delivery, bank transfer & JazzCash / EasyPaisa with payment proof upload",
      "A clear record of every payment and refund",
      "Sales summaries: gross sales, net sales, commission and payouts",
    ],
  },
  {
    title: "Design & Pages",
    icon: PaintBrushIcon,
    items: [
      "Homepage sections you can arrange yourself",
      "Create your own pages (About, policies and more)",
      "Theme editor with instant live preview",
      "Four ready-made themes included from day one",
    ],
  },
  {
    title: "Your Store & Security",
    icon: ShieldCheckIcon,
    items: [
      "Your own Store Admin to run everything",
      "Use your own domain name",
      "Product photos automatically optimized for fast loading",
      "Private store data, secure sign-in and a full activity log",
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
          <span>Everything Included</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
          Everything you need to run a serious store
        </h1>
        <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          Every Webriiz store gets everything below — no paid tiers or add-on apps locking the basics away.
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
                <ul className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
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

