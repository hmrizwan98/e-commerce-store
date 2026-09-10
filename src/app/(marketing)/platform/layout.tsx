import React from "react";
import type { Metadata } from "next";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { BookDemoProvider } from "@/components/marketing/BookDemoContext";
import BookDemoModal from "@/components/marketing/BookDemoModal";
import { PLATFORM_SITE_URL } from "@/lib/marketing/site-url";

export const metadata: Metadata = {
  title: "Webriiz Platform - Multi-Tenant E-Commerce SaaS for Pakistan & Global Brands",
  description: "Launch your online store with local payments (JazzCash, EasyPaisa, COD), 6+ Pakistani courier tracking (PostEx, CallCourier, Trax, TCS, Leopard, M&P), isolated multi-tenant architecture, and Next.js 14 speed with 0% transaction fees.",
  keywords: ["e-commerce SaaS", "Pakistan e-commerce", "multi-tenant store builder", "JazzCash payment gateway", "EasyPaisa payment", "PostEx tracking", "CallCourier tracking", "Trax tracking", "TCS tracking", "Leopard tracking", "M&P courier tracking", "WhatsApp order updates", "Webriiz"],
  alternates: {
    canonical: PLATFORM_SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: PLATFORM_SITE_URL,
    title: "Webriiz - Multi-Tenant E-Commerce SaaS for Pakistan & Global Brands",
    description: "Launch your online store with local payments, 6+ courier tracking, isolated multi-tenant architecture, and Next.js 14 speed with 0% transaction fees.",
    siteName: "Webriiz Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Webriiz - Multi-Tenant E-Commerce SaaS",
    description: "Launch your online store with local payments, 6+ courier tracking, and Next.js 14 speed with 0% transaction fees.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Webriiz",
  url: PLATFORM_SITE_URL,
  logo: `${PLATFORM_SITE_URL}/opengraph-image`,
};

const SOFTWARE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Webriiz Platform",
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "PKR",
  },
  description: "Multi-tenant e-commerce platform with Pakistan local payments & courier tracking integrations.",
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <BookDemoProvider>
      <div className="flex flex-col min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_JSON_LD) }}
        />
        <MarketingHeader />
        <main className="flex-1">{children}</main>
        <MarketingFooter />
        <BookDemoModal />
      </div>
    </BookDemoProvider>
  );
}

