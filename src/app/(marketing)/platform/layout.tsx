import React from "react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { BookDemoProvider } from "@/components/marketing/BookDemoContext";
import BookDemoModal from "@/components/marketing/BookDemoModal";
import { PLATFORM_SITE_URL } from "@/lib/marketing/site-url";

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tradez Glint",
  url: PLATFORM_SITE_URL,
  logo: `${PLATFORM_SITE_URL}/opengraph-image`,
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <BookDemoProvider>
      <div className="flex flex-col min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <MarketingHeader />
        <main className="flex-1">{children}</main>
        <MarketingFooter />
        <BookDemoModal />
      </div>
    </BookDemoProvider>
  );
}

