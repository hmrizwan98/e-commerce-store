/** Order Timeline is computed, not stored - it merges statusHistory, paymentStatusHistory,
 * returnStatusHistory, and the order activity log into a single sorted view at render
 * time, mirroring inventory-math.ts's "pure calc kept out of Firestore" style. */

import type { Order } from "@/types/order";
import type { OrderActivityLog } from "@/types/order-activity-log";

export interface OrderTimelineEvent {
  at: number;
  label: string;
  kind: "status" | "payment" | "return" | "activity";
  note?: string;
}

const ACTIVITY_LABELS: Record<OrderActivityLog["action"], string> = {
  status_changed: "Order status changed",
  payment_status_changed: "Payment status changed",
  shipment_updated: "Shipment information updated",
  note_added: "Note added",
  cancelled: "Order cancelled",
  refund_issued: "Refund issued",
  return_updated: "Return status updated",
  document_queued: "Document queued",
};

export function buildOrderTimeline(order: Order, activity: OrderActivityLog[]): OrderTimelineEvent[] {
  const events: OrderTimelineEvent[] = [];

  order.statusHistory?.forEach((h) =>
    events.push({ at: h.at, label: `Status: ${h.status}`, kind: "status", note: h.note })
  );
  order.paymentStatusHistory?.forEach((h) =>
    events.push({ at: h.at, label: `Payment: ${h.status}`, kind: "payment", note: h.note })
  );
  order.returnStatusHistory?.forEach((h) =>
    events.push({ at: h.at, label: `Return: ${h.status}`, kind: "return", note: h.note })
  );
  activity.forEach((a) =>
    events.push({
      at: a.createdAt ?? 0,
      label: ACTIVITY_LABELS[a.action] ?? a.action,
      kind: "activity",
      note: a.meta ? Object.entries(a.meta).map(([k, v]) => `${k}: ${v}`).join(", ") : undefined,
    })
  );

  return events.sort((a, b) => b.at - a.at);
}
