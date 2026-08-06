import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Tradez Glint Platform",
  description: "Privacy policy for the Tradez Glint eCommerce SaaS platform website.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PlatformPrivacyPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-3xl mx-auto prose dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p>
        This policy covers the Tradez Glint platform marketing website (this site) - information submitted through
        our Book a Demo and Contact forms, such as your name, email, company, and message. It does not cover any
        individual store built on the platform; each store maintains its own privacy policy for its customers.
      </p>
      <h2>What we collect</h2>
      <p>
        Demo requests and contact submissions are stored so our team can follow up with you. We do not sell this
        information to third parties.
      </p>
      <h2>Your rights</h2>
      <p>
        You may request a copy of the information you&apos;ve submitted to us, or request that we delete it, by
        reaching us via the Contact page.
      </p>
    </div>
  );
}
