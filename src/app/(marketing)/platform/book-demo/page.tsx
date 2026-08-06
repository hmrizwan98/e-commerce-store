import React from "react";
import type { Metadata } from "next";
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
    <div className="container py-16 lg:py-24 max-w-xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-semibold text-center">Book a demo</h1>
      <p className="mt-4 text-center text-neutral-500 dark:text-neutral-400">
        Tell us a bit about your business and we&apos;ll set up a walkthrough of Store Admin, Super Admin, and
        everything in between.
      </p>
      <div className="mt-10">
        <BookDemoForm />
      </div>
    </div>
  );
}
