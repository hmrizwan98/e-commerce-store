"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CustomSelect from "@/components/admin/CustomSelect";
import { formatMoney } from "@/lib/currency/format";
import { describePolicy, type CommissionPolicyType } from "@/lib/finance/commission";
import { resolveCommissionRequestAction, setCommissionPolicyAction } from "./commission-actions";
import type { StoreCommissionOverview } from "@/lib/finance/commission-service";

const cardClass = "p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-5";
const inputClass = "w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent";
const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1";

const TYPE_OPTIONS: { value: CommissionPolicyType; label: string }[] = [
  { value: "none", label: "No commission" },
  { value: "percentage", label: "Percentage of order" },
  { value: "fixed", label: "Fixed amount per order" },
  { value: "percentage_plus_fixed", label: "Percentage + fixed per order" },
];

const SOURCE: Record<string, string> = {
  platform: "Platform policy",
  legacy_store_setting: "Legacy store setting (set from Store Admin before policies existed)",
  default: "Default (no policy set)",
};

const ACTION_LABEL: Record<string, string> = {
  policy_set: "Rate set by Super Admin",
  change_requested: "Store requested a change",
  change_approved: "Store request approved",
  change_rejected: "Store request rejected",
};

export default function CommissionPanel({ storeId, overview }: { storeId: string; overview: StoreCommissionOverview }) {
  const router = useRouter();
  const money = (n: number) => formatMoney(n, overview.currency, { fixedDecimals: true });
  const { effective, totals, reconciliation: rec } = overview;
  const [type, setType] = useState<CommissionPolicyType>(effective.type);
  const [percentage, setPercentage] = useState(String(effective.percentage || 0));
  const [fixed, setFixed] = useState(String(effective.fixedPerOrder || 0));
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = overview.requests.filter((r) => r.status === "pending");
  const issues = rec.missingPayments.length + rec.duplicatePayments.length + rec.orphanPayments.length + rec.amountMismatches.length;

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) => {
    setBusy(true);
    try {
      const res = await fn();
      if (!res.ok) toast.error(res.error ?? "Something went wrong.");
      else {
        toast.success(ok);
        setReason("");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Current commission</h2>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">{describePolicy(effective, money)}</p>
            <p className="text-xs text-neutral-500 mt-1">
              {SOURCE[effective.source]}
              {effective.setBy ? ` · set by ${effective.setBy}` : ""}
              {effective.setAt ? ` · ${new Date(effective.setAt).toLocaleString()}` : ""}
              {effective.version ? ` · version ${effective.version}` : ""}
            </p>
            {effective.reason && <p className="text-xs text-neutral-500 mt-0.5">Reason: {effective.reason}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3 text-right">
            {[
              ["Gross revenue", totals.grossRevenue],
              ["Net revenue", totals.netRevenue],
              ["Commission earned", totals.commissionNet],
              ["Refunds", totals.refunds],
            ].map(([label, value]) => (
              <div key={label as string} className="px-4 py-2 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</p>
                <p className="text-sm font-extrabold font-mono text-neutral-900 dark:text-white">{money(value as number)}</p>
              </div>
            ))}
          </div>
        </div>
        {effective.source === "legacy_store_setting" && (
          <p className="text-xs p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            This store still uses the rate it set itself before platform policies existed. Save a policy below to take control of it - past commission is never recalculated.
          </p>
        )}
      </div>

      {pending.length > 0 && (
        <div className={cardClass}>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Pending change request</h2>
          {pending.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 space-y-2">
              <p className="text-sm">
                <span className="font-bold">{describePolicy(r.current, money)}</span> → <span className="font-bold">{describePolicy(r.proposed, money)}</span>
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">Reason: {r.reason}</p>
              <p className="text-[11px] text-neutral-400">
                {r.requestedByEmail || r.requestedBy} · {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => resolveCommissionRequestAction(storeId, r.id, true, reason || undefined), "Approved - new rate is now in effect.")}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => resolveCommissionRequestAction(storeId, r.id, false, reason || undefined), "Request rejected.")}
                  className="px-4 py-2 rounded-xl border border-rose-300 text-rose-600 text-xs font-bold disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          <p className="text-[11px] text-neutral-500">The note field below (if filled) is saved with your decision.</p>
        </div>
      )}

      <div className={cardClass}>
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Set commission policy</h2>
          <p className="text-xs text-neutral-500">
            Applies to payments recognised from now on. Every paid order keeps the rate it was charged at - changing this never rewrites past commission.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Type</label>
            <CustomSelect value={type} onChange={(v) => setType(v as CommissionPolicyType)} options={TYPE_OPTIONS} />
          </div>
          {(type === "percentage" || type === "percentage_plus_fixed") && (
            <div>
              <label className={labelClass}>Percentage (%)</label>
              <input type="number" min={0} max={100} step="0.01" className={inputClass} value={percentage} onChange={(e) => setPercentage(e.target.value)} />
            </div>
          )}
          {(type === "fixed" || type === "percentage_plus_fixed") && (
            <div>
              <label className={labelClass}>Fixed per order ({overview.currency.currencySymbol || overview.currency.currency || "store currency"})</label>
              <input type="number" min={0} step="0.01" className={inputClass} value={fixed} onChange={(e) => setFixed(e.target.value)} />
            </div>
          )}
        </div>
        <div>
          <label className={labelClass}>Reason / note (required, kept in the audit trail)</label>
          <textarea className={inputClass} rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <button
          type="button"
          disabled={busy || reason.trim().length < 3}
          onClick={() => run(() => setCommissionPolicyAction(storeId, { type, percentage: Number(percentage), fixedPerOrder: Number(fixed) }, reason), "Commission policy saved.")}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Saving…" : "Save policy"}
        </button>
        <p className="text-[11px] text-neutral-500">Only Super Admins can change this. Store Admins can send a request, which takes effect only after you approve it.</p>
      </div>

      <div className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Reconciliation</h2>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${issues ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
            {issues ? `${issues} issue${issues === 1 ? "" : "s"}` : "Ledger matches orders"}
          </span>
        </div>
        <p className="text-xs text-neutral-500">
          {rec.paidOrders} orders marked paid · {rec.ledgerPaidOrders} recognised in the ledger. Read-only check - nothing is changed automatically.
        </p>
        {[
          ["Paid orders with no ledger payment (revenue missing)", rec.missingPayments],
          ["Orders counted more than once (duplicate payments)", rec.duplicatePayments],
          ["Ledger payment but order no longer paid", rec.orphanPayments],
          ["Recognised amount differs from order total", rec.amountMismatches],
        ].map(([label, ids]) =>
          (ids as string[]).length ? (
            <div key={label as string} className="text-xs">
              <p className="font-bold text-neutral-800 dark:text-neutral-200">{label as string} ({(ids as string[]).length})</p>
              <p className="font-mono text-neutral-500 break-all">{(ids as string[]).slice(0, 20).join(", ")}</p>
            </div>
          ) : null
        )}
      </div>

      <div className={cardClass}>
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Order-level breakdown (latest)</h2>
        {overview.recent.length === 0 ? (
          <p className="text-sm text-neutral-500">No ledger entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-neutral-500 uppercase">
                <tr>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Order</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3 text-right">Amount</th>
                  <th className="py-2 pr-3">Rate applied</th>
                  <th className="py-2 text-right">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {overview.recent.map((t) => (
                  <tr key={t.id}>
                    <td className="py-2 pr-3 whitespace-nowrap" suppressHydrationWarning>{t.createdAt ? new Date(t.createdAt).toLocaleString() : "—"}</td>
                    <td className="py-2 pr-3 font-mono">{t.orderId.slice(0, 10)}</td>
                    <td className="py-2 pr-3 capitalize">{t.type}</td>
                    <td className="py-2 pr-3 text-right font-mono">{money(t.amount)}</td>
                    <td className="py-2 pr-3">{t.commissionPolicy ? `${describePolicy(t.commissionPolicy, money)} (v${t.commissionPolicy.version})` : t.type === "payment" ? "Legacy entry (no snapshot)" : "—"}</td>
                    <td className="py-2 text-right font-mono">
                      {t.type === "payment" ? "" : "−"}
                      {money(t.commissionAmount ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={cardClass}>
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Rate history</h2>
        {overview.audit.length === 0 ? (
          <p className="text-sm text-neutral-500">No changes recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {overview.audit.map((a) => (
              <li key={a.id} className="text-xs border-b border-neutral-100 dark:border-neutral-800 pb-3 last:border-0">
                <p className="font-bold text-neutral-900 dark:text-white">
                  {ACTION_LABEL[a.action] ?? a.action} · <span className="capitalize">{a.approvalStatus}</span>
                </p>
                <p className="text-neutral-600 dark:text-neutral-300">
                  {a.previous ? describePolicy(a.previous, money) : "—"} → {describePolicy(a.next, money)}
                </p>
                <p className="text-neutral-500">Reason: {a.reason}</p>
                <p className="text-neutral-400" suppressHydrationWarning>
                  {a.actorEmail || a.actorUid} ({a.actorRole === "superadmin" ? "Super Admin" : "Store Admin"}) · {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
