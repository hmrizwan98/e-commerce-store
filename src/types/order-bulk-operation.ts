export type OrderBulkOperationType = "export";
export type OrderBulkOperationStatus = "queued" | "completed" | "failed";

/** Architecture only - no CSV/file export engine exists yet (see
 * src/lib/firebase/services/order-bulk-service.ts). Mirrors ProductBulkOperation's shape -
 * a record is created the moment a request is made and stays "queued" until a future
 * phase implements the actual file write. Export-only: unlike products, orders aren't
 * imported. */
export interface OrderBulkOperation {
  id: string;
  type: OrderBulkOperationType;
  status: OrderBulkOperationStatus;
  fileName?: string;
  rowCount?: number;
  note?: string;
  createdAt?: number;
}
