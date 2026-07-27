import "server-only";
import { adminAuth } from "./admin";

const SESSION_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export async function createSessionCookie(idToken: string) {
  return adminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });
}

export async function verifySessionCookie(sessionCookie: string) {
  try {
    return await adminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

export function isAdminClaim(claims: Record<string, unknown> | null | undefined) {
  return claims?.role === "admin";
}
