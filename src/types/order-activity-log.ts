export type OrderActivityAction =
  | "status_changed"
  | "payment_status_changed"
  | "shipment_updated"
  | "note_added"
  | "cancelled"
  | "refund_issued"
  | "return_updated"
  | "document_queued";

/** Per-store order audit trail - tenant-scoped: stores/{storeId}/orderActivityLogs/{id}.
 * Mirrors productActivityLogs' exact shape. */
export interface OrderActivityLog {
  id: string;
  orderId: string;
  action: OrderActivityAction;
  actorUid: string;
  meta?: Record<string, string>;
  createdAt?: number;
}
