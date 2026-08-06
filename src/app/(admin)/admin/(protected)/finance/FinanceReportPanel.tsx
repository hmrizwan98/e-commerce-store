"use client";

import React, { useState } from "react";
import { requestFinanceReport } from "./actions";
import type { FinanceReport } from "@/types/finance-report";

const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";
const inputClass =
  "px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";

const FinanceReportPanel: React.FC<{ history: FinanceReport[] }> = ({ history: initialHistory }) => {
  const [history, setHistory] = useState(initialHistory);
  const [busy, setBusy] = useState(false);
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");

  const handleRequest = async () => {
    setBusy(true);
    try {
      const from = periodFrom ? new Date(periodFrom).getTime() : undefined;
      const to = periodTo ? new Date(periodTo).getTime() : undefined;
      await requestFinanceReport(from, to);
      setHistory((prev) => [
        { id: `pending-${Date.now()}`, status: "queued", periodFrom: from, periodTo: to, createdAt: Date.now() },
        ...prev,
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cardClass}>
      <h2 className="font-semibold">Finance Reports</h2>
      <p className="text-xs text-neutral-500">
        Architecture only - queues a report request for an optional period. No report is
        generated yet (a future phase implements the real reporting engine).
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input type="date" className={inputClass} value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
        <input type="date" className={inputClass} value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
        <button
          type="button"
          onClick={handleRequest}
          disabled={busy}
          className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium disabled:opacity-50"
        >
          Request report
        </button>
      </div>
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {history.map((record) => (
          <div key={record.id} className="py-2 text-sm flex items-center justify-between">
            <span className="text-neutral-500 capitalize">{record.status}</span>
            <span className="text-xs text-neutral-500">
              {record.periodFrom ? new Date(record.periodFrom).toLocaleDateString() : "—"}
              {" → "}
              {record.periodTo ? new Date(record.periodTo).toLocaleDateString() : "—"}
            </span>
            <span className="text-xs text-neutral-500">
              {record.createdAt ? new Date(record.createdAt).toLocaleString() : ""}
            </span>
          </div>
        ))}
        {!history.length && <p className="text-sm text-neutral-500 py-2">No report requests yet.</p>}
      </div>
    </div>
  );
};

export default FinanceReportPanel;
