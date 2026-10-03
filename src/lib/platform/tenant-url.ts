import { getActivePrimaryCustomDomain } from "@/lib/domains/custom-domain";

/**
 * Helper functions to construct tenant URLs cleanly across server and client components.
 */

/** Path-based guaranteed testing URL for public storefront (e.g. http://localhost:3000/store/{slug}) */
export function getTenantStorefrontUrl(baseUrl: string, slug: string, path = ""): string {
  const origin = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${origin}/store/${slug}${cleanPath}`;
}

/** Path-based guaranteed testing URL for store admin panel (e.g. http://localhost:3000/store/{slug}/admin) */
export function getTenantAdminUrl(baseUrl: string, slug: string, path = ""): string {
  const origin = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${origin}/store/${slug}/admin${cleanPath}`;
}

/**
 * Builds a tenant's storefront subdomain URL by inserting `{slug}.` before the platform base
 * URL's hostname (e.g. https://glamix.webriiz.com).
 */
export function buildTenantUrl(baseUrl: string, slug: string, path = ""): string {
  try {
    const url = new URL(baseUrl);
    url.hostname = `${slug}.${url.hostname}`;
    return `${url.origin}${path}`;
  } catch {
    return `${baseUrl}/store/${slug}${path}`;
  }
}

/**
 * Builds a tenant's Store Admin subdomain URL using single-level wildcard SSL domain (e.g. https://admin-glamix.webriiz.com).
 */
export function buildTenantAdminUrl(baseUrl: string, slug: string, path = ""): string {
  try {
    const url = new URL(baseUrl);
    url.hostname = `admin-${slug}.${url.hostname}`;
    const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
    return `${url.origin}${cleanPath}`;
  } catch {
    return `${baseUrl}/store/${slug}/admin${path}`;
  }
}

/**
 * Builds a password-reset/set-password action link on the STABLE root domain, never on a
 * per-tenant admin-{slug}/admin.{slug} subdomain. Firebase Auth rejects
 * generatePasswordResetLink()/sendPasswordResetEmail()'s actionCodeSettings.url with
 * "Domain not allowlisted by project" for any hostname outside the project's Authorized
 * Domains list - a finite, manually-configured list that can never contain every
 * subdomain this platform provisions over time. The slug travels as a query param instead,
 * so the shared /admin/reset-password page (reachable from the root domain - see
 * middleware.ts's marketing-host fallthrough) can still redirect back to the right store
 * after a successful reset.
 */
export function buildResetPasswordLinkUrl(baseUrl: string, slug: string): string {
  const origin = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${origin}/admin/reset-password?slug=${encodeURIComponent(slug)}`;
}

type StoreUrlInput = {
  slug: string;
  domains?: string[];
  domainSettings?: Record<string, { isPrimary?: boolean; dnsStatus?: string; sslStatus?: string; redirectPlatformSubdomain?: boolean }>;
};

/**
 * The store's storefront URL: its custom domain once that is live (primary, DNS-verified,
 * SSL-active - see getActivePrimaryCustomDomain), otherwise its {slug}.ROOT_DOMAIN address,
 * which always works. Never returns a domain that isn't connected yet.
 */
export function getStorefrontUrl(store: StoreUrlInput, baseUrl: string): string {
  const live = getActivePrimaryCustomDomain(store);
  return live ? `https://${live.hostname}` : buildTenantUrl(baseUrl, store.slug);
}

/** Store Admin URL - admin.<custom domain> once live, otherwise admin-{slug}.ROOT_DOMAIN. */
export function getStoreAdminUrl(store: StoreUrlInput, baseUrl: string): string {
  const live = getActivePrimaryCustomDomain(store);
  return live ? `https://admin.${live.hostname}` : buildTenantAdminUrl(baseUrl, store.slug);
}

/** Storefront URL for links sent to customers (e.g. WhatsApp tracking links). */
export function getReliableStorefrontUrl(store: StoreUrlInput, baseUrl: string): string {
  return getStorefrontUrl(store, baseUrl);
}
