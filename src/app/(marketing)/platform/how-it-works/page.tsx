import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Tradez Glint Platform",
  description: "How a store gets provisioned and run on the Tradez Glint eCommerce SaaS platform.",
  openGraph: {
    title: "How It Works — Tradez Glint Platform",
    description: "How a store gets provisioned and run on the Tradez Glint eCommerce SaaS platform.",
    url: "/how-it-works",
    siteName: "Tradez Glint",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works — Tradez Glint Platform",
    description: "How a store gets provisioned and run on the Tradez Glint eCommerce SaaS platform.",
  },
  alternates: { canonical: "/how-it-works" },
};

const STEPS: { title: string; description: string }[] = [
  {
    title: "1. Book a demo",
    description:
      "Tell us about your business and what you sell. We'll walk you through the platform and answer questions about fit and pricing.",
  },
  {
    title: "2. Your store gets provisioned",
    description:
      "Our Super Admin provisions a new, fully isolated tenant for your store - your own data, your own theme, your own custom domain.",
  },
  {
    title: "3. Pick a theme and configure your store",
    description:
      "Choose from four production-ready themes, add your products, categories, and brand, and configure shipping/payment settings from Store Admin.",
  },
  {
    title: "4. Launch and manage day-to-day",
    description:
      "Run your store: track orders, manage customers, review finance and payouts, and keep building your catalog - all from one panel.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-3xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-semibold text-center">How it works</h1>
      <div className="mt-16 space-y-10">
        {STEPS.map((step) => (
          <div key={step.title} className="pl-6 border-l-2 border-primary-6000">
            <h2 className="font-semibold text-lg mb-2">{step.title}</h2>
            <p className="text-neutral-500 dark:text-neutral-400">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
