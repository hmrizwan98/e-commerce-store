import "server-only";
import { AggregateField, FieldValue } from "firebase-admin/firestore";
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
