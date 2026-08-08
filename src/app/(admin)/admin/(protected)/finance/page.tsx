import React from "react";
import Link from "next/link";
import { getStoreFinancialSummary } from "@/lib/firebase/services/finance-service";
import { getTransactionLedgerPage, type TransactionLedgerCursor } from "@/lib/firebase/repositories/transactions";
import { getFinanceReportHistory } from "@/lib/firebase/repositories/finance-reports";
import FinanceReportPanel from "./FinanceReportPanel";

export const dynamic = "force-dynamic";

const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6";

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

/** Stack of {createdAt,id} cursors, one per page already visited - Next pushes the current
 * page's last transaction onto it, Previous pops the last entry off. Plain, URL-safe
 * values, not a serialized DocumentSnapshot. */
function parseCursorStack(raw?: string): TransactionLedgerCursor[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => {
      const [createdAtStr, id] = entry.split("_");
      return { createdAt: Number(createdAtStr), id };
    })
    .filter((c): c is TransactionLedgerCursor => Number.isFinite(c.createdAt) && !!c.id);
}

function serializeCursorStack(stack: TransactionLedgerCursor[]): string {
  return stack.map((c) => `${c.createdAt}_${c.id}`).join(",");
}

function financeHref(cursorStack: TransactionLedgerCursor[]) {
  return cursorStack.length
    ? ({ pathname: "/admin/finance", query: { cursor: serializeCursorStack(cursorStack) } } as any)
    : ("/admin/finance" as any);
}

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams: { cursor?: string };
}) {
  const cursorStack = parseCursorStack(searchParams.cursor);
  const startAfter = cursorStack.length ? cursorStack[cursorStack.length - 1] : undefined;

  const [summary, ledgerPage, reportHistory] = await Promise.all([
    getStoreFinancialSummary(),
    getTransactionLedgerPage({ startAfter }),
    getFinanceReportHistory(),
  ]);
  const { transactions: ledger, hasMore } = ledgerPage;
  const lastTxn = ledger.length ? ledger[ledger.length - 1] : undefined;

  const nextHref =
    hasMore && lastTxn?.createdAt != null
      ? financeHref([...cursorStack, { createdAt: lastTxn.createdAt, id: lastTxn.id }])
      : undefined;
  const prevHref = cursorStack.length ? financeHref(cursorStack.slice(0, -1)) : undefined;

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

        {(nextHref || prevHref) && (
          <div className="flex items-center justify-end gap-2 pt-4">
            <Link
              href={prevHref ?? "#"}
              aria-disabled={!prevHref}
              className={`px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-medium ${
                !prevHref ? "pointer-events-none opacity-40" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              Previous
            </Link>
            <Link
              href={nextHref ?? "#"}
              aria-disabled={!nextHref}
              className={`px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-medium ${
                !nextHref ? "pointer-events-none opacity-40" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              Next
            </Link>
          </div>
        )}
      </div>

      <FinanceReportPanel history={reportHistory} />
    </div>
  );
}
