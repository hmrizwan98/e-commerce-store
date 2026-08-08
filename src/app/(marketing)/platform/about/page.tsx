import React from "react";
import type { Metadata } from "next";
import { SparklesIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "About — Tradez Glint Platform",
  description: "About the Tradez Glint eCommerce SaaS platform.",
  openGraph: {
    title: "About — Tradez Glint Platform",
    description: "About the Tradez Glint eCommerce SaaS platform.",
    url: "/about",
    siteName: "Tradez Glint",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Tradez Glint Platform",
    description: "About the Tradez Glint eCommerce SaaS platform.",
  },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-3xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary-6000/20 bg-primary-6000/10 text-primary-700 dark:text-primary-300 text-xs font-semibold">
          <SparklesIcon className="w-4 h-4 text-primary-6000" />
          <span>Our Platform Mission</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
          About Tradez Glint
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Enterprise multi-tenant eCommerce engineering made accessible for growing retail brands.
        </p>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-xl shadow-neutral-900/5 prose dark:prose-invert max-w-none space-y-6">
        <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium">
          Tradez Glint is an enterprise-grade, multi-tenant eCommerce platform built for businesses that want a real online store without building or managing complex cloud infrastructure.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Every store on the platform runs on the same production-grade foundation: a dedicated Store Admin for day-to-day operations, a Super Admin control plane for platform oversight, tenant-isolated data, Cloudinary-backed media pipelines, and a commission-based pricing model aligned with store growth.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          We built the platform around three core principles: <strong>isolation</strong> (your data is always fully isolated), <strong>performance</strong> (fast Next.js RSC rendering by default), and <strong>operability</strong> (a real merchant admin panel, not a superficial dashboard template).
        </p>
      </div>
    </div>
  );
}

