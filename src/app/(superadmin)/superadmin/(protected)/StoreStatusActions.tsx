"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { setStoreStatus, archiveStore, restoreStore } from "./actions";
import type { StoreStatus } from "@/types/store";

/** Activate/Suspend/Archive/Restore for the Store Details page's Status tab - StoreRowActions.tsx
 * covers the same lifecycle for the store list rows; this is a standalone version without the
 * reset-password button (OwnerActions.tsx already covers that on this page). */
const StoreStatusActions: React.FC<{ id: string; status: StoreStatus }> = ({ id, status }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useState(status);

  const toggle = () => {
    const next: StoreStatus = current === "active" ? "suspended" : "active";
    startTransition(async () => {
      try {
        await setStoreStatus(id, next);
        setCurrent(next);
        toast.success(next === "active" ? "Store activated" : "Store suspended");
        router.refresh();
      } catch {
        toast.error("Failed to update store status");
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

  if (current === "archived") {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={handleRestore}
        className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-medium disabled:opacity-50"
      >
        Restore store
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={toggle}
        className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium disabled:opacity-50"
      >
        {current === "active" ? "Suspend" : "Activate"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={handleArchive}
        className="px-4 py-2 rounded-full border border-red-300 text-red-600 text-sm font-medium disabled:opacity-50"
      >
        Archive
      </button>
    </div>
  );
};

export default StoreStatusActions;
