"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { softDeleteSupplier, restoreSupplier } from "./actions";

const SupplierRowActions: React.FC<{ id: string; trashed: boolean }> = ({ id, trashed }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!trashed && !confirm("Move this supplier to Trash?")) return;
    setLoading(true);
    try {
      if (trashed) await restoreSupplier(id);
      else await softDeleteSupplier(id);
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

export default SupplierRowActions;
