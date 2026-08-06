import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Tradez Glint Platform",
  description: "Terms of service for the Tradez Glint eCommerce SaaS platform website.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function PlatformTermsPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-3xl mx-auto prose dark:prose-invert">
      <h1>Terms of Service</h1>
      <p>
        These terms govern your use of the Tradez Glint platform marketing website (this site). Terms governing an
        individual store&apos;s storefront, and the commercial agreement between a store owner and Tradez Glint, are
        addressed separately when you onboard - not on this page.
      </p>
      <h2>Use of this site</h2>
      <p>
        This site is provided for informational purposes to help you evaluate the platform. Content is provided
        as-is, and specific commitments (pricing, SLAs, feature availability) are confirmed directly when you book a
        demo.
      </p>
      <h2>Contact</h2>
      <p>Questions about these terms can be sent through our Contact page.</p>
    </div>
  );
}
