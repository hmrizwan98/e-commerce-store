export type CustomerActivityAction =
  | "status_changed"
  | "tag_added"
  | "tag_removed"
  | "note_added"
  | "export_queued"
  | "gdpr_export_requested"
  | "gdpr_delete_requested"
  | "deactivated";

/** Per-store customer audit trail - tenant-scoped: stores/{storeId}/customerActivityLogs/{id}.
 * Mirrors orderActivityLogs' exact shape. Feeds the Customer Timeline. */
export interface CustomerActivityLog {
  id: string;
  customerId: string;
  action: CustomerActivityAction;
  actorUid: string;
  meta?: Record<string, string>;
  createdAt?: number;
}
