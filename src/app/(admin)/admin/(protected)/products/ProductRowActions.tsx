"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { softDeleteProduct, restoreProduct, permanentlyDeleteProduct, duplicateProduct } from "./actions";
import { PencilSquareIcon, DocumentDuplicateIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const ProductRowActions: React.FC<{ id: string; slug: string; trashed: boolean }> = ({
  id,
  slug,
  trashed,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!trashed && !confirm("Move this product to Trash?")) return;
    setLoading(true);
    try {
      if (trashed) {
        await restoreProduct(id, slug);
      } else {
        await softDeleteProduct(id, slug);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!confirm("Permanently delete this product and all its images? This cannot be undone.")) return;
    setLoading(true);
    try {
      await permanentlyDeleteProduct(id);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      const newId = await duplicateProduct(id);
      router.push(`/admin/products/${newId}/edit` as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      {!trashed && (
        <>
          <Link
            href={`/admin/products/${id}/edit` as any}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            title="Edit product"
          >
            <PencilSquareIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit</span>
          </Link>

          <button
            onClick={handleDuplicate}
            disabled={loading}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            title="Duplicate product"
          >
            <DocumentDuplicateIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Duplicate</span>
          </button>
        </>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
          trashed
            ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100"
            : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100"
        }`}
        title={trashed ? "Restore product" : "Move to trash"}
      >
        {trashed ? (
          <>
            <ArrowPathIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Restore</span>
          </>
        ) : (
          <>
            <TrashIcon className="w-3.5 h-3.5 text-rose-500" />
            <span>Trash</span>
          </>
        )}
      </button>

      {trashed && (
        <button
          onClick={handlePermanentDelete}
          disabled={loading}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 transition-colors disabled:opacity-50"
          title="Delete permanently"
        >
          <TrashIcon className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      )}
    </div>
  );
};

export default ProductRowActions;
