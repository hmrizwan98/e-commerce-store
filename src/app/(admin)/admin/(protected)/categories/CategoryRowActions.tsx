"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { softDeleteCategory, restoreCategory } from "./actions";

const CategoryRowActions: React.FC<{ id: string; slug?: string; trashed: boolean }> = ({
  id,
  slug,
  trashed,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!trashed && !confirm("Move this category to Trash?")) return;
    setLoading(true);
    try {
      if (trashed) await restoreCategory(id, slug);
      else await softDeleteCategory(id, slug);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`text-sm font-medium ${trashed ? "text-green-600" : "text-red-600"} disabled:opacity-50`}
    >
      {loading ? "…" : trashed ? "Restore" : "Delete"}
    </button>
  );
};

export default CategoryRowActions;
