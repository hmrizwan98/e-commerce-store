import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { BuildingStorefrontIcon, UserGroupIcon } from "@heroicons/react/24/outline";

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
    <div className="container py-16 lg:py-24 max-w-2xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-semibold text-center">Sign in</h1>
      <p className="mt-4 text-center text-neutral-500 dark:text-neutral-400">Choose the panel you need to access.</p>

      <div className="mt-12 grid sm:grid-cols-2 gap-6">
        <Link
          href={"/admin/login" as any}
          className="p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-6000 transition-colors text-center"
        >
          <BuildingStorefrontIcon className="w-10 h-10 mx-auto mb-4 text-primary-6000" />
          <h2 className="font-semibold text-lg mb-1">Store Admin</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Sign in to run your own store.</p>
        </Link>

        <Link
          href={"/superadmin/login" as any}
          className="p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-6000 transition-colors text-center"
        >
          <UserGroupIcon className="w-10 h-10 mx-auto mb-4 text-primary-6000" />
          <h2 className="font-semibold text-lg mb-1">Super Admin</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Sign in to manage the platform.</p>
        </Link>
      </div>
    </div>
  );
}
