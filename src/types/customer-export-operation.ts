export type CustomerExportFormat = "csv" | "excel";
export type CustomerExportStatus = "queued" | "completed" | "failed";

/** Architecture only - no CSV/Excel export engine exists yet (see
 * src/lib/firebase/services/customer-export-service.ts). Mirrors ProductBulkOperation/
 * OrderBulkOperation's shape - a record is created the moment a request is made and
 * stays "queued" until a future phase implements the actual file generation. */
export interface CustomerExportOperation {
  id: string;
  format: CustomerExportFormat;
  status: CustomerExportStatus;
  note?: string;
  createdAt?: number;
}
