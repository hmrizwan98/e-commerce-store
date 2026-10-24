"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CustomSelect from "@/components/admin/CustomSelect";
import { useFormatMoney } from "@/lib/currency/CurrencyContext";
import { describePolicy, type CommissionPolicyType, type EffectiveCommissionPolicy } from "@/lib/finance/commission";
import { requestCommissionChangeAction } from "./commission-actions";
import type { CommissionChangeRequest } from "@/types/commission";

const inputClass =
  "w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500";
const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5";

const TYPE_OPTIONS: { value: CommissionPolicyType; label: string }[] = [
  { value: "none", label: "No commission" },
  { value: "percentage", label: "Percentage of order" },
  { value: "fixed", label: "Fixed amount per order" },
  { value: "percentage_plus_fixed", label: "Percentage + fixed per order" },
];

const SOURCE_LABEL: Record<EffectiveCommissionPolicy["source"], string> = {
  platform: "Set by the platform",
  legacy_store_setting: "Earlier store setting (kept until the platform reviews it)",
  default: "Platform default",
};

/** Store Admin view: the rate in force (read-only) + a request form. Requests never change
 * the rate by themselves - the platform (Super Admin) approves or rejects them. */
export default function CommissionRequestPanel({
  effective,
  pending,
}: {
  effective: EffectiveCommissionPolicy;
  pending: CommissionChangeRequest | null;
}) {
  const router = useRouter();
  const formatMoney = useFormatMoney();
  const [type, setType] = useState<CommissionPolicyType>(effective.type);
  const [percentage, setPercentage] = useState(String(effective.percentage || 0));
  const [fixed, setFixed] = useState(String(effective.fixedPerOrder || 0));
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const res = await requestCommissionChangeAction({ type, percentage: Number(percentage), fixedPerOrder: Number(fixed) }, reason);
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Request sent - the platform will review it.");
        setReason("");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <p className={labelClass}>Current commission</p>
        <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{describePolicy(effective, formatMoney)}</p>
        <p className="text-xs text-slate-500 mt-1">
          {SOURCE_LABEL[effective.source]}
          {effective.setAt ? ` · updated ${new Date(effective.setAt).toLocaleDateString()}` : ""}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Commission is calculated by the platform on each paid order and shown in Finance. Only the platform can change it.
        </p>
      </div>

      {pending ? (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-200">
          <p className="font-bold">Change request pending review</p>
          <p className="text-xs mt-1">
            Requested: {describePolicy(pending.proposed, formatMoney)}
            {pending.createdAt ? ` · ${new Date(pending.createdAt).toLocaleString()}` : ""}
          </p>
          <p className="text-xs mt-1 opacity-80">Reason: {pending.reason}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Request a change</p>
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
                <label className={labelClass}>Fixed per order</label>
                <input type="number" min={0} step="0.01" className={inputClass} value={fixed} onChange={(e) => setFixed(e.target.value)} />
              </div>
            )}
          </div>
          <div>
            <label className={labelClass}>Reason (required)</label>
            <textarea className={inputClass} rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why should the rate change?" />
          </div>
          <button
            type="button"
            disabled={busy || reason.trim().length < 3}
            onClick={submit}
            className="px-6 py-2.5 rounded-full bg-primary-6000 hover:bg-primary-700 text-white text-xs font-bold shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Sending…" : "Send request for approval"}
          </button>
        </div>
      )}
    </div>
  );
}
