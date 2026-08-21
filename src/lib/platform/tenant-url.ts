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
 * Builds a tenant's subdomain URL by inserting `{slug}.` before the platform base
 * URL's hostname (e.g. http://super-saver-mama.localhost:3000).
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
