export type OrderDocumentType = "invoice" | "packing_slip" | "shipping_label";
export type OrderDocumentStatus = "queued" | "completed" | "failed";

/** Architecture only - no PDF rendering engine exists yet (see
 * src/lib/firebase/services/order-document-service.ts). Mirrors ProductBulkOperation's
 * shape - a record is created the moment a request is made and stays "queued" until a
 * future phase implements the actual document generation. */
export interface OrderDocument {
  id: string;
  orderId: string;
  type: OrderDocumentType;
  status: OrderDocumentStatus;
  fileName?: string;
  note?: string;
  createdAt?: number;
}
