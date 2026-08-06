export type BookDemoRequestStatus = "new" | "contacted" | "converted" | "archived";

/** Root-level, genuinely tenant-independent collection - this is about prospective
 * platform customers (leads), not any existing store's data. `status`/`crmSynced`
 * exist so a future CRM integration has fields to update; nothing reads or syncs
 * them yet (architecture only, no CRM implemented here). */
export interface BookDemoRequest {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  storeType?: string;
  message?: string;
  status: BookDemoRequestStatus;
  crmSynced: boolean;
  createdAt?: number;
}
