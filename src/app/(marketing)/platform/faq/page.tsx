import React from "react";
import type { Metadata } from "next";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import AccordionInfo from "@/components/AccordionInfo";
import { PLATFORM_FAQS } from "@/lib/marketing/faq-data";

export const metadata: Metadata = {
  title: "FAQ — Webriiz Platform",
  description: "Answers to common questions about launching your online store with Webriiz - setup, payments, courier tracking, themes and pricing.",
  openGraph: {
    title: "FAQ — Webriiz Platform",
    description: "Answers to common questions about launching your online store with Webriiz - setup, payments, courier tracking, themes and pricing.",
    url: "/faq",
    siteName: "Webriiz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — Webriiz Platform",
    description: "Answers to common questions about launching your online store with Webriiz - setup, payments, courier tracking, themes and pricing.",
  },
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const data = PLATFORM_FAQS.map((f) => ({ name: f.question, content: f.answer }));
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PLATFORM_FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="container py-16 lg:py-24 max-w-3xl mx-auto space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary-6000/20 bg-primary-6000/10 text-primary-700 dark:text-primary-300 text-xs font-semibold">
          <QuestionMarkCircleIcon className="w-4 h-4 text-primary-6000" />
          <span>Help & Answers</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
          Frequently asked questions
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Everything you need to know about getting your store set up, keeping your data private, themes and your own domain.
        </p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-xl shadow-neutral-900/5">
        <AccordionInfo data={data} />
      </div>
    </div>
  );
}

