import type { MetadataRoute } from "next";
import { PLATFORM_SITE_URL } from "@/lib/marketing/site-url";

const PLATFORM_ROUTES = [
  "",
  "/features",
  "/pricing",
  "/themes",
  "/how-it-works",
  "/faq",
  "/about",
  "/contact",
  "/book-demo",
  "/login",
];

/**
 * Scoped to the Platform marketing site only - tenant storefronts run on
 * separate tenant domains resolved at request time via middleware/
 * tenant/current.ts and have their own unrelated SEO surface, which a
 * single static sitemap.ts can't enumerate anyway. /privacy and /terms are
 * intentionally excluded (low SEO value legal boilerplate, marked
 * noindex in their own page metadata instead).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PLATFORM_ROUTES.map((path) => ({
    url: `${PLATFORM_SITE_URL}${path}`,
  }));
}
