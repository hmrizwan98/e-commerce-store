"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deleteTestimonial, duplicateTestimonial } from "./actions";

const TestimonialRowActions: React.FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const [loading, setLoading] = useState<"delete" | "duplicate" | null>(null);

  const handleDuplicate = async () => {
    setLoading("duplicate");
    try {
      await duplicateTestimonial(id);
      toast.success("Testimonial duplicated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to duplicate");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this testimonial?")) return;
    setLoading("delete");
    try {
      await deleteTestimonial(id);
      toast.success("Testimonial deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm font-medium">
      <button
        onClick={handleDuplicate}
        disabled={loading !== null}
        className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 disabled:opacity-50"
      >
        {loading === "duplicate" ? "…" : "Duplicate"}
      </button>
      <button onClick={handleDelete} disabled={loading !== null} className="text-red-600 disabled:opacity-50">
        {loading === "delete" ? "…" : "Delete"}
      </button>
    </div>
  );
};

export default TestimonialRowActions;
