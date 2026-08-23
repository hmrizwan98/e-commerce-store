"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePage, duplicatePage } from "./actions";
import { DocumentDuplicateIcon, TrashIcon } from "@heroicons/react/24/outline";

const PageRowActions: React.FC<{ id: string; slug: string }> = ({ id }) => {
  const router = useRouter();
  const [loading, setLoading] = useState<"delete" | "duplicate" | null>(null);

  const handleDelete = async () => {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    setLoading("delete");
    try {
      await deletePage(id, id);
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const handleDuplicate = async () => {
    setLoading("duplicate");
    try {
      const newId = await duplicatePage(id);
      router.push(`/admin/pages/${newId}/edit`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleDuplicate}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        title="Duplicate page"
      >
        <DocumentDuplicateIcon className="w-3.5 h-3.5 text-slate-500" />
        <span>Duplicate</span>
      </button>

      <button
        onClick={handleDelete}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 transition-colors disabled:opacity-50"
        title="Delete page"
      >
        <TrashIcon className="w-3.5 h-3.5 text-rose-500" />
        <span>Delete</span>
      </button>
    </div>
  );
};

export default PageRowActions;
