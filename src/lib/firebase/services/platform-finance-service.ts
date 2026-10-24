import "server-only";
import { getStoreStatusCounts } from "@/lib/firebase/repositories/stores";
import { getPendingPayoutsTotal } from "@/lib/firebase/repositories/payouts";
import { getPlatformAnalytics } from "@/lib/finance/platform-analytics-service";
import type { CurrencySettings } from "@/lib/currency/format";

export interface TopStore {
  storeId: string;
  storeName: string;
  revenue: number;
  currency: CurrencySettings;
}

/** One row per store currency - amounts in different currencies are never added together. */
export interface CurrencyFinanceTotals {
  currencyKey: string;
  currency: CurrencySettings;
  /** Net revenue: payments - reversals - refunds (see finance/ledger-math.ts). */
  totalRevenue: number;
  /** Commission charged minus commission returned on refunds/reversals. */
  totalCommission: number;
  /** Net revenue recognised since the 1st of the current month (UTC). */
  monthlyRevenue: number;
}

export interface PlatformFinancialDashboard {
  totals: CurrencyFinanceTotals[];
  activeStores: number;
  pendingPayouts: number;
  topStores: TopStore[];
}

/**
 * Platform-wide finance summary built on the same ledger rules as the Super Admin analytics
 * (getPlatformAnalytics): revenue is recognised when a payment is marked paid, and reversals,
 * refunds and returned commission are netted out. Previously this summed raw "payment"
 * entries only (so refunds/reversals were ignored), added different currencies together and
 * compared the Timestamp `createdAt` to a number, which made "Monthly Revenue" always 0.
 */
export async function getPlatformFinancialDashboard(): Promise<PlatformFinancialDashboard> {
  const [all, month, statusCounts, pendingPayouts] = await Promise.all([
    getPlatformAnalytics({ range: "all" }),
    getPlatformAnalytics({ range: "mtd" }),
    getStoreStatusCounts(),
    getPendingPayoutsTotal(),
  ]);

  const monthly = new Map(month.totals.map((t) => [t.currencyKey, t.netRevenue]));
  const totals: CurrencyFinanceTotals[] = all.totals.map((t) => ({
    currencyKey: t.currencyKey,
    currency: t.currency,
    totalRevenue: t.netRevenue,
    totalCommission: t.commissionNet,
    monthlyRevenue: monthly.get(t.currencyKey) ?? 0,
  }));

  const topStores: TopStore[] = all.stores
    .filter((s) => s.netRevenue > 0)
    .slice(0, 5) // already sorted by net revenue
    .map((s) => ({ storeId: s.storeId, storeName: s.name, revenue: s.netRevenue, currency: s.currency }));

  return { totals, activeStores: statusCounts.active, pendingPayouts, topStores };
}
