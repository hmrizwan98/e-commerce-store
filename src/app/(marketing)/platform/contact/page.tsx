import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Contact — Tradez Glint Platform",
  description: "Get in touch with the Tradez Glint eCommerce SaaS platform team.",
  openGraph: {
    title: "Contact — Tradez Glint Platform",
    description: "Get in touch with the Tradez Glint eCommerce SaaS platform team.",
    url: "/contact",
    siteName: "Tradez Glint",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Tradez Glint Platform",
    description: "Get in touch with the Tradez Glint eCommerce SaaS platform team.",
  },
  alternates: { canonical: "/contact" },
};

export default function PlatformContactPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-2xl mx-auto text-center">
      <h1 className="text-3xl sm:text-4xl font-semibold">Get in touch</h1>
      <p className="mt-4 text-neutral-500 dark:text-neutral-400">
        Have a question about the platform that isn&apos;t answered in our FAQ? Reach out and our team will get back
        to you.
      </p>
      <div className="mt-8 flex flex-col items-center gap-4">
        <a
          href="mailto:hello@tradezglint.com"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-6000 text-white font-medium"
        >
          <EnvelopeIcon className="w-5 h-5" />
          hello@tradezglint.com
        </a>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Prefer a walkthrough instead?{" "}
          <Link href={"/book-demo" as any} className="text-primary-6000 hover:underline">
            Book a demo
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
