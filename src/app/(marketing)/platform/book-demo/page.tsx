import React from "react";
import type { Metadata } from "next";
import { SparklesIcon } from "@heroicons/react/24/outline";
import BookDemoForm from "./BookDemoForm";

export const metadata: Metadata = {
  title: "Book a Demo — Tradez Glint Platform",
  description: "Book a personalized demo of the Tradez Glint eCommerce SaaS platform.",
  openGraph: {
    title: "Book a Demo — Tradez Glint Platform",
    description: "Book a personalized demo of the Tradez Glint eCommerce SaaS platform.",
    url: "/book-demo",
    siteName: "Tradez Glint",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Demo — Tradez Glint Platform",
    description: "Book a personalized demo of the Tradez Glint eCommerce SaaS platform.",
  },
  alternates: { canonical: "/book-demo" },
};

export default function BookDemoPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-2xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary-6000/20 bg-primary-6000/10 text-primary-700 dark:text-primary-300 text-xs font-semibold">
          <SparklesIcon className="w-4 h-4 text-primary-6000" />
          <span>Live 1-on-1 Engineering Walkthrough</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
          Book a personalized demo
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Tell us about your business and we&apos;ll set up a live walkthrough of Store Admin, Super Admin, themes, and commission structure.
        </p>
      </div>

      <BookDemoForm />
    </div>
  );
}

