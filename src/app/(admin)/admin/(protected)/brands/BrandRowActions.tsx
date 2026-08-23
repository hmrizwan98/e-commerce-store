"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { softDeleteBrand, restoreBrand } from "./actions";
import { PencilSquareIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const BrandRowActions: React.FC<{ id: string; slug?: string; trashed: boolean }> = ({
  id,
  slug,
  trashed,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!trashed && !confirm("Move this brand to Trash?")) return;
    setLoading(true);
    try {
      if (trashed) await restoreBrand(id, slug);
      else await softDeleteBrand(id, slug);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      {!trashed && (
        <Link
          href={`/admin/brands/${id}/edit` as any}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          title="Edit brand"
        >
          <PencilSquareIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>Edit</span>
        </Link>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
          trashed
            ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100"
            : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100"
        }`}
        title={trashed ? "Restore brand" : "Move to trash"}
      >
        {trashed ? (
          <>
            <ArrowPathIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Restore</span>
          </>
        ) : (
          <>
            <TrashIcon className="w-3.5 h-3.5 text-rose-500" />
            <span>Delete</span>
          </>
        )}
      </button>
    </div>
  );
};

export default BrandRowActions;
