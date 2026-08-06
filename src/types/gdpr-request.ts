export type GdprRequestType = "data_export" | "delete_request" | "deactivation";
export type GdprRequestStatus = "queued" | "completed" | "failed";

/** Architecture only - "data_export" queues a record only, no real data-package
 * generation exists yet. "delete_request"/"deactivation" DO apply a real status
 * change to the Customer doc (soft-delete/block) alongside queuing this record -
 * see gdpr-service.ts. Tenant-scoped: stores/{storeId}/gdprRequests/{id}. */
export interface GdprRequest {
  id: string;
  customerId: string;
  type: GdprRequestType;
  status: GdprRequestStatus;
  createdAt?: number;
}
