import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionCookie } from "@/lib/firebase/admin-auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/firebase/require-admin";

const MAX_AGE_SECONDS = 5 * 24 * 60 * 60; // 5 days

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();
  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  try {
    const sessionCookie = await createSessionCookie(idToken);
    cookies().set(ADMIN_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE_SECONDS,
      path: "/",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
  }
}

export async function DELETE() {
  cookies().set(ADMIN_SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return NextResponse.json({ ok: true });
}
