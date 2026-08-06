import type { PaymentMethod } from "./order";

export type TransactionType = "payment" | "refund";
export type TransactionStatus = "completed" | "pending" | "failed";

/** Per-store financial ledger entry - tenant-scoped: stores/{storeId}/transactions/{id}.
 * `storeId` is redundantly stored on the doc (even though the collection is already
 * tenant-scoped) so the Super Admin Financial Dashboard can run a single
 * collectionGroup("transactions") scan across every store instead of looping per store.
 * `commissionAmount` is computed once at write time and stored - unlike a live UI
 * display value, a ledger entry is a historical fact that must not change if the
 * store's commission rate is edited later. */
export interface Transaction {
  id: string;
  storeId: string;
  orderId: string;
  type: TransactionType;
  amount: number;
  commissionAmount?: number;
  method: PaymentMethod;
  status: TransactionStatus;
  note?: string;
  actorUid?: string;
  createdAt?: number;
}
