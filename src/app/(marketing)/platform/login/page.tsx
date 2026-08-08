import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { BuildingStorefrontIcon, UserGroupIcon, ArrowRightIcon, KeyIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Login — Tradez Glint Platform",
  description: "Choose where to sign in: Store Admin or Super Admin.",
  openGraph: {
    title: "Login — Tradez Glint Platform",
    description: "Choose where to sign in: Store Admin or Super Admin.",
    url: "/login",
    siteName: "Tradez Glint",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Login — Tradez Glint Platform",
    description: "Choose where to sign in: Store Admin or Super Admin.",
  },
  alternates: { canonical: "/login" },
};

/** Pure navigation gateway - no authentication logic here. Links out to the
 * existing, unmodified /admin/login and /superadmin/login pages. */
export default function PlatformLoginGatewayPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-3xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary-6000/20 bg-primary-6000/10 text-primary-700 dark:text-primary-300 text-xs font-semibold">
          <KeyIcon className="w-4 h-4 text-primary-6000" />
          <span>Platform Authentication Gateway</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
          Sign in to your control panel
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
          Select the dedicated admin panel you need to access.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        <Link
          href={"/admin/login" as any}
          className="group relative p-8 sm:p-10 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-xl shadow-neutral-900/5 hover:border-primary-6000/50 hover:shadow-primary-6000/10 hover:-translate-y-1 transition-all text-left flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-primary-6000/10 dark:bg-primary-6000/20 text-primary-6000 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-6000 group-hover:text-white transition-all">
              <BuildingStorefrontIcon className="w-7 h-7" />
            </div>
            <h2 className="font-extrabold text-2xl text-neutral-900 dark:text-white mb-2 tracking-tight">Store Admin</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              For merchant store owners to manage products, orders, inventory, customers, themes, and financial ledgers.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-sm font-bold text-primary-6000 group-hover:text-indigo-600 transition-colors">
            <span>Proceed to Store Admin</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href={"/superadmin/login" as any}
          className="group relative p-8 sm:p-10 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-xl shadow-neutral-900/5 hover:border-indigo-500/50 hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all text-left flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <UserGroupIcon className="w-7 h-7" />
            </div>
            <h2 className="font-extrabold text-2xl text-neutral-900 dark:text-white mb-2 tracking-tight">Super Admin</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              For platform operators to provision store tenants, manage custom domains, oversee platform revenue, and audit system logs.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-sm font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-primary-6000 transition-colors">
            <span>Proceed to Super Admin</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}

