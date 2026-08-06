"use client";

import Link from "next/link";
import { CheckIcon } from "@heroicons/react/24/outline";

const TOP_INCLUDED = [
  "Full Store Admin panel - products, orders, customers, finance, CMS",
  "Theme Builder with 4 production-ready starter themes",
  "Tenant-isolated data with enterprise security and audit logs",
];

export default function PricingTeaser() {
  return (
    <section className="container py-20 lg:py-28 max-w-xl mx-auto">
      <div className="p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold text-lg mb-1">Everything, one plan</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          No feature-gated tiers. Every store gets the full platform.
        </p>
        <ul className="space-y-3 text-sm mb-8">
          {TOP_INCLUDED.map((item) => (
            <li key={item} className="flex gap-2">
              <CheckIcon className="w-5 h-5 text-primary-6000 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link
          href={"/pricing" as any}
          className="block text-center px-6 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 font-medium"
        >
          View full pricing →
        </Link>
      </div>
    </section>
  );
}
