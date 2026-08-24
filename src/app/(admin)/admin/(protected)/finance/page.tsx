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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-wider mb-2">
            💰 Revenue & Accounting
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Financial Dashboard
          </h1>
        </div>
        <Link
          href={"/admin/settings" as any}
          className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all"
        >
          Commission &amp; Tax settings →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-900/5 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{money(s.value)}</div>
          </div>
        ))}
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-900/5 space-y-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
          <span>Transaction Ledger</span>
          <span className="text-xs font-normal text-slate-400">Real-time payment history</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                <th className="p-3 pl-4">Order</th>
                <th className="p-3">Type</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Commission</th>
                <th className="p-3">Method</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {ledger.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 pl-4 font-mono text-xs">
                    <Link href={`/admin/orders/${t.orderId}` as any} className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                      {t.orderId.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="p-3 capitalize text-slate-700 dark:text-slate-300 font-medium">{t.type}</td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{money(t.amount)}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 text-xs">{t.commissionAmount ? money(t.commissionAmount) : "—"}</td>
                  <td className="p-3 capitalize text-slate-600 dark:text-slate-400 text-xs">{t.method.replace("_", " ")}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 pr-4 text-slate-500 dark:text-slate-400 text-xs">{t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}</td>
                </tr>
              ))}
              {!ledger.length && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="text-3xl mb-2">💳</div>
                    <p className="font-medium">No transactions yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Payment and refund records appear here automatically once orders are processed.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(nextHref || prevHref) && (
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
            <Link
              href={prevHref ?? "#"}
              aria-disabled={!prevHref}
              className={`px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold transition-all ${
                !prevHref ? "pointer-events-none opacity-40" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              }`}
            >
              ← Previous
            </Link>
            <Link
              href={nextHref ?? "#"}
              aria-disabled={!nextHref}
              className={`px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold transition-all ${
                !nextHref ? "pointer-events-none opacity-40" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              }`}
            >
              Next →
            </Link>
          </div>
        )}
      </div>

      <FinanceReportPanel history={reportHistory} />
    </div>
  );
}
