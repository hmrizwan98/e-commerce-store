import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import { getCurrentTenant } from "@/lib/tenant/current";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (
    typeof body.sessionId !== "string" ||
    typeof body.visitorId !== "string" ||
    typeof body.path !== "string"
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const device = (body.device as Record<string, unknown>) ?? {};
  const geo = (body.geo as Record<string, unknown>) ?? {};
  const tenant = await getCurrentTenant();

  await adminDb()
    .collection("activeSessions")
    .doc(body.sessionId)
    .set(
      stripUndefined({
        sessionId: body.sessionId,
        visitorId: body.visitorId,
        storeId: tenant?.id,
        path: body.path,
        device: {
          type: device.type === "mobile" || device.type === "tablet" ? device.type : "desktop",
          browser: typeof device.browser === "string" ? device.browser : "Unknown",
          os: typeof device.os === "string" ? device.os : "Unknown",
        },
        geo: {
          country: typeof geo.country === "string" ? geo.country : "Unknown",
          city: typeof geo.city === "string" ? geo.city : "Unknown",
          region: typeof geo.region === "string" ? geo.region : "Unknown",
        },
        referrer: typeof body.referrer === "string" ? body.referrer : undefined,
        lastSeenAt: Date.now(),
      }),
      { merge: true }
    );

  return NextResponse.json({ ok: true });
}
