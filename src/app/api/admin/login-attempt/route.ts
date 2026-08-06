import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/firebase/rate-limit";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const result = await checkRateLimit("login", `${ip}:${email.trim().toLowerCase()}`);

  return NextResponse.json(result);
}
