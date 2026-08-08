import Link from "next/link";
import { CheckIcon, ArrowRightIcon, BanknotesIcon } from "@heroicons/react/24/outline";

const TOP_INCLUDED = [
  "Full Store Admin panel - products, orders, customers, finance, CMS",
  "Theme Builder with 4 production-ready starter themes",
  "Tenant-isolated data with enterprise security and audit logs",
  "Cloudinary-backed media pipeline for every image",
];

export default function PricingTeaser() {
  return (
    <section className="container py-20 lg:py-28 max-w-2xl mx-auto">
      <div className="relative p-8 sm:p-10 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-900/5 overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary-6000/10 via-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <BanknotesIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-neutral-900 dark:text-white tracking-tight">Everything included, one model</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Growth-aligned commission model — no flat license fee</p>
          </div>
        </div>

        <ul className="space-y-3.5 text-sm text-neutral-700 dark:text-neutral-300 mb-8">
          {TOP_INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary-6000/10 text-primary-6000 flex items-center justify-center shrink-0 mt-0.5">
                <CheckIcon className="w-3.5 h-3.5" />
              </div>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <Link
          href={"/pricing" as any}
          className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-full bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-white dark:to-neutral-200 text-white dark:text-neutral-900 font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
        >
          <span>View Full Pricing Details</span>
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

