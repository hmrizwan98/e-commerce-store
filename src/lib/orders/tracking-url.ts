/** Customer-facing order tracking link (order-tracking/page.tsx), on the store's real
 * storefront URL - e.g. https://glamix.webriiz.com or the store's custom domain. Uses the
 * email the customer gave, else their phone (checkout email is optional), as `contact`.
 * Returns null when either the storefront URL or a contact is missing, so callers can
 * leave the link out instead of sending a broken one. Pure - safe in any bundle. */
export function buildOrderTrackingUrl(
  storefrontUrl: string | null | undefined,
  order: { orderNumber: string; guestEmail?: string; shippingAddress?: { phone?: string } }
): string | null {
  const origin = storefrontUrl?.trim().replace(/\/+$/, "");
  if (!origin || !/^https?:\/\//i.test(origin)) return null;
  const contact = order.guestEmail?.trim() || order.shippingAddress?.phone?.trim();
  if (!contact) return null;
  return `${origin}/order-tracking?orderNumber=${encodeURIComponent(order.orderNumber)}&contact=${encodeURIComponent(contact)}`;
}
