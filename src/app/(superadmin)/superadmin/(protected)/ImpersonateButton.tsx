"use client";

import React, { useState } from "react";
import { signInWithCustomToken } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import toast from "react-hot-toast";

/** Mirrors LoginForm.tsx's own sign-in -> ID token -> POST /api/admin/session flow exactly,
 * just obtaining the ID token via a custom token (see /api/admin/impersonate/start) instead
 * of a password. */
const ImpersonateButton: React.FC<{ storeId: string; slug: string }> = ({ storeId, slug }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const startRes = await fetch("/api/admin/impersonate/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      if (!startRes.ok) {
        const body = await startRes.json().catch(() => ({}));
        throw new Error(body.error || "Failed to start impersonation");
      }
      const { customToken } = await startRes.json();

      const credential = await signInWithCustomToken(getFirebaseAuth(), customToken);
      const idToken = await credential.user.getIdToken(true);

      const sessionRes = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!sessionRes.ok) throw new Error("Failed to establish session");

      // TEMPORARY (Phase 8A) - on the single Vercel domain in use today (no
      // wildcard subdomain DNS yet), a bare "/admin" resolves whichever
      // tenant the host happens to resolve to, not necessarily the store
      // just impersonated - the /frontstore/{slug}/admin preview path
      // resolves tenant from the URL instead, so this always lands on the
      // right store's admin regardless of host-based resolution.
      window.location.href = `/store/${slug}/admin`;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log in as store owner");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium disabled:opacity-50"
    >
      {loading ? "Logging in…" : "Login as Store Owner"}
    </button>
  );
};

export default ImpersonateButton;
