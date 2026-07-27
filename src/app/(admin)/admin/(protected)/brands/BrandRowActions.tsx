"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { softDeleteBrand, restoreBrand } from "./actions";

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
    <button
      onClick={handleClick}
      disabled={loading}
      className={`text-sm font-medium ${trashed ? "text-green-600" : "text-red-600"} disabled:opacity-50`}
    >
      {loading ? "…" : trashed ? "Restore" : "Delete"}
    </button>
  );
};

export default BrandRowActions;
