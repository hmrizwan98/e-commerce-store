import "server-only";
import { AggregateField } from "firebase-admin/firestore";
import { adminDb, serverTimestamp } from "../admin";
import { stripUndefined, docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { Payout, PayoutStatus } from "@/types/payout";

const COLLECTION = "payouts";

/** Top-level (not tenant-scoped) - mirrors store-activity-logs.ts exactly: Super Admin
 * platform-wide metadata, denied to clients in firestore.rules, Admin-SDK-only. */
export async function createPayout(
  storeId: string,
  amount: number,
  opts?: { note?: string; requestedBy?: string }
): Promise<string> {
  const ref = adminDb().collection(COLLECTION).doc();
  await ref.set({
    ...stripUndefined({ storeId, amount, note: opts?.note, requestedBy: opts?.requestedBy }),
    status: "pending" satisfies PayoutStatus,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getPayoutsByStore(storeId: string, limit = 20): Promise<Payout[]> {
  return safeQuery("getPayoutsByStore", [], async () => {
    const snap = await adminDb()
      .collection(COLLECTION)
      .where("storeId", "==", storeId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snap.docs
      .map((doc) => docData<Payout>(doc))
      .filter((p): p is Payout => p !== null);
  });
}

export interface PayoutTotals {
  totalPaidOut: number;
  pendingBalance: number;
}

/**
 * Used only by getStoreFinancialSummary() (finance-service.ts), which previously derived
 * these same two numbers by summing getPayoutsByStore()'s capped 20-most-recent list -
 * correct only for a store with 20 or fewer payouts ever, silently wrong (understated
 * totalPaidOut, therefore overstated availableBalance) the moment a store crosses 20
 * payouts. Computed here via Firestore's native sum() aggregation across ALL of this
 * store's payouts instead - identical totals, without capping which payouts are counted
 * or reading any payout's actual field data.
 */
export async function getPayoutTotals(storeId: string): Promise<PayoutTotals> {
  const col = adminDb().collection(COLLECTION).where("storeId", "==", storeId);
  const [paidAgg, pendingAgg] = await Promise.all([
    col
      .where("status", "==", "paid" satisfies PayoutStatus)
      .aggregate({ totalPaidOut: AggregateField.sum("amount") })
      .get(),
    col
      .where("status", "in", ["pending", "processing"] satisfies PayoutStatus[])
      .aggregate({ pendingBalance: AggregateField.sum("amount") })
      .get(),
  ]);
  return {
    totalPaidOut: paidAgg.data().totalPaidOut,
    pendingBalance: pendingAgg.data().pendingBalance,
  };
}

export async function getAllPayouts(opts?: { status?: PayoutStatus; limit?: number }): Promise<Payout[]> {
  return safeQuery("getAllPayouts", [], async () => {
    let query: FirebaseFirestore.Query = adminDb().collection(COLLECTION);
    if (opts?.status) query = query.where("status", "==", opts.status);
    query = query.orderBy("createdAt", "desc").limit(opts?.limit ?? 50);
    const snap = await query.get();
    return snap.docs
      .map((doc) => docData<Payout>(doc))
      .filter((p): p is Payout => p !== null);
  });
}

export async function updatePayoutStatus(id: string, status: PayoutStatus): Promise<void> {
  await adminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({
      status,
      ...(status === "paid" || status === "failed" ? { processedAt: Date.now() } : {}),
    });
}
