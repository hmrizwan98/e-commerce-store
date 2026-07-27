"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteFaq } from "./actions";

const FaqRowActions: React.FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this FAQ?")) return;
    setLoading(true);
    try {
      await deleteFaq(id);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="text-sm font-medium text-red-600 disabled:opacity-50">
      {loading ? "…" : "Delete"}
    </button>
  );
};

export default FaqRowActions;
