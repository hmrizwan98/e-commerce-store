export type ProductBulkOperationType = "import" | "export";
export type ProductBulkOperationStatus = "queued" | "completed" | "failed";

/** Architecture only - no CSV/file import-export engine exists yet (see
 * src/lib/firebase/services/product-bulk-service.ts). Mirrors BackupRecord's shape - a
 * record is created the moment a request is made and stays "queued" until a future phase
 * implements the actual file read/write. */
export interface ProductBulkOperation {
  id: string;
  type: ProductBulkOperationType;
  status: ProductBulkOperationStatus;
  fileName?: string;
  rowCount?: number;
  note?: string;
  createdAt?: number;
}
