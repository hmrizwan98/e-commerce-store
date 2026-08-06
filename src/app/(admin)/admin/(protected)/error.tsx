"use client";

import React from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-neutral-500">Please try again, or come back later.</p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium"
      >
        Try again
      </button>
    </div>
  );
}
