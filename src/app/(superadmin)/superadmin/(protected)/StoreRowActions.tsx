"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { setStoreStatus, archiveStore, restoreStore, resetStoreAdminPassword } from "./actions";
import type { StoreStatus } from "@/types/store";
import { ArrowPathIcon, KeyIcon, LockClosedIcon, CheckBadgeIcon, ArchiveBoxIcon } from "@heroicons/react/24/outline";

const StoreRowActions: React.FC<{ id: string; status: StoreStatus }> = ({ id, status }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useState(status);
  const [resetResult, setResetResult] = useState<{ adminEmail: string; newPassword: string } | null>(null);

  const toggle = () => {
    const next: StoreStatus = current === "active" ? "suspended" : "active";
    startTransition(async () => {
      try {
        await setStoreStatus(id, next);
        setCurrent(next);
        toast.success(next === "active" ? "Store activated" : "Store suspended");
      } catch {
        toast.error("Failed to update store status");
      }
    });
  };

  const handleResetPassword = () => {
    if (!confirm("Reset this store's admin password? The current password stops working immediately.")) return;
    startTransition(async () => {
      try {
        const result = await resetStoreAdminPassword(id);
        setResetResult(result);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to reset password");
      }
    });
  };

  const handleArchive = () => {
    if (!confirm("Archive this store? It will disappear from the active store list, but its data is kept and this can be reversed.")) return;
    startTransition(async () => {
      try {
        await archiveStore(id);
        setCurrent("archived");
        toast.success("Store archived");
        router.refresh();
      } catch {
        toast.error("Failed to archive store");
      }
    });
  };

  const handleRestore = () => {
    startTransition(async () => {
      try {
        await restoreStore(id, "active");
        setCurrent("active");
        toast.success("Store restored");
        router.refresh();
      } catch {
        toast.error("Failed to restore store");
      }
    });
  };

  if (resetResult) {
    return (
      <div className="text-right text-xs space-y-1 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
        <div className="text-neutral-500 font-mono">{resetResult.adminEmail}</div>
        <div>
          Temp password:{" "}
          <code className="px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900/60 font-mono font-bold text-amber-900 dark:text-amber-100">
            {resetResult.newPassword}
          </code>
        </div>
        <button
          type="button"
          className="text-amber-700 dark:text-amber-300 font-bold hover:underline"
          onClick={() => setResetResult(null)}
        >
          Done
        </button>
      </div>
    );
  }

  if (current === "archived") {
    return (
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={handleRestore}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          <ArrowPathIcon className="w-3.5 h-3.5" />
          <span>Restore</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={toggle}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
          current === "active"
            ? "border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        {current === "active" ? (
          <>
            <LockClosedIcon className="w-3.5 h-3.5" />
            <span>Suspend</span>
          </>
        ) : (
          <>
            <CheckBadgeIcon className="w-3.5 h-3.5" />
            <span>Activate</span>
          </>
        )}
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={handleResetPassword}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
        title="Reset Admin Password"
      >
        <KeyIcon className="w-3.5 h-3.5 text-neutral-400" />
        <span className="hidden xl:inline">Reset Pass</span>
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={handleArchive}
        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
        title="Archive Store"
      >
        <ArchiveBoxIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default StoreRowActions;

