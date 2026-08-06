"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { softDeleteCollection, restoreCollection } from "./actions";

const CollectionRowActions: React.FC<{ id: string; trashed: boolean }> = ({ id, trashed }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!trashed && !confirm("Move this collection to Trash?")) return;
    setLoading(true);
    try {
      if (trashed) await restoreCollection(id);
      else await softDeleteCollection(id);
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

export default CollectionRowActions;
