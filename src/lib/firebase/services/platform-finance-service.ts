import "server-only";
import { AggregateField } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { docData } from "@/lib/firebase/repositories/utils";
import { getStores } from "@/lib/firebase/repositories/stores";
import { getAllPayouts } from "@/lib/firebase/repositories/payouts";
import type { Transaction } from "@/types/transaction";

export interface TopStore {
  storeId: string;
  storeName: string;
  revenue: number;
}

export interface PlatformFinancialDashboard {
  totalRevenue: number;
  totalCommission: number;
  activeStores: number;
  pendingPayouts: number;
  monthlyRevenue: number;
  topStores: TopStore[];
}

const MONTH_START = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
};

/**
 * Platform-wide, across every store's tenant-scoped ledger via collectionGroup("transactions").
 * totalRevenue/totalCommission/monthlyRevenue are computed with Firestore's native sum()
 * aggregation instead of transferring and reducing every transaction document ever recorded
 * on the platform - each is the exact same value the old full-scan-then-reduce implementation
 * produced (sum of `amount`/`commissionAmount` where type=="payment", monthlyRevenue further
 * bounded to createdAt>=monthStart), just computed server-side.
 *
 * topStores (revenue grouped by storeId) has no aggregation equivalent - Firestore aggregate
 * queries have no "group by", so ranking stores by revenue still requires reading each payment
 * transaction's own storeId/amount. `.select("storeId","amount")` keeps that read to only the
 * two fields actually used here (excluding orderId/commissionAmount/method/status/note/
 * actorUid/createdAt from the transfer) - this part is intentionally left as a real document
 * read, not aggregation, because the grouping logic can't be expressed any other way without
 * a denormalized per-store rollup doc (a schema change outside this fix's scope).
 */
export async function getPlatformFinancialDashboard(): Promise<PlatformFinancialDashboard> {
  const monthStart = MONTH_START();
  const paymentTransactions = adminDb().collectionGroup("transactions").where("type", "==", "payment");

  const [totalsSnap, monthlySnap, paymentDocsSnap, stores, payouts] = await Promise.all([
    paymentTransactions
      .aggregate({
        totalRevenue: AggregateField.sum("amount"),
        totalCommission: AggregateField.sum("commissionAmount"),
      })
      .get(),
    paymentTransactions
      .where("createdAt", ">=", monthStart)
      .aggregate({ monthlyRevenue: AggregateField.sum("amount") })
      .get(),
    paymentTransactions.select("storeId", "amount").get(),
    getStores({ includeArchived: true }),
    getAllPayouts(),
  ]);

  const storeNameById = new Map(stores.map((s) => [s.id, s.name]));
  const revenueByStore = new Map<string, number>();
  paymentDocsSnap.docs.forEach((doc) => {
    const t = docData<Transaction>(doc);
    if (!t) return;
    revenueByStore.set(t.storeId, (revenueByStore.get(t.storeId) ?? 0) + t.amount);
  });

  const activeStores = stores.filter((s) => s.status === "active").length;
  const pendingPayouts = payouts
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((s, p) => s + p.amount, 0);

  const topStores: TopStore[] = Array.from(revenueByStore.entries())
    .map(([storeId, revenue]) => ({ storeId, storeName: storeNameById.get(storeId) ?? storeId, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalRevenue: totalsSnap.data().totalRevenue,
    totalCommission: totalsSnap.data().totalCommission,
    activeStores,
    pendingPayouts,
    monthlyRevenue: monthlySnap.data().monthlyRevenue,
    topStores,
  };
}
