import "server-only";
import { cookies } from "next/headers";
import { verifySessionCookie, isAdminClaim } from "./admin-auth";

export const ADMIN_SESSION_COOKIE = "admin_session";

/**
 * Called at the top of every admin Server Action. Defense-in-depth alongside
 * firestore.rules' isAdmin() check (the real security boundary) and the
 * (protected) layout guard (the UX boundary) - this stops a stale/forged
 * request from mutating data even if it somehow reaches the action.
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
  return decoded;
}
