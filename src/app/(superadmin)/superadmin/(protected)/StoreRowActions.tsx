"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { setStoreStatus, archiveStore, restoreStore, resetStoreAdminPassword } from "./actions";
import type { StoreStatus } from "@/types/store";

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
      <div className="text-right text-xs space-y-1">
        <div className="text-neutral-500">{resetResult.adminEmail}</div>
        <div>
          New password:{" "}
          <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">{resetResult.newPassword}</code>
        </div>
        <button type="button" className="text-neutral-500 hover:underline" onClick={() => setResetResult(null)}>
          Done
        </button>
      </div>
    );
  }

  if (current === "archived") {
    return (
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={handleRestore}
          className="text-sm font-medium text-green-600 hover:underline disabled:opacity-50"
        >
          Restore
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={toggle}
        className={`text-sm font-medium hover:underline disabled:opacity-50 ${
          current === "active" ? "text-red-600" : "text-green-600"
        }`}
      >
        {current === "active" ? "Suspend" : "Activate"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={handleResetPassword}
        className="text-sm font-medium hover:underline disabled:opacity-50"
      >
        Reset password
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={handleArchive}
        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
      >
        Archive
      </button>
    </div>
  );
};

export default StoreRowActions;
