import React from "react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { PLATFORM_SITE_URL } from "@/lib/marketing/site-url";

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tradez Glint",
  url: PLATFORM_SITE_URL,
  logo: `${PLATFORM_SITE_URL}/opengraph-image`,
};

/**
 * Nested layout for the public SaaS marketing site (/platform/*) - reachable
 * on any host, same mechanism as /superadmin, independent of tenant
 * resolution. The storefront's own SiteHeader/Footer/AnnouncementBar/
 * WhatsAppButton self-suppress on this path prefix (see their own
 * usePathname() guards), so this header/footer is the only visible chrome.
 */
export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
      />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
