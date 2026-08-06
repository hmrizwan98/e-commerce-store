import "server-only";
import { cookies } from "next/headers";
import { verifySessionCookie } from "./admin-auth";
import { ADMIN_SESSION_COOKIE } from "./require-admin";

/**
 * Super admins aren't scoped to a tenant (no tenantId claim, no getCurrentTenant()
 * check) - they operate on the reserved Super Admin subdomain, gated purely by
 * the `role: "superadmin"` custom claim. Same session-cookie mechanism as
 * requireAdmin(), just a different role check.
 */
export async function requireSuperAdmin() {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) {
    throw new Error("Unauthorized: no admin session");
  }
  const decoded = await verifySessionCookie(sessionCookie);
  const role = decoded?.role;
  if (!decoded || (role !== "superadmin" && role !== "super_admin")) {
    throw new Error("Unauthorized: not a super admin");
  }
  return decoded;
}
