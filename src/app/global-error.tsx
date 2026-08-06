"use client";

import React from "react";

/**
 * Only fires when the root layout itself throws (e.g. tenant resolution or
 * theme/settings fetch failing) - Next.js requires this to render its own
 * <html>/<body> since it fully replaces the root layout in that case.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-neutral-500">Please try again, or come back later.</p>
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
