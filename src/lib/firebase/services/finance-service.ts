import "server-only";
import { getAllTransactionsForSummary } from "@/lib/firebase/repositories/transactions";
import { getPayoutsByStore } from "@/lib/firebase/repositories/payouts";
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
 * Computed on read, nothing new stored - mirrors getOrderStats' full-scan-then-reduce
 * trade-off. "Pending balance" = payouts already requested and still processing;
 * "available balance" = net earnings not yet paid out or requested.
 */
export async function getStoreFinancialSummary(): Promise<StoreFinancialSummary> {
  const tenant = await requireCurrentTenant();
  const [transactions, payouts] = await Promise.all([
    getAllTransactionsForSummary(),
    getPayoutsByStore(tenant.id),
  ]);

  let grossSales = 0;
  let refunds = 0;
  let commission = 0;
  transactions.forEach((t) => {
    if (t.type === "payment") {
      grossSales += t.amount;
      commission += t.commissionAmount ?? 0;
    } else if (t.type === "refund") {
      refunds += t.amount;
    }
  });

  const netSales = grossSales - refunds;
  const netEarnings = netSales - commission;

  const totalPaidOut = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingBalance = payouts
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((s, p) => s + p.amount, 0);
  const availableBalance = Math.max(0, netEarnings - totalPaidOut - pendingBalance);

  return { grossSales, netSales, refunds, commission, pendingBalance, availableBalance };
}
