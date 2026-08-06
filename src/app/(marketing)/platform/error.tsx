"use client";

import React from "react";
import Link from "next/link";

export default function PlatformError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-neutral-500 dark:text-neutral-400">Please try again, or head back to the homepage.</p>
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium"
        >
          Try again
        </button>
        <Link
          href={"/" as any}
          className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
