"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { deleteStore } from "./actions";

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";

const DeleteStoreDialog: React.FC<{ storeId: string; slug: string }> = ({ storeId, slug }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-full border border-red-300 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        Delete this store
      </button>
    );
  }

  const handleDelete = async () => {
    setError(null);
    setWarnings([]);
    setSubmitting(true);
    try {
      const result = await deleteStore(storeId, confirmText);
      if (result.success) {
        router.push("/superadmin/stores" as any);
      } else {
        setError(`${result.error.message} (${result.error.code}, trace ${result.error.traceId})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete store.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-red-300 dark:border-red-800 space-y-4">
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}
      {!!warnings.length && (
        <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-sm border border-amber-200 space-y-1">
          <p className="font-medium">Store deleted, but some cleanup steps failed:</p>
          {warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}
      <div className="text-sm space-y-2">
        <p className="font-semibold text-red-600 dark:text-red-400">This permanently deletes:</p>
        <ul className="list-disc list-inside text-neutral-500 space-y-0.5">
          <li>The store owner&apos;s login account</li>
          <li>All products, categories, brands, collections, suppliers</li>
          <li>All orders, customers, and reviews</li>
          <li>All CMS content (pages, homepage, menus, banners, themes, site settings)</li>
          <li>All uploaded images and other Cloudinary assets</li>
          <li>All deployment, provisioning, and activity history for this store</li>
        </ul>
        <p className="text-neutral-500">This cannot be undone.</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Type <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">{slug}</code> to confirm
        </label>
        <input
          className={inputClass}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="flex items-center gap-3">
        <ButtonPrimary
          type="button"
          disabled={confirmText.trim().toLowerCase() !== slug.toLowerCase()}
          loading={submitting}
          onClick={handleDelete}
          className="!bg-red-600 hover:!bg-red-700"
        >
          Permanently delete store
        </ButtonPrimary>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setConfirmText("");
            setError(null);
          }}
          className="text-sm text-neutral-500 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteStoreDialog;
