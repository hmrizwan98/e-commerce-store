/** Pure calculations kept out of Firestore - segments are derived fresh on every
 * read from the customer's existing record + computed analytics, never stored. */

import type { Customer } from "@/types/customer";
import type { CustomerAnalytics } from "./analytics";

export type CustomerSegment =
  | "new"
  | "returning"
  | "vip"
  | "high_spender"
  | "inactive"
  | "newsletter"
  | "abandoned_cart";

const DAY_MS = 24 * 60 * 60 * 1000;
const NEW_WINDOW_DAYS = 30;
const INACTIVE_WINDOW_DAYS = 90;

// Documented, configurable thresholds - not derived from any store-wide average
// (that would need an extra cross-customer query per customer, which defeats the
// point of computing this cheaply on read).
export const VIP_SPEND_THRESHOLD = 1000;
export const VIP_ORDER_COUNT_THRESHOLD = 10;
export const HIGH_SPENDER_THRESHOLD = 300;

export function computeCustomerSegments(
  customer: Customer,
  analytics: CustomerAnalytics,
  isNewsletterSubscriber: boolean
): CustomerSegment[] {
  const segments: CustomerSegment[] = [];
  const now = Date.now();
  const firstSeenAt = analytics.lastPurchaseAt && analytics.totalOrders <= 1
    ? analytics.lastPurchaseAt
    : customer.createdAt;

  if (firstSeenAt && now - firstSeenAt <= NEW_WINDOW_DAYS * DAY_MS && analytics.totalOrders <= 1) {
    segments.push("new");
  }
  if (analytics.totalOrders >= 2) {
    segments.push("returning");
  }
  if (analytics.totalSpend >= VIP_SPEND_THRESHOLD || analytics.totalOrders >= VIP_ORDER_COUNT_THRESHOLD) {
    segments.push("vip");
  } else if (analytics.totalSpend >= HIGH_SPENDER_THRESHOLD) {
    segments.push("high_spender");
  }
  if (analytics.lastPurchaseAt && now - analytics.lastPurchaseAt > INACTIVE_WINDOW_DAYS * DAY_MS) {
    segments.push("inactive");
  }
  if (isNewsletterSubscriber) {
    segments.push("newsletter");
  }
  // Abandoned Cart - architecture only, per the task. No server-side cart-
  // abandonment tracking exists to detect this for real yet.
  const hasAbandonedCart = false;
  if (hasAbandonedCart) {
    segments.push("abandoned_cart");
  }

  return segments;
}
