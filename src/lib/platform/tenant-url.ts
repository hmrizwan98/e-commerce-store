/**
 * Builds a tenant's own URL by inserting `{slug}.` before the platform base
 * URL's hostname - the ONE place this string surgery happens, reused by
 * every server AND client caller. Pure (no env access) - safe to import
 * from client components for instant, pre-server-round-trip previews.
 */
export function buildTenantUrl(baseUrl: string, slug: string, path = ""): string {
  const url = new URL(baseUrl);
  url.hostname = `${slug}.${url.hostname}`;
  return `${url.origin}${path}`;
}
