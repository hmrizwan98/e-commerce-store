import "server-only";
import { adminDb, serverTimestamp } from "./admin";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const MAX_ATTEMPTS: Record<string, number> = {
  login: 10,
  "superadmin-sensitive": 20,
};

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

/**
 * Fixed-window rate limiter backed by a single Firestore doc per bucket+key,
 * updated inside a transaction so concurrent requests can't race past the
 * limit. Not tenant-scoped - this is an abuse guard, not tenant data, so it
 * lives in a top-level `rateLimits` collection (Admin SDK only, denied to
 * clients in firestore.rules).
 */
export async function checkRateLimit(bucket: string, key: string): Promise<RateLimitResult> {
  const max = MAX_ATTEMPTS[bucket] ?? 10;
  const id = `${bucket}:${key}`.replace(/[/]/g, "_");
  const ref = adminDb().collection("rateLimits").doc(id);
  const now = Date.now();

  return adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data() as { windowStart?: number; count?: number } | undefined;
    const windowStart = data?.windowStart ?? 0;

    if (now - windowStart > WINDOW_MS) {
      tx.set(ref, { windowStart: now, count: 1, updatedAt: serverTimestamp() });
      return { allowed: true };
    }

    const count = (data?.count ?? 0) + 1;
    if (count > max) {
      return { allowed: false, retryAfterSeconds: Math.ceil((windowStart + WINDOW_MS - now) / 1000) };
    }

    tx.set(ref, { windowStart, count, updatedAt: serverTimestamp() }, { merge: true });
    return { allowed: true };
  });
}
