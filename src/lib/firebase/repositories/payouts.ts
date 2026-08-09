import "server-only";
import { AggregateField, Timestamp } from "firebase-admin/firestore";
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

/**
 * Used by getPlatformFinancialDashboard() (platform-finance-service.ts), which previously
 * derived this same number by summing getAllPayouts()'s capped-at-50, platform-wide list -
 * correct only while the platform has 50 or fewer payouts ever, silently wrong (understated)
 * the moment it crosses 50, the exact same class of bug getPayoutTotals() above already
 * fixed for the per-store case. Computed here via Firestore's native sum() aggregation
 * across ALL matching payouts instead - no cap, no document data transferred.
 *
 * Needs a new composite index ({status, amount}, no storeId) not yet deployed as of this
 * change - falls back to the previous capped-list computation on a missing-index error
 * (same fallback-on-FAILED_PRECONDITION shape getAllReviewsForAdmin() already uses in
 * reviews.ts), so this doesn't regress from "wrong beyond 50" to "broken" in the meantime,
 * and self-upgrades to the correct value the moment the index finishes deploying.
 */
export async function getPendingPayoutsTotal(): Promise<number> {
  const col = adminDb().collection(COLLECTION).where("status", "in", ["pending", "processing"] satisfies PayoutStatus[]);
  try {
    const snap = await col.aggregate({ pendingPayouts: AggregateField.sum("amount") }).get();
    return snap.data().pendingPayouts;
  } catch (err: any) {
    if (err?.code !== 9) throw err;
    console.error(
      "[getPendingPayoutsTotal] aggregation index missing/building, falling back to capped computation",
      err
    );
    const fallbackSnap = await adminDb().collection(COLLECTION).orderBy("createdAt", "desc").limit(50).get();
    return fallbackSnap.docs.reduce((sum, doc) => {
      const data = doc.data();
      return data.status === "pending" || data.status === "processing" ? sum + (data.amount ?? 0) : sum;
    }, 0);
  }
}

export interface PayoutsPage {
  payouts: Payout[];
  hasMore: boolean;
}

/**
 * Cursor-paginated variant of getAllPayouts(), for the Super Admin finance page's payout
 * list specifically - getAllPayouts() itself is left unchanged since
 * getPlatformFinancialDashboard() (platform-finance-service.ts) also depends on its
 * existing signature/return shape.
 *
 * Cursors by the `createdAt` VALUE (Timestamp.fromMillis(), the same conversion
 * searchAdminOrders already uses for its date-range filters in orders.ts) rather than a
 * Firestore DocumentSnapshot: a snapshot can't be serialized across a Server Component
 * page's searchParams boundary between one request and the next, but a plain millisecond
 * number can round-trip safely through the URL. Fetches `limit + 1` docs so `hasMore` is
 * known from this same single query - no separate count query, no offset(), no
 * full-collection read.
 */
export async function getPayoutsPage(opts?: { limit?: number; startAfterCreatedAt?: number }): Promise<PayoutsPage> {
  return safeQuery("getPayoutsPage", { payouts: [], hasMore: false }, async () => {
    const limit = opts?.limit ?? 50;
    let query: FirebaseFirestore.Query = adminDb().collection(COLLECTION).orderBy("createdAt", "desc");
    if (opts?.startAfterCreatedAt != null) {
      query = query.startAfter(Timestamp.fromMillis(opts.startAfterCreatedAt));
    }
    const snap = await query.limit(limit + 1).get();
    const payouts = snap.docs
      .slice(0, limit)
      .map((doc) => docData<Payout>(doc))
      .filter((p): p is Payout => p !== null);
    return { payouts, hasMore: snap.docs.length > limit };
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
