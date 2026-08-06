import "server-only";
import { cookies } from "next/headers";
import { verifySessionCookie, isAdminClaim } from "./admin-auth";
import { requireCurrentTenant } from "@/lib/tenant/current";

export const ADMIN_SESSION_COOKIE = "admin_session";

/**
 * Called at the top of every admin Server Action. Defense-in-depth alongside
 * firestore.rules' isAdmin() check (the real security boundary) and the
 * (protected) layout guard (the UX boundary) - this stops a stale/forged
 * request from mutating data even if it somehow reaches the action.
 *
 * Also cross-checks the admin's tenantId claim against the subdomain the
 * request actually arrived on (resolved by middleware.ts) - this is what
 * stops a store-admin session from acting on a different store's data even
 * if the same browser has visited multiple tenant subdomains.
 */
export async function requireAdmin() {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) {
    throw new Error("Unauthorized: no admin session");
  }
  const decoded = await verifySessionCookie(sessionCookie);
  if (!decoded || !isAdminClaim(decoded)) {
    throw new Error("Unauthorized: not an admin");
  }

  const tenant = await requireCurrentTenant();
  if (decoded.tenantId !== tenant.id) {
    throw new Error("Unauthorized: admin does not belong to this store");
  }

  return decoded as typeof decoded & { tenantId: string };
}
