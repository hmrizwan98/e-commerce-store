import "server-only";
import { FieldValue } from "firebase-admin/firestore";
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

/**
 * Full-collection scan, same trade-off already accepted by getOrderStats/
 * getTopSellingProducts (orders.ts) - acceptable at this store's transaction volume,
 * revisit with a denormalized rollup doc if it grows very large.
 */
export async function getTransactionLedger(limit = 50): Promise<Transaction[]> {
  const col = await tenantCollection(COLLECTION);
  const snap = await col.orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs
    .map((doc) => docData<Transaction>(doc))
    .filter((t): t is Transaction => t !== null);
}

/** Unbounded read used only for summing totals (Store Financial Summary) - deliberately
 * not limited like getTransactionLedger's display list above. */
export async function getAllTransactionsForSummary(): Promise<Transaction[]> {
  const col = await tenantCollection(COLLECTION);
  const snap = await col.get();
  return snap.docs
    .map((doc) => docData<Transaction>(doc))
    .filter((t): t is Transaction => t !== null);
}
