/**
 * Zero-dependency constant shared between middleware.ts (Edge runtime) and
 * src/lib/tenant/current.ts (Node runtime, server-only) - keep this file free
 * of any "server-only" or firebase-admin imports so middleware.ts stays Edge-safe.
 */
export const TENANT_SLUG_HEADER = "x-tenant-slug";
