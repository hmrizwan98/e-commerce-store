import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { verifySessionCookie } from "@/lib/firebase/admin-auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/firebase/require-admin";
import { RETURN_SESSION_COOKIE } from "@/lib/firebase/impersonation";
import { isSuperAdminRole } from "@/types/role";
import { getStoreById } from "@/lib/firebase/repositories/stores";
import { logStoreActivity } from "@/lib/firebase/repositories/store-activity-logs";

const RETURN_MAX_AGE_SECONDS = 30 * 60; // 30 minutes

/** Mints a Firebase custom token for a store's admin Auth user so the Super Admin can sign
 * in as them client-side (via signInWithCustomToken + the existing /api/admin/session route) -
 * no new session mechanism, just a different way to obtain the ID token that route already
 * expects. The Super Admin's own session is stashed in a short-lived cookie first so
 * "Return to Super Admin" can restore it. */
export async function POST(req: NextRequest) {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const decoded = sessionCookie ? await verifySessionCookie(sessionCookie) : null;
  if (!decoded || !isSuperAdminRole(decoded.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storeId } = await req.json();
  if (!storeId || typeof storeId !== "string") {
    return NextResponse.json({ error: "Missing storeId" }, { status: 400 });
  }

  const store = await getStoreById(storeId);
  if (!store?.email) {
    return NextResponse.json({ error: "This store has no admin account to log in as." }, { status: 404 });
  }

  const userRecord = await adminAuth().getUserByEmail(store.email);
  const customToken = await adminAuth().createCustomToken(userRecord.uid, { impersonatedBy: decoded.uid });

  cookies().set(RETURN_SESSION_COOKIE, sessionCookie!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: RETURN_MAX_AGE_SECONDS,
    path: "/",
  });

  await logStoreActivity(storeId, "impersonated", decoded.uid);

  return NextResponse.json({ customToken });
}
