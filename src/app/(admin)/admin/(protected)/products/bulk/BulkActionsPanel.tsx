"use client";

import React, { useState } from "react";
import { requestProductExport, requestProductImport } from "../actions";
import type { ProductBulkOperation } from "@/types/product-bulk-operation";

const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";

const BulkActionsPanel: React.FC<{ history: ProductBulkOperation[] }> = ({ history: initialHistory }) => {
  const [history, setHistory] = useState(initialHistory);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleExport = async () => {
    setBusy(true);
    try {
      await requestProductExport();
      setHistory((prev) => [{ id: `pending-${Date.now()}`, type: "export", status: "queued", createdAt: Date.now() }, ...prev]);
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await requestProductImport(fileName || undefined);
      setHistory((prev) => [
        { id: `pending-${Date.now()}`, type: "import", status: "queued", fileName: fileName || undefined, createdAt: Date.now() },
        ...prev,
      ]);
      setFileName("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className={cardClass}>
        <h2 className="font-semibold">Export</h2>
        <p className="text-xs text-neutral-500">
          Architecture only - queues an export request. No file is produced yet (a future
          phase implements the real export engine).
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={busy}
          className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium disabled:opacity-50"
        >
          Request export
        </button>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold">Import</h2>
        <p className="text-xs text-neutral-500">
          Architecture only - queues an import request. No file is actually read/parsed yet
          (a future phase implements the real import engine).
        </p>
        <form onSubmit={handleImport} className="flex gap-2">
          <input
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
            placeholder="File name (optional, for your own reference)"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium disabled:opacity-50 whitespace-nowrap"
          >
            Request import
          </button>
        </form>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold">History</h2>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {history.map((record) => (
            <div key={record.id} className="py-2 text-sm flex items-center justify-between">
              <span className="capitalize">{record.type}</span>
              {record.fileName && <span className="text-neutral-500">{record.fileName}</span>}
              <span className="text-neutral-500 capitalize">{record.status}</span>
              <span className="text-xs text-neutral-500">
                {record.createdAt ? new Date(record.createdAt).toLocaleString() : ""}
              </span>
            </div>
          ))}
          {!history.length && <p className="text-sm text-neutral-500 py-2">No bulk activity yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default BulkActionsPanel;
