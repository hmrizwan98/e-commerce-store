"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deleteBlogPost } from "./actions";

const BlogPostRowActions: React.FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this blog post?")) return;
    setLoading(true);
    try {
      await deleteBlogPost(id);
      toast.success("Blog post deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm font-medium">
      <button onClick={handleDelete} disabled={loading} className="text-red-600 disabled:opacity-50">
        {loading ? "…" : "Delete"}
      </button>
    </div>
  );
};

export default BlogPostRowActions;
