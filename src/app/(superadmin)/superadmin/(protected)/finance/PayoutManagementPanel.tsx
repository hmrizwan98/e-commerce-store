"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createPayoutRequest, updatePayoutStatusAction } from "./actions";
import type { Payout, PayoutStatus } from "@/types/payout";

const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";
const inputClass =
  "px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";

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
    <div className={cardClass}>
      <h2 className="font-semibold">Payouts</h2>
      <p className="text-xs text-neutral-500">
        Architecture only - no real payment transfer integration. Status only advances via
        these buttons.
      </p>

      <div className="flex flex-wrap items-center gap-2">
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
          placeholder="Amount"
          className={`${inputClass} w-32`}
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
          className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium disabled:opacity-50"
        >
          Create payout
        </button>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {payouts.map((p) => {
          const next = NEXT_STATUS[p.status];
          return (
            <div key={p.id} className="py-2 text-sm flex items-center justify-between gap-2">
              <span className="font-medium">{storeName(p.storeId)}</span>
              <span>${p.amount.toFixed(2)}</span>
              <span className="capitalize text-neutral-500">{p.status}</span>
              <span className="text-xs text-neutral-500">
                {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
              </span>
              <div className="flex gap-1">
                {next && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => updatePayoutStatusAction(p.id, next))}
                    className="px-3 py-1 text-xs rounded-full border border-neutral-300 dark:border-neutral-700"
                  >
                    Mark {next}
                  </button>
                )}
                {(p.status === "pending" || p.status === "processing") && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => updatePayoutStatusAction(p.id, "failed"))}
                    className="px-3 py-1 text-xs rounded-full border border-red-300 text-red-600 dark:border-red-800"
                  >
                    Mark failed
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {!payouts.length && <p className="text-sm text-neutral-500 py-2">No payouts yet.</p>}
      </div>
    </div>
  );
};

export default PayoutManagementPanel;
