import "server-only";
import { headers } from "next/headers";
import { TENANT_SLUG_HEADER } from "./constants";

/**
 * Independently answers "is this a request to the Platform's own domain" from
 * request headers alone - no Firestore lookup, so nothing here can ever
 * resolve a tenant by mistake. Mirrors middleware.ts's own hostname
 * classification (kept as a separate, read-only copy rather than an import,
 * since middleware.ts is a routing file this fix must not touch).
 *
 * Exists because src/lib/tenant/current.ts's getCurrentTenant() has a
 * local-dev-only fallback ("no slug matched -> use the first available
 * store") for `npm run dev` convenience. That fallback runs on every
 * request regardless of host, so a request to the Platform's own root
 * domain could still resolve a real store there - which then made every
 * downstream chrome-suppression check (all of which trust tenantId) wrong,
 * no matter how many of them exist. Callers that need to know "should this
 * request ever be treated as having a tenant" (layout.tsx's theme/tenant
 * resolution, page.tsx's platform-vs-storefront branch) must check this
 * FIRST and skip calling getCurrentTenant() entirely when it's true, rather
 * than trusting getCurrentTenant()'s result to already be null.
 */
export function isPlatformDomainRequest(): boolean {
  const hdrs = headers();

  // TEMPORARY (Phase 8A) - a /frontstore/{slug} preview request always sets
  // TENANT_SLUG_HEADER from the path (see middleware.ts), even on the
  // platform's own bare/www domain where this function would otherwise
  // unconditionally return true and short-circuit tenant resolution before
  // the header is ever read. Safe: middleware.ts unconditionally deletes any
  // client-forged copy of this header before setting its own, so a truthy
  // value here can only have been set by middleware.ts itself.
  if (hdrs.get(TENANT_SLUG_HEADER)) return false;

  const hostHeader = hdrs.get("x-forwarded-host") || hdrs.get("host") || "";
  const hostname = hostHeader.split(":")[0].toLowerCase();

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    // An explicit DEV_TENANT_SLUG means this localhost request is
    // deliberately targeting a tenant, not the platform site - same
    // precedence middleware.ts uses.
    return !process.env.DEV_TENANT_SLUG?.trim();
  }

  const parts = hostname.split(".");
  const isLocalhostSubdomain = parts.length === 2 && parts[1] === "localhost";
  if (parts.length > 2 || isLocalhostSubdomain) return false; // {slug}.ROOT_DOMAIN or {slug}.localhost subdomain

  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").trim().toLowerCase();
  return !!rootDomain && (hostname === rootDomain || hostname === `www.${rootDomain}`);
}
