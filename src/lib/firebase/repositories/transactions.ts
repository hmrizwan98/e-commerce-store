import "server-only";
import { AggregateField, FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { stripUndefined, docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { Transaction, TransactionType, TransactionStatus } from "@/types/transaction";
import type { PaymentMethod } from "@/types/order";

const COLLECTION = "transactions";

export async function logTransaction(
  storeId: string,
  orderId: string,
  type: TransactionType,
  amount: number,
  method: PaymentMethod,
  opts?: { commissionAmount?: number; note?: string; actorUid?: string; status?: TransactionStatus }
): Promise<void> {
  const col = await tenantCollection(COLLECTION);
  await col.add({
    ...stripUndefined({
      storeId,
      orderId,
      type,
      amount,
      method,
      commissionAmount: opts?.commissionAmount,
      note: opts?.note,
      actorUid: opts?.actorUid,
    }),
    status: opts?.status ?? "completed",
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function getTransactionsByOrder(orderId: string): Promise<Transaction[]> {
  return safeQuery("getTransactionsByOrder", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col.where("orderId", "==", orderId).orderBy("createdAt", "desc").get();
    return snap.docs
      .map((doc) => docData<Transaction>(doc))
      .filter((t): t is Transaction => t !== null);
  });
}

export async function getTransactionLedger(limit = 50): Promise<Transaction[]> {
  const col = await tenantCollection(COLLECTION);
  const snap = await col.orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs
    .map((doc) => docData<Transaction>(doc))
    .filter((t): t is Transaction => t !== null);
}

export interface TransactionLedgerCursor {
  createdAt: number;
  id: string;
}

export interface TransactionLedgerPage {
  transactions: Transaction[];
  hasMore: boolean;
}

/**
 * Cursor-paginated variant of getTransactionLedger(), for the Admin Finance page's ledger
 * table. getTransactionLedger() itself is left unchanged (no other callers exist today,
 * but this avoids any risk to its current contract).
 *
 * `createdAt` is a Firestore-server-resolved Timestamp (FieldValue.serverTimestamp() in
 * logTransaction()) - collisions between two separate writes are highly unlikely, but not
 * provably impossible, so the cursor also orders by the document ID as an explicit
 * tiebreaker (Firestore already appends `__name__` as an implicit final index/sort
 * component to every query, matching the primary sort's direction - this doesn't change
 * what the existing automatic single-field indexing already supports for this
 * no-`.where()` query). Cursors by these two plain, URL-safe values instead of a
 * DocumentSnapshot, which can't be serialized across a Server Component page boundary.
 * Fetches `limit + 1` docs so hasMore is known from this same single query - no count
 * query, no offset(), no full-collection read.
 */
export async function getTransactionLedgerPage(opts?: {
  limit?: number;
  startAfter?: TransactionLedgerCursor;
}): Promise<TransactionLedgerPage> {
  return safeQuery("getTransactionLedgerPage", { transactions: [], hasMore: false }, async () => {
    const limit = opts?.limit ?? 50;
    const col = await tenantCollection(COLLECTION);
    let query: FirebaseFirestore.Query = col
      .orderBy("createdAt", "desc")
      .orderBy(FieldPath.documentId(), "desc");
    if (opts?.startAfter) {
      query = query.startAfter(Timestamp.fromMillis(opts.startAfter.createdAt), opts.startAfter.id);
    }
    const snap = await query.limit(limit + 1).get();
    const transactions = snap.docs
      .slice(0, limit)
      .map((doc) => docData<Transaction>(doc))
      .filter((t): t is Transaction => t !== null);
    return { transactions, hasMore: snap.docs.length > limit };
  });
}

export interface TransactionTotals {
  grossSales: number;
  refunds: number;
  commission: number;
}

/**
 * Used only by getStoreFinancialSummary() (finance-service.ts), which previously
 * derived these same three numbers by transferring every transaction document and
 * reducing them in memory (grossSales/commission summed over type=="payment",
 * refunds summed over type=="refund"). Computed here via Firestore's native sum()
 * aggregation instead - identical totals, without reading any transaction's actual
 * field data. sum() skips documents where the summed field is missing/non-numeric,
 * matching the old code's `t.commissionAmount ?? 0` treatment of optional fields.
 */
export async function getTransactionTotals(): Promise<TransactionTotals> {
  const col = await tenantCollection(COLLECTION);
  const [paymentAgg, refundAgg] = await Promise.all([
    col
      .where("type", "==", "payment")
      .aggregate({
        grossSales: AggregateField.sum("amount"),
        commission: AggregateField.sum("commissionAmount"),
      })
      .get(),
    col
      .where("type", "==", "refund")
      .aggregate({ refunds: AggregateField.sum("amount") })
      .get(),
  ]);
  return {
    grossSales: paymentAgg.data().grossSales,
    commission: paymentAgg.data().commission,
    refunds: refundAgg.data().refunds,
  };
}
