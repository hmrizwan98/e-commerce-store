import "server-only";
import type { QueryDocumentSnapshot, DocumentSnapshot } from "firebase-admin/firestore";

export function docData<T>(
  snap: DocumentSnapshot | QueryDocumentSnapshot
): (T & { id: string }) | null {
  if (!snap.exists) return null;
  const data = snap.data() as Record<string, unknown>;
  return {
    ...(data as T),
    id: snap.id,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  } as T & { id: string };
}

function toMillis(value: unknown): number | undefined {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis: () => number }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return typeof value === "number" ? value : undefined;
}

/**
 * The Admin SDK rejects literal `undefined` field values (ignoreUndefinedProperties
 * is off in this project) - recursively drop them before any .set()/.update()
 * built from optional-field input (e.g. `field: value || undefined`).
 *
 * Only pass plain data through this (not FieldValue sentinels like
 * serverTimestamp()/arrayUnion()) - add those to the object after stripping.
 */
export function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value !== null && typeof value === "object" && value.constructor === Object) {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val === undefined) continue;
      result[key] = stripUndefined(val);
    }
    return result as T;
  }
  return value;
}
