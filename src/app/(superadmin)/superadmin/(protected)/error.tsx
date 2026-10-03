"use client";

import React, { useEffect } from "react";

export default function SuperAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SuperAdminError]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Something went wrong</h1>
      <p className="text-neutral-500 max-w-md text-sm">
        {error?.message || "Please try again, or come back later."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-5 py-2.5 rounded-full bg-primary-6000 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

