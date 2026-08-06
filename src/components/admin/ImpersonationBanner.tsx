"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

/** Shown only when a superadmin_return_session cookie is present (see (admin)/admin/(protected)/layout.tsx) -
 * purely additive, doesn't affect any existing admin gating logic. */
export default function ImpersonationBanner() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReturn = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/impersonate/return", { method: "POST" });
      router.push("/superadmin" as any);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-500 text-white text-sm px-4 py-2 flex items-center justify-between gap-4">
      <span>Viewing as Store Owner</span>
      <button
        type="button"
        onClick={handleReturn}
        disabled={loading}
        className="font-medium underline disabled:opacity-50"
      >
        Return to Super Admin
      </button>
    </div>
  );
}
