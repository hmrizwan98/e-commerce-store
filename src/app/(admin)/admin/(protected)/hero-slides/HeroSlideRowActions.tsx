"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deleteHeroSlide, duplicateHeroSlide } from "./actions";

const HeroSlideRowActions: React.FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const [loading, setLoading] = useState<"delete" | "duplicate" | null>(null);

  const handleDuplicate = async () => {
    setLoading("duplicate");
    try {
      await duplicateHeroSlide(id);
      toast.success("Hero slide duplicated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to duplicate");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this hero slide?")) return;
    setLoading("delete");
    try {
      await deleteHeroSlide(id);
      toast.success("Hero slide deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
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

export default HeroSlideRowActions;
