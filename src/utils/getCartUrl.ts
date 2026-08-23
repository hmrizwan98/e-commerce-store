/**
 * Resolves the instant tenant-aware cart URL for client-side navigation.
 * If the current URL is under `/store/{slug}/...`, returns `/store/{slug}/cart`.
 * Otherwise returns `/cart`.
 */
export function getCartUrl(): string {
  if (typeof window === "undefined") return "/cart";
  const match = window.location.pathname.match(/^\/store\/([^\/]+)/);
  if (match && match[1]) {
    return `/store/${match[1]}/cart`;
  }
  return "/cart";
}
