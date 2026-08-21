import type { MetadataRoute } from "next";
import { PLATFORM_SITE_URL } from "@/lib/marketing/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/superadmin", "/api", "/frontstore"],
    },
    sitemap: `${PLATFORM_SITE_URL}/sitemap.xml`,
  };
}
