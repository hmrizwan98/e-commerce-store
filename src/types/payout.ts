export type PayoutStatus = "pending" | "processing" | "paid" | "failed";

/** Super Admin payout record - top-level (not tenant-scoped), same posture as
 * StoreActivityLog: this is platform-level financial metadata about a store, not the
 * store's own data, and needs to be queryable/writable across all stores at once (for
 * the Super Admin Financial Dashboard) without a resolved tenant context. Architecture
 * only - status only ever advances via an explicit Super Admin action, no real payment
 * transfer integration exists. */
export interface Payout {
  id: string;
  storeId: string;
  amount: number;
  status: PayoutStatus;
  note?: string;
  requestedBy?: string;
  processedAt?: number;
  createdAt?: number;
}
