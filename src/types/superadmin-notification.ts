/** Top-level `superAdminNotifications/{id}` - things a Super Admin should look at.
 * Server-written only. `dedupeKey` (doc id) prevents duplicate notifications for the same
 * underlying request. */
export type SuperAdminNotificationType = "backup_request" | "commission_change_request";
export type SuperAdminNotificationStatus = "pending" | "approved" | "rejected" | "completed";

export interface SuperAdminNotification {
  id: string;
  type: SuperAdminNotificationType;
  storeId: string;
  storeName: string;
  title: string;
  detail?: string;
  status: SuperAdminNotificationStatus;
  read: boolean;
  /** Where the underlying record lives (e.g. backup id, commission request id). */
  refId: string;
  /** Super Admin page to open (e.g. /superadmin/<storeId>/edit). */
  href: string;
  createdAt?: number;
  updatedAt?: number;
}
