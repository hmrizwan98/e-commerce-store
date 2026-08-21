/**
 * Zero-dependency constant shared between middleware.ts (Edge runtime) and
 * src/lib/tenant/current.ts (Node runtime, server-only) - keep this file free
 * of any "server-only" or firebase-admin imports so middleware.ts stays Edge-safe.
 */
export const TENANT_SLUG_HEADER = "x-tenant-slug";

/**
 * TEMPORARY / PREVIEW SIGNAL - set by middleware.ts only inside the /store/{slug}
 * or /frontstore/{slug} path preview branches, read by layout.tsx to distinguish
 * "no tenant because this is the platform's own marketing domain" (existing behavior)
 * from "no tenant because this specific /store/{slug} names an unknown store" (should 404).
 */
export const FRONTSTORE_PREVIEW_HEADER = "x-frontstore-preview";

/** Cookie recording which tenant a developer/tester is currently previewing via /store/{slug},
 * so plain internal links can be transparently redirected back under the correct prefix. */
export const FRONTSTORE_COOKIE = "frontstore_tenant";

