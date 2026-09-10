import React from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface FeatureComparison {
  feature: string;
  category: string;
  webriiz: string | boolean;
  shopify: string | boolean;
  wooCommerce: string | boolean;
}

const COMPARISONS: FeatureComparison[] = [
  {
    feature: "Monthly Base Platform Fee",
    category: "Cost & Pricing",
    webriiz: "Growth Aligned / Flat Low Fee",
    shopify: "$39 - $399 / mo",
    wooCommerce: "Free (Paid Hosting $25+/mo)",
  },
  {
    feature: "Transaction Fees",
    category: "Cost & Pricing",
    webriiz: "0% Hidden Fees",
    shopify: "0.5% - 2.0% per sale",
    wooCommerce: "Varies by plugin",
  },
  {
    feature: "Native Pakistani Couriers Tracking (`/order-tracking`)",
    category: "Pakistani Ecosystem",
    webriiz: true,
    shopify: false,
    wooCommerce: false,
  },
  {
    feature: "Pre-configured JazzCash & EasyPaisa Checkout",
    category: "Pakistani Ecosystem",
    webriiz: true,
    shopify: false,
    wooCommerce: false,
  },
  {
    feature: "Direct WhatsApp Order Notifications & Share",
    category: "Pakistani Ecosystem",
    webriiz: true,
    shopify: "Requires $15/mo App",
    wooCommerce: "Requires Paid Plugin",
  },
  {
    feature: "Full Multi-Tenant Super Admin (`/superadmin`)",
    category: "Platform Architecture",
    webriiz: true,
    shopify: "Plus Only ($2,000/mo)",
    wooCommerce: false,
  },
  {
    feature: "1-Click Store Impersonation & Cloning",
    category: "Platform Architecture",
    webriiz: true,
    shopify: false,
    wooCommerce: false,
  },
  {
    feature: "Page Load Speed & Cloudinary CDN Optimization",
    category: "Performance",
    webriiz: "Next.js 14 App Router + Cloudinary",
    shopify: "Liquid Engine (Variable)",
    wooCommerce: "Slow PHP Server dependent",
  },
];

function ComparisonMatrix() {
  return (
    <section className="container py-20 lg:py-28 max-w-5xl mx-auto px-4">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary-6000/20 bg-primary-6000/10 text-primary-700 dark:text-primary-300 text-xs font-semibold">
          <span>⚡ Platform Comparison</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          How we compare to generic store builders
        </h2>
        <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300">
          See why Pakistani brands and multi-store operators choose Webriiz over Shopify and WooCommerce.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-900/5">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/80 dark:bg-neutral-800/50">
              <th className="p-5 font-extrabold text-sm text-neutral-900 dark:text-white w-2/5">Platform Feature</th>
              <th className="p-5 font-black text-sm text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/30 text-center w-1/5 border-x border-primary-200/60 dark:border-primary-800/60">
                Webriiz (Us)
              </th>
              <th className="p-5 font-bold text-sm text-neutral-700 dark:text-neutral-300 text-center w-1/5">Shopify</th>
              <th className="p-5 font-bold text-sm text-neutral-700 dark:text-neutral-300 text-center w-1/5">WooCommerce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60 text-sm">
            {COMPARISONS.map((row) => (
              <tr key={row.feature} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                <td className="p-5 font-medium text-neutral-900 dark:text-white">
                  {row.feature}
                </td>

                {/* Webriiz Value */}
                <td className="p-5 text-center font-bold text-neutral-900 dark:text-white bg-primary-50/30 dark:bg-primary-950/20 border-x border-primary-200/40 dark:border-primary-900/40">
                  {typeof row.webriiz === "boolean" ? (
                    row.webriiz ? (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        <CheckIcon className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                        <XMarkIcon className="w-4 h-4 stroke-[3]" />
                      </div>
                    )
                  ) : (
                    <span className="text-primary-700 dark:text-primary-300 font-extrabold text-xs sm:text-sm">
                      {row.webriiz}
                    </span>
                  )}
                </td>

                {/* Shopify Value */}
                <td className="p-5 text-center text-neutral-700 dark:text-neutral-300">
                  {typeof row.shopify === "boolean" ? (
                    row.shopify ? (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        <CheckIcon className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                        <XMarkIcon className="w-4 h-4 stroke-[3]" />
                      </div>
                    )
                  ) : (
                    <span className="text-xs sm:text-sm">{row.shopify}</span>
                  )}
                </td>

                {/* WooCommerce Value */}
                <td className="p-5 text-center text-neutral-700 dark:text-neutral-300">
                  {typeof row.wooCommerce === "boolean" ? (
                    row.wooCommerce ? (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        <CheckIcon className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                        <XMarkIcon className="w-4 h-4 stroke-[3]" />
                      </div>
                    )
                  ) : (
                    <span className="text-xs sm:text-sm">{row.wooCommerce}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default React.memo(ComparisonMatrix);
