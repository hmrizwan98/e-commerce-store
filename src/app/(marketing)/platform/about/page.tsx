import React from "react";
import type { Metadata } from "next";

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
    <div className="container py-16 lg:py-24 max-w-3xl mx-auto prose dark:prose-invert">
      <h1>About Tradez Glint</h1>
      <p>
        Tradez Glint is an enterprise-grade, multi-tenant eCommerce platform built for businesses that want a real
        online store without building or hosting their own infrastructure.
      </p>
      <p>
        Every store on the platform runs on the same production-grade foundation: a dedicated Store Admin for
        day-to-day operations, a Super Admin control plane for platform oversight, tenant-isolated data, Cloudinary-
        backed media, and a commission-based pricing model that only grows when your store does.
      </p>
      <p>
        We built the platform around three principles: isolation (your data is always your own), performance (fast
        by default, not as an afterthought), and operability (a real admin experience, not a bare-bones dashboard).
      </p>
    </div>
  );
}
