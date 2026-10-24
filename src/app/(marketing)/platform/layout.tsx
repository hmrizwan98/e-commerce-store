import React from "react";
import type { Metadata } from "next";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { BookDemoProvider } from "@/components/marketing/BookDemoContext";
import BookDemoModal from "@/components/marketing/BookDemoModal";
import { PLATFORM_SITE_URL } from "@/lib/marketing/site-url";

export const metadata: Metadata = {
  title: "Webriiz Platform - Online Store Builder for Pakistan & Global Brands",
  description: "Launch your online store with local payments (Cash on Delivery, bank transfer, JazzCash / EasyPaisa), 6+ Pakistani courier tracking (TCS, PostEx, Trax, Leopards, CallCourier, Couriers Next), WhatsApp order updates and your own domain - no setup or monthly fee.",
  keywords: ["e-commerce SaaS", "Pakistan e-commerce", "online store builder Pakistan", "JazzCash payments", "EasyPaisa payments", "cash on delivery store", "PostEx tracking", "CallCourier tracking", "Trax tracking", "TCS tracking", "Leopards tracking", "Couriers Next tracking", "WhatsApp order updates", "Webriiz"],
  alternates: {
    canonical: PLATFORM_SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: PLATFORM_SITE_URL,
    title: "Webriiz - Online Store Builder for Pakistan & Global Brands",
    description: "Launch your online store with local payments, 6+ Pakistani courier tracking, WhatsApp order updates and your own domain - no setup or monthly fee.",
    siteName: "Webriiz Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Webriiz - Online Store Builder for Pakistan",
    description: "Launch your online store with local payments, 6+ courier tracking and WhatsApp order updates - no setup or monthly fee.",
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
  description: "Online store builder for Pakistani businesses with local payments, courier tracking and WhatsApp order updates.",
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

