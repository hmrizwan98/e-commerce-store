"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { softDeleteProduct, restoreProduct, permanentlyDeleteProduct } from "./actions";

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

  return (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`text-sm font-medium ${trashed ? "text-green-600" : "text-red-600"} disabled:opacity-50`}
      >
        {loading ? "…" : trashed ? "Restore" : "Delete"}
      </button>
      {trashed && (
        <button
          onClick={handlePermanentDelete}
          disabled={loading}
          className="text-sm font-medium text-red-600 disabled:opacity-50"
        >
          Delete permanently
        </button>
      )}
    </div>
  );
};

export default ProductRowActions;
