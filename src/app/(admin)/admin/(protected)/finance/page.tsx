import React from "react";
import Link from "next/link";
import { getStoreFinancialSummary } from "@/lib/firebase/services/finance-service";
import { getTransactionLedger } from "@/lib/firebase/repositories/transactions";
import { getFinanceReportHistory } from "@/lib/firebase/repositories/finance-reports";
import FinanceReportPanel from "./FinanceReportPanel";

export const dynamic = "force-dynamic";

const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6";

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default async function AdminFinancePage() {
  const [summary, ledger, reportHistory] = await Promise.all([
    getStoreFinancialSummary(),
    getTransactionLedger(),
    getFinanceReportHistory(),
  ]);

  const stats: { label: string; value: number }[] = [
    { label: "Gross Sales", value: summary.grossSales },
    { label: "Net Sales", value: summary.netSales },
    { label: "Refunds", value: summary.refunds },
    { label: "Commission", value: summary.commission },
    { label: "Pending Balance", value: summary.pendingBalance },
    { label: "Available Balance", value: summary.availableBalance },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Finance</h1>
        <Link href={"/admin/settings" as any} className="text-sm font-medium hover:underline">
          Commission &amp; Tax settings →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={cardClass}>
            <div className="text-sm text-neutral-500">{s.label}</div>
            <div className="text-2xl font-semibold mt-1">{money(s.value)}</div>
          </div>
        ))}
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Transaction Ledger</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                <th className="p-2">Order</th>
                <th className="p-2">Type</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Commission</th>
                <th className="p-2">Method</th>
                <th className="p-2">Status</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((t) => (
                <tr key={t.id} className="border-b border-neutral-100 dark:border-neutral-800/60">
                  <td className="p-2">
                    <Link href={`/admin/orders/${t.orderId}` as any} className="hover:underline">
                      {t.orderId.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="p-2 capitalize">{t.type}</td>
                  <td className="p-2">{money(t.amount)}</td>
                  <td className="p-2">{t.commissionAmount ? money(t.commissionAmount) : "—"}</td>
                  <td className="p-2 capitalize">{t.method.replace("_", " ")}</td>
                  <td className="p-2 capitalize">{t.status}</td>
                  <td className="p-2">{t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}</td>
                </tr>
              ))}
              {!ledger.length && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    No transactions yet. Payment/refund records appear here once orders are marked paid or refunded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FinanceReportPanel history={reportHistory} />
    </div>
  );
}
