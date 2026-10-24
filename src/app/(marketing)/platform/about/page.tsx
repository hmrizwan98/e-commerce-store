import React from "react";
import type { Metadata } from "next";
import { SparklesIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "About — Webriiz Platform",
  description: "Webriiz helps Pakistani businesses launch and run their own online store - with local payments, courier tracking and WhatsApp order updates built in.",
  openGraph: {
    title: "About — Webriiz Platform",
    description: "Webriiz helps Pakistani businesses launch and run their own online store - with local payments, courier tracking and WhatsApp order updates built in.",
    url: "/about",
    siteName: "Webriiz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Webriiz Platform",
    description: "Webriiz helps Pakistani businesses launch and run their own online store - with local payments, courier tracking and WhatsApp order updates built in.",
  },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-3xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary-6000/20 bg-primary-6000/10 text-primary-700 dark:text-primary-300 text-xs font-semibold">
          <SparklesIcon className="w-4 h-4 text-primary-6000" />
          <span>Our Mission</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
          About Webriiz
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          A professional online store for every Pakistani business - without the technical headache.
        </p>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-xl shadow-neutral-900/5 prose dark:prose-invert max-w-none space-y-6">
        <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium">
          Webriiz is an online store builder for businesses that want a real store of their own - on their own domain - without hiring developers or managing hosting.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Every store comes with the tools Pakistani sellers actually need: Cash on Delivery with order verification, bank transfer and JazzCash / EasyPaisa payments, tracking links for the major Pakistani couriers, one-click WhatsApp order updates, and an easy Store Admin to run it all. Our team sets your store up with you, and our pricing is a small commission on sales - so we grow when you grow.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          We built Webriiz around three promises: <strong>your store is yours</strong> (your products, customers and orders stay private to you), <strong>it&apos;s fast</strong> (quick-loading pages, even on mobile data), and <strong>it&apos;s easy to run</strong> (a real admin panel for daily work, not just a pretty dashboard).
        </p>
      </div>
    </div>
  );
}

