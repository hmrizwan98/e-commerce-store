/** `stores/{storeId}/notifications/{id}` - things a Store Admin should know about (e.g. the
 * platform's decision on their commission or backup request). Server-written only, inside
 * the same Firestore transaction as the decision, so a store is notified exactly once per
 * decision and only the store the request belongs to. */
export type StoreNotificationKind = "commission_request_decision" | "backup_request_decision";
export type StoreNotificationDecision = "approved" | "rejected" | "completed";

export interface StoreNotification {
  id: string;
  kind: StoreNotificationKind;
  decision: StoreNotificationDecision;
  title: string;
  detail?: string;
  /** Super Admin's note, if any. */
  note?: string;
  /** The underlying request id (commission request / backup record). */
  refId: string;
  /** Store Admin page to open. */
  href: string;
  read: boolean;
  decidedBy?: string;
  createdAt?: number;
  updatedAt?: number;
}
