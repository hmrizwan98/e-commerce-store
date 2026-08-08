"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createPayoutRequest, updatePayoutStatusAction } from "./actions";
import type { Payout, PayoutStatus } from "@/types/payout";
import { PlusIcon, BanknotesIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

const inputClass =
  "px-3.5 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-6000/50 transition-all";

const NEXT_STATUS: Record<PayoutStatus, PayoutStatus | null> = {
  pending: "processing",
  processing: "paid",
  paid: null,
  failed: null,
};

const PayoutManagementPanel: React.FC<{
  payouts: Payout[];
  stores: { id: string; name: string }[];
}> = ({ payouts, stores }) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [amount, setAmount] = useState("");

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const storeName = (id: string) => stores.find((s) => s.id === id)?.name ?? id;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-6">
      <div>
        <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
          <BanknotesIcon className="w-5 h-5 text-indigo-500" />
          <span>Payout Requests & Settlement</span>
        </h2>
        <p className="text-xs text-neutral-500 font-mono">
          Initiate manual payout requests and advance status through settlement stages.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60">
        <select className={inputClass} value={storeId} onChange={(e) => setStoreId(e.target.value)}>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Amount ($)"
          className={`${inputClass} w-36 font-mono`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          type="button"
          disabled={busy || !storeId || !(Number(amount) > 0)}
          onClick={() =>
            run(async () => {
              await createPayoutRequest(storeId, Number(amount));
              setAmount("");
            })
          }
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-primary-6000 to-indigo-600 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all hover:opacity-95 cursor-pointer"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create Payout</span>
        </button>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {payouts.map((p) => {
          const next = NEXT_STATUS[p.status];
          return (
            <div key={p.id} className="py-3 text-xs font-mono flex items-center justify-between gap-4 flex-wrap">
              <span className="font-bold text-neutral-900 dark:text-white min-w-[140px]">
                {storeName(p.storeId)}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ${p.amount.toFixed(2)}
              </span>
              <span className="px-2.5 py-0.5 rounded-full capitalize font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                {p.status}
              </span>
              <span className="text-neutral-400 text-[11px]">
                {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
              </span>
              <div className="flex items-center gap-2">
                {next && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => updatePayoutStatusAction(p.id, next))}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    <span>Mark {next}</span>
                  </button>
                )}
                {(p.status === "pending" || p.status === "processing") && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => updatePayoutStatusAction(p.id, "failed"))}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-bold hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                  >
                    <XCircleIcon className="w-3.5 h-3.5" />
                    <span>Mark Failed</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {!payouts.length && <p className="text-xs text-neutral-500 py-4 text-center">No payout records found.</p>}
      </div>
    </div>
  );
};

export default PayoutManagementPanel;

