/** Pure calculations kept out of Firestore, mirroring order-analytics.ts's style -
 * derived entirely from the customer's already-fetched orders, no extra queries. */

import type { Order } from "@/types/order";

export interface CustomerAnalytics {
  totalOrders: number;
  totalSpend: number;
  avgOrderValue: number;
  lifetimeValue: number;
  lastPurchaseAt: number | null;
  totalReviews: number;
  // null = not trackable - Wishlist is currently browser-local only, never linked
  // to a customer account (see README's Enterprise Customer CRM section).
  wishlistCount: number | null;
}

export function computeCustomerAnalytics(orders: Order[], reviewCount: number): CustomerAnalytics {
  const totalOrders = orders.length;
  // Nets out refunds using fields Order already exposes - no Transaction Ledger
  // query needed here.
  const netSpend = orders.reduce((sum, o) => sum + (o.total - (o.refundAmount ?? 0)), 0);
  const totalSpend = Math.max(0, netSpend);
  const avgOrderValue = totalOrders ? totalSpend / totalOrders : 0;
  const lastPurchaseAt = orders.reduce<number | null>(
    (latest, o) => (o.createdAt && (!latest || o.createdAt > latest) ? o.createdAt : latest),
    null
  );

  return {
    totalOrders,
    totalSpend,
    avgOrderValue,
    lifetimeValue: totalSpend,
    lastPurchaseAt,
    totalReviews: reviewCount,
    wishlistCount: null,
  };
}
