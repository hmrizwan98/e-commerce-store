"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { approveReview, rejectReview, deleteReview } from "./actions";

const ReviewRowActions: React.FC<{ id: string; productId: string; status: string }> = ({
  id,
  productId,
  status,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3 text-sm font-medium">
      {status !== "approved" && (
        <button disabled={loading} onClick={() => run(() => approveReview(id, productId))} className="text-green-600">
          Approve
        </button>
      )}
      {status !== "rejected" && (
        <button disabled={loading} onClick={() => run(() => rejectReview(id, productId))} className="text-amber-600">
          Reject
        </button>
      )}
      <button
        disabled={loading}
        onClick={() => {
          if (confirm("Delete this review permanently?")) run(() => deleteReview(id, productId));
        }}
        className="text-red-600"
      >
        Delete
      </button>
    </div>
  );
};

export default ReviewRowActions;
