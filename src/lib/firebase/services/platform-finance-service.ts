import "server-only";
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
 * Platform-wide aggregation via a single collectionGroup("transactions") scan across
 * every store's tenant-scoped ledger, same in-memory-reduce trade-off getOrderStats
 * already accepts (no aggregate/rollup doc). Avoids an N+1 loop over getStores().
 */
export async function getPlatformFinancialDashboard(): Promise<PlatformFinancialDashboard> {
  const monthStart = MONTH_START();
  const [transactionsSnap, stores, payouts] = await Promise.all([
    adminDb().collectionGroup("transactions").get(),
    getStores({ includeArchived: true }),
    getAllPayouts(),
  ]);

  const transactions = transactionsSnap.docs
    .map((doc) => docData<Transaction>(doc))
    .filter((t): t is Transaction => t !== null);

  const storeNameById = new Map(stores.map((s) => [s.id, s.name]));
  const revenueByStore = new Map<string, number>();

  let totalRevenue = 0;
  let totalCommission = 0;
  let monthlyRevenue = 0;

  transactions.forEach((t) => {
    if (t.type !== "payment") return;
    totalRevenue += t.amount;
    totalCommission += t.commissionAmount ?? 0;
    if ((t.createdAt ?? 0) >= monthStart) monthlyRevenue += t.amount;
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

  return { totalRevenue, totalCommission, activeStores, pendingPayouts, monthlyRevenue, topStores };
}
