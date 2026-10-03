import "server-only";
import { headers } from "next/headers";
import {
  FRONTSTORE_PREVIEW_HEADER,
  IS_ADMIN_HOST_HEADER,
  ORIGINAL_PATH_HEADER,
  TENANT_CUSTOM_DOMAIN_HEADER,
  TENANT_SLUG_HEADER,
} from "@/lib/tenant/constants";
import { normalizeHostname } from "@/lib/tenant/hostname";
import { adminHostFor, getActivePrimaryCustomDomain } from "./custom-domain";
import type { Store } from "@/types/store";

/**
 * Where a visitor on the store's DEFAULT address ({slug}.ROOT_DOMAIN or
 * admin-{slug}.ROOT_DOMAIN) should be sent once the store has a live custom domain with
 * redirects enabled - same page on the custom domain (admin.<domain> for the admin host).
 * Returns null whenever a redirect would be wrong: request already on the custom domain,
 * /store preview mode, Server Action calls, local dev, or the domain isn't fully live.
 */
export function getCustomDomainRedirect(store: Store | null): string | null {
  if (!store) return null;
  const active = getActivePrimaryCustomDomain(store);
  if (!active?.redirectPlatformSubdomain) return null;

  const h = headers();
  if (!h.get(TENANT_SLUG_HEADER) || h.get(TENANT_CUSTOM_DOMAIN_HEADER) || h.get(FRONTSTORE_PREVIEW_HEADER)) return null;
  if (h.get("next-action")) return null; // never redirect a Server Action mid-request
  const host = normalizeHostname(h.get("x-forwarded-host") || h.get("host") || "");
  const root = normalizeHostname(process.env.NEXT_PUBLIC_ROOT_DOMAIN || (process.env.NODE_ENV === "production" ? "webriiz.com" : ""));
  if (!root || !host.endsWith(`.${root}`)) return null;

  const path = h.get(ORIGINAL_PATH_HEADER) || "/";
  const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/";
  const targetHost = h.get(IS_ADMIN_HOST_HEADER) ? adminHostFor(active.hostname) : active.hostname;
  return `https://${targetHost}${safePath}`;
}
