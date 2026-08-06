import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/firebase/require-admin";
import { RETURN_SESSION_COOKIE } from "@/lib/firebase/impersonation";

const MAX_AGE_SECONDS = 5 * 24 * 60 * 60; // matches /api/admin/session's cookie lifetime

export async function POST() {
  const returnCookie = cookies().get(RETURN_SESSION_COOKIE)?.value;
  if (!returnCookie) {
    return NextResponse.json({ error: "No Super Admin session to return to" }, { status: 400 });
  }

  cookies().set(ADMIN_SESSION_COOKIE, returnCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
  cookies().set(RETURN_SESSION_COOKIE, "", { maxAge: 0, path: "/" });

  return NextResponse.json({ ok: true });
}
