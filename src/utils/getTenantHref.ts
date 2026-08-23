/**
 * Resolves tenant-aware internal links.
 * When browsing under `/store/{slug}/...`, resolves relative paths like `/product/123` to `/store/{slug}/product/123`.
 * This prevents cross-tenant link leakages and ensures every store's navigation is 100% isolated.
 */
export function getTenantHref(path: string): string {
  if (!path) return "#";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("#")) {
    return path;
  }
  if (typeof window === "undefined") return path;

  const match = window.location.pathname.match(/^\/store\/([^\/]+)/);
  if (match && match[1]) {
    const slug = match[1];
    // Avoid double prefixing if path already starts with /store/slug
    if (path.startsWith(`/store/${slug}`)) {
      return path;
    }
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `/store/${slug}${cleanPath}`;
  }

  return path;
}
