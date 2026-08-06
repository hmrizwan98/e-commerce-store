import "server-only";

/**
 * Wraps a Firestore query so a missing or still-building composite index
 * (FAILED_PRECONDITION) never crashes the calling page - logs the error and
 * returns the given fallback instead, so the caller renders its existing
 * empty state rather than throwing past the repository layer. Every other
 * error (permission-denied, network, etc.) is rethrown untouched - only the
 * specific "missing index" failure mode is safe to silently recover from.
 */
export async function safeQuery<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (isMissingIndexError(err)) {
      console.error(`[safeQuery] "${label}" - Firestore composite index missing or still building, returning fallback.`, err);
      return fallback;
    }
    throw err;
  }
}

function isMissingIndexError(err: unknown): boolean {
  const code = (err as { code?: unknown } | null)?.code;
  const message = (err as { message?: unknown } | null)?.message;
  if (code === 9 || code === "failed-precondition") return true; // gRPC FAILED_PRECONDITION
  return typeof message === "string" && /FAILED_PRECONDITION|requires an index/i.test(message);
}
