/**
 * Full role vocabulary for the platform. Only "super_admin" and "admin" are
 * enforced today (see the guard helpers below) - "manager"/"staff"/"customer"
 * are reserved for later phases and carry no permission logic yet.
 */
export type Role = "super_admin" | "admin" | "manager" | "staff" | "customer";

/** Mirrors the exact string set require-super-admin.ts/superadmin layout already accept. */
export function isSuperAdminRole(role: unknown): boolean {
  return role === "superadmin" || role === "super_admin";
}

/** Mirrors the exact check admin-auth.ts's isAdminClaim() already performs. */
export function isAdminRole(role: unknown): boolean {
  return role === "admin";
}
