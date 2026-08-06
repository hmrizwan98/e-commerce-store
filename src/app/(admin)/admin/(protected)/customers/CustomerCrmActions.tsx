"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateCustomerStatus,
  updateCustomerTags,
  addCustomerNote,
  requestCustomerDataExport,
  requestCustomerDeletion,
  requestCustomerDeactivation,
} from "./actions";
import type { Customer, CustomerStatus } from "@/types/customer";
import type { GdprRequest } from "@/types/gdpr-request";

const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6";
const inputClass =
  "px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";

const STATUSES: CustomerStatus[] = ["active", "blocked", "deleted", "guest"];

const CustomerCrmActions: React.FC<{
  routeId: string;
  customer: Customer;
  gdprHistory: GdprRequest[];
}> = ({ routeId, customer, gdprHistory }) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<CustomerStatus>(customer.status ?? "active");
  const [tagsText, setTagsText] = useState((customer.tags ?? []).join(", "));
  const [noteText, setNoteText] = useState("");

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Status</h2>
        <div className="flex gap-2">
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as CustomerStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => updateCustomerStatus(routeId, status))}
            className="px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700"
          >
            Save status
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Tags</h2>
        <div className="flex gap-2">
          <input
            className={`${inputClass} flex-1`}
            placeholder="vip, wholesale, returning…"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              run(() =>
                updateCustomerTags(
                  routeId,
                  tagsText.split(",").map((t) => t.trim()).filter(Boolean)
                )
              )
            }
            className="px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700"
          >
            Save tags
          </button>
        </div>
        {customer.tags && customer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {customer.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Internal Notes</h2>
        <div className="space-y-2 mb-3 text-sm max-h-40 overflow-y-auto">
          {customer.internalNotes
            ?.slice()
            .reverse()
            .map((n, i) => (
              <div key={i} className="text-neutral-600 dark:text-neutral-400">
                <p>{n.text}</p>
                <p className="text-xs text-neutral-400">{new Date(n.at).toLocaleString()}</p>
              </div>
            ))}
          {!customer.internalNotes?.length && <p className="text-neutral-500">No notes yet.</p>}
        </div>
        <textarea
          className={`${inputClass} w-full`}
          rows={2}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add an internal note…"
        />
        <button
          type="button"
          disabled={busy || !noteText.trim()}
          onClick={() =>
            run(async () => {
              await addCustomerNote(routeId, noteText);
              setNoteText("");
            })
          }
          className="mt-2 px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700"
        >
          Add note
        </button>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">GDPR</h2>
        <p className="text-xs text-neutral-500 mb-4">
          Data export is architecture only - a request is queued, no data package is
          generated yet. Deletion soft-deletes this profile only; the customer&apos;s
          orders/reviews are retained as business records and are not affected.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => requestCustomerDataExport(routeId))}
            className="px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700"
          >
            Request data export
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => requestCustomerDeactivation(routeId))}
            className="px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700"
          >
            Deactivate account
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => requestCustomerDeletion(routeId))}
            className="px-4 py-2 text-sm rounded-lg border border-red-300 text-red-600 dark:border-red-800"
          >
            Request deletion
          </button>
        </div>
        <div className="space-y-2 text-sm">
          {gdprHistory.map((r) => (
            <div key={r.id} className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span className="capitalize">{r.type.replace("_", " ")} — {r.status}</span>
              <span>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</span>
            </div>
          ))}
          {!gdprHistory.length && <p className="text-neutral-500">No GDPR requests yet.</p>}
        </div>
      </div>
    </>
  );
};

export default CustomerCrmActions;
