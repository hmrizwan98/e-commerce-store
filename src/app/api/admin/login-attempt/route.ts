import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/firebase/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ allowed: false, error: "Missing email" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const result = await checkRateLimit("login", `${ip}:${email.trim().toLowerCase()}`);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[admin/login-attempt] failed:", err);
    return NextResponse.json({ allowed: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
