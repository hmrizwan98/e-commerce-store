import { normalizeHostname } from "@/lib/tenant/hostname";

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
 * Builds a tenant's Store Admin subdomain URL by inserting `admin.{slug}.` before the platform base
 * URL's hostname (e.g. https://admin.glamix.webriiz.com).
 */
export function buildTenantAdminUrl(baseUrl: string, slug: string, path = ""): string {
  try {
    const url = new URL(baseUrl);
    url.hostname = `admin.${slug}.${url.hostname}`;
    return `${url.origin}${path}`;
  } catch {
    return `${baseUrl}/store/${slug}/admin${path}`;
  }
}

/**
 * Resolves the primary storefront URL for a store, respecting custom domains if configured.
 * E.g., https://glamix.pk if custom domain exists, else https://glamix.webriiz.com.
 */
export function getStorefrontUrl(
  store: { slug: string; domains?: string[]; websiteUrl?: string },
  baseUrl: string
): string {
  const customDomain = (store.domains ?? []).find((d) => !d.startsWith("admin."));
  if (customDomain) {
    return `https://${normalizeHostname(customDomain)}`;
  }
  return store.websiteUrl || buildTenantUrl(baseUrl, store.slug);
}

/**
 * Resolves the primary Store Admin URL for a store, respecting custom domains if configured.
 * E.g., https://admin.glamix.pk if custom domain exists, else https://admin.glamix.webriiz.com.
 */
export function getStoreAdminUrl(
  store: { slug: string; domains?: string[]; adminUrl?: string },
  baseUrl: string
): string {
  const customDomain = (store.domains ?? []).find((d) => !d.startsWith("admin."));
  if (customDomain) {
    return `https://admin.${normalizeHostname(customDomain)}`;
  }
  return store.adminUrl || buildTenantAdminUrl(baseUrl, store.slug);
}
