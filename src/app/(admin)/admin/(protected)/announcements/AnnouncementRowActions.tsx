"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAnnouncementBar } from "./actions";

const AnnouncementRowActions: React.FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this announcement bar?")) return;
    setLoading(true);
    try {
      await deleteAnnouncementBar(id);
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

export default AnnouncementRowActions;
