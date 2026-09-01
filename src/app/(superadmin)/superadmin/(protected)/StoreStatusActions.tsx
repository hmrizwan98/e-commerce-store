"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { setStoreStatus, archiveStore, restoreStore, toggleStoreAssistant } from "./actions";
import type { StoreStatus } from "@/types/store";
import ConfirmModal from "./ConfirmModal";
import { SparklesIcon } from "@heroicons/react/24/outline";

/** Activate/Suspend/Archive/Restore & Assistant Toggle for the Store Details page's Status tab */
const StoreStatusActions: React.FC<{ id: string; status: StoreStatus; assistantEnabled?: boolean }> = ({
  id,
  status,
  assistantEnabled = true,
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useState(status);
  const [assistantOn, setAssistantOn] = useState(assistantEnabled);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);

  const toggleStatus = () => {
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

  const handleAssistantToggle = () => {
    const next = !assistantOn;
    startTransition(async () => {
      try {
        await toggleStoreAssistant(id, next);
        setAssistantOn(next);
        toast.success(next ? "Store Assistant enabled" : "Store Assistant disabled");
        router.refresh();
      } catch {
        toast.error("Failed to update Store Assistant state");
      }
    });
  };

  const executeArchive = () => {
    setArchiveConfirmOpen(false);
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={toggleStatus}
          className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium disabled:opacity-50"
        >
          {current === "active" ? "Suspend Store" : "Activate Store"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setArchiveConfirmOpen(true)}
          className="px-4 py-2 rounded-full border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
        >
          Archive Store
        </button>
      </div>

      {/* Assistant ON/OFF Super Admin Setting */}
      <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Store Assistant Access</h4>
            <p className="text-[11px] text-neutral-500">Enable or disable AI / Zero-Cost Assistant for this store</p>
          </div>
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={handleAssistantToggle}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            assistantOn
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${assistantOn ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"}`} />
          <span>{assistantOn ? "Assistant [ ON ]" : "Assistant [ OFF ]"}</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={archiveConfirmOpen}
        onClose={() => setArchiveConfirmOpen(false)}
        onConfirm={executeArchive}
        title="Archive Store?"
        message="Archive this store? It will disappear from the active store list, but its data is kept safely and this action can be reversed anytime."
        confirmText="Archive Store"
        variant="warning"
        isLoading={isPending}
      />
    </div>
  );
};

export default StoreStatusActions;
