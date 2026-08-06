/** Customer Timeline is computed, not stored - merges registration, orders,
 * payments/refunds (flattened from each order's existing paymentStatusHistory -
 * no new query), reviews, and the Customer Activity Log into one sorted view,
 * mirroring order-timeline.ts's exact style. Wishlist/login-activity entries are
 * omitted - no reliable customer-linked data source exists for either yet (see
 * Customer.lastLoginAt's doc comment and CustomerAnalytics.wishlistCount). */

import type { Customer } from "@/types/customer";
import type { Order } from "@/types/order";
import type { Review } from "@/types/review";
import type { CustomerActivityLog } from "@/types/customer-activity-log";

export interface CustomerTimelineEvent {
  at: number;
  label: string;
  kind: "registration" | "order" | "payment" | "refund" | "review" | "activity";
  note?: string;
}

const ACTIVITY_LABELS: Record<CustomerActivityLog["action"], string> = {
  status_changed: "Status changed",
  tag_added: "Tag added",
  tag_removed: "Tag removed",
  note_added: "Note added",
  export_queued: "Export queued",
  gdpr_export_requested: "GDPR data export requested",
  gdpr_delete_requested: "GDPR deletion requested",
  deactivated: "Account deactivated",
};

export function buildCustomerTimeline(
  customer: Customer,
  orders: Order[],
  reviews: Review[],
  activity: CustomerActivityLog[]
): CustomerTimelineEvent[] {
  const events: CustomerTimelineEvent[] = [];

  if (customer.createdAt) {
    events.push({ at: customer.createdAt, label: "Registered", kind: "registration" });
  }

  orders.forEach((o) => {
    if (o.createdAt) {
      events.push({ at: o.createdAt, label: `Order ${o.orderNumber} placed`, kind: "order", note: `$${o.total.toFixed(2)}` });
    }
    o.paymentStatusHistory?.forEach((h) => {
      events.push({
        at: h.at,
        label: h.status === "refunded" ? `Refund on ${o.orderNumber}` : `Payment ${h.status} on ${o.orderNumber}`,
        kind: h.status === "refunded" ? "refund" : "payment",
        note: h.note,
      });
    });
  });

  reviews.forEach((r) => {
    if (r.createdAt) {
      events.push({ at: r.createdAt, label: `Review submitted (${r.rating}★)`, kind: "review", note: r.title });
    }
  });

  activity.forEach((a) => {
    events.push({
      at: a.createdAt ?? 0,
      label: ACTIVITY_LABELS[a.action] ?? a.action,
      kind: "activity",
      note: a.meta ? Object.entries(a.meta).map(([k, v]) => `${k}: ${v}`).join(", ") : undefined,
    });
  });

  return events.sort((a, b) => b.at - a.at);
}
