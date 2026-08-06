"use client";

import React, { useState } from "react";
import { requestCustomerExport } from "../actions";
import type { CustomerExportOperation, CustomerExportFormat } from "@/types/customer-export-operation";

const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";

const CustomerExportPanel: React.FC<{ history: CustomerExportOperation[] }> = ({ history: initialHistory }) => {
  const [history, setHistory] = useState(initialHistory);
  const [busy, setBusy] = useState(false);

  const handleExport = async (format: CustomerExportFormat) => {
    setBusy(true);
    try {
      await requestCustomerExport(format);
      setHistory((prev) => [{ id: `pending-${Date.now()}`, format, status: "queued", createdAt: Date.now() }, ...prev]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className={cardClass}>
        <h2 className="font-semibold">Export</h2>
        <p className="text-xs text-neutral-500">
          Architecture only - queues an export request. No CSV/Excel file is produced
          yet (a future phase implements the real export engine).
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleExport("csv")}
            disabled={busy}
            className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium disabled:opacity-50"
          >
            Request CSV export
          </button>
          <button
            type="button"
            onClick={() => handleExport("excel")}
            disabled={busy}
            className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium disabled:opacity-50"
          >
            Request Excel export
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold">History</h2>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {history.map((record) => (
            <div key={record.id} className="py-2 text-sm flex items-center justify-between">
              <span className="uppercase">{record.format}</span>
              <span className="text-neutral-500 capitalize">{record.status}</span>
              <span className="text-xs text-neutral-500">
                {record.createdAt ? new Date(record.createdAt).toLocaleString() : ""}
              </span>
            </div>
          ))}
          {!history.length && <p className="text-sm text-neutral-500 py-2">No export activity yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default CustomerExportPanel;
