import "server-only";
import { getTransactionTotals } from "@/lib/firebase/repositories/transactions";
import { getPayoutTotals } from "@/lib/firebase/repositories/payouts";
import { requireCurrentTenant } from "@/lib/tenant/current";

export interface StoreFinancialSummary {
  grossSales: number;
  netSales: number;
  refunds: number;
  commission: number;
  pendingBalance: number;
  availableBalance: number;
}

/**
 * Computed on read, nothing new stored. grossSales/refunds/commission come from
 * getTransactionTotals()'s Firestore aggregation queries; totalPaidOut/pendingBalance
 * come from getPayoutTotals()'s aggregation queries - both cover this store's full
 * lifetime history rather than a capped recent-N list. "Pending balance" = payouts
 * already requested and still processing; "available balance" = net earnings not yet
 * paid out or requested.
 */
export async function getStoreFinancialSummary(): Promise<StoreFinancialSummary> {
  const tenant = await requireCurrentTenant();
  const [{ grossSales, refunds, commission }, { totalPaidOut, pendingBalance }] = await Promise.all([
    getTransactionTotals(),
    getPayoutTotals(tenant.id),
  ]);

  const netSales = grossSales - refunds;
  const netEarnings = netSales - commission;
  const availableBalance = Math.max(0, netEarnings - totalPaidOut - pendingBalance);

  return { grossSales, netSales, refunds, commission, pendingBalance, availableBalance };
}
