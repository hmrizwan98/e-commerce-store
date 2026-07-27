"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePage, duplicatePage } from "./actions";

const PageRowActions: React.FC<{ id: string; slug: string }> = ({ id, slug }) => {
  const router = useRouter();
  const [loading, setLoading] = useState<"delete" | "duplicate" | null>(null);

  const handleDelete = async () => {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    setLoading("delete");
    try {
      await deletePage(id, slug);
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
    <div className="flex items-center gap-3 text-sm font-medium">
      <button onClick={handleDuplicate} disabled={loading !== null} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 disabled:opacity-50">
        {loading === "duplicate" ? "…" : "Duplicate"}
      </button>
      <button onClick={handleDelete} disabled={loading !== null} className="text-red-600 disabled:opacity-50">
        {loading === "delete" ? "…" : "Delete"}
      </button>
    </div>
  );
};

export default PageRowActions;
