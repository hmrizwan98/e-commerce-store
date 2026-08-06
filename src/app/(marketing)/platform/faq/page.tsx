import React from "react";
import type { Metadata } from "next";
import AccordionInfo from "@/components/AccordionInfo";
import { PLATFORM_FAQS } from "@/lib/marketing/faq-data";

export const metadata: Metadata = {
  title: "FAQ — Tradez Glint Platform",
  description: "Frequently asked questions about the Tradez Glint eCommerce SaaS platform.",
  openGraph: {
    title: "FAQ — Tradez Glint Platform",
    description: "Frequently asked questions about the Tradez Glint eCommerce SaaS platform.",
    url: "/faq",
    siteName: "Tradez Glint",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — Tradez Glint Platform",
    description: "Frequently asked questions about the Tradez Glint eCommerce SaaS platform.",
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
    <div className="container py-16 lg:py-24 max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <h1 className="text-3xl sm:text-4xl font-semibold text-center">Frequently asked questions</h1>
      <div className="mt-16">
        <AccordionInfo data={data} />
      </div>
    </div>
  );
}
