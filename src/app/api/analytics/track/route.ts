import { NextRequest, NextResponse } from "next/server";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import { getCurrentTenant } from "@/lib/tenant/current";
import type { AnalyticsEventType } from "@/types/analytics-event";

const VALID_TYPES: AnalyticsEventType[] = [
  "page_view",
  "product_view",
  "product_click",
  "category_view",
  "brand_view",
  "search",
  "wishlist_add",
  "wishlist_remove",
  "compare_add",
  "compare_remove",
  "add_to_cart",
  "remove_from_cart",
  "checkout_start",
  "payment_success",
  "order_success",
  "newsletter_signup",
  "not_found",
];

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (
    !body ||
    typeof body.type !== "string" ||
    !VALID_TYPES.includes(body.type as AnalyticsEventType) ||
    typeof body.sessionId !== "string" ||
    typeof body.visitorId !== "string" ||
    typeof body.path !== "string"
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const device = (body.device as Record<string, unknown>) ?? {};
  const geo = (body.geo as Record<string, unknown>) ?? {};
  const tenant = await getCurrentTenant();

  const event = stripUndefined({
    storeId: tenant?.id,
    type: body.type,
    sessionId: body.sessionId,
    visitorId: body.visitorId,
    path: body.path,
    referrer: typeof body.referrer === "string" ? body.referrer : undefined,
    utmSource: typeof body.utmSource === "string" ? body.utmSource : undefined,
    utmMedium: typeof body.utmMedium === "string" ? body.utmMedium : undefined,
    productId: typeof body.productId === "string" ? body.productId : undefined,
    categoryId: typeof body.categoryId === "string" ? body.categoryId : undefined,
    brandId: typeof body.brandId === "string" ? body.brandId : undefined,
    searchQuery: typeof body.searchQuery === "string" ? body.searchQuery : undefined,
    value: typeof body.value === "number" ? body.value : undefined,
    device: {
      type: device.type === "mobile" || device.type === "tablet" ? device.type : "desktop",
      browser: typeof device.browser === "string" ? device.browser : "Unknown",
      os: typeof device.os === "string" ? device.os : "Unknown",
      screenWidth: typeof device.screenWidth === "number" ? device.screenWidth : undefined,
      screenHeight: typeof device.screenHeight === "number" ? device.screenHeight : undefined,
    },
    geo: {
      country: typeof geo.country === "string" ? geo.country : "Unknown",
      city: typeof geo.city === "string" ? geo.city : "Unknown",
      region: typeof geo.region === "string" ? geo.region : "Unknown",
      language: typeof geo.language === "string" ? geo.language : undefined,
      timezone: typeof geo.timezone === "string" ? geo.timezone : undefined,
    },
  });

  const db = adminDb();
  const now = Date.now();
  const visitorRef = db.collection("visitors").doc(body.visitorId as string);

  await Promise.all([
    db.collection("analyticsEvents").add({ ...event, createdAt: serverTimestamp() }),
    db
      .collection("activeSessions")
      .doc(body.sessionId)
      .set(
        stripUndefined({
          sessionId: body.sessionId,
          visitorId: body.visitorId,
          storeId: tenant?.id,
          path: body.path,
          device: event.device,
          geo: event.geo,
          referrer: event.referrer,
          lastSeenAt: now,
        }),
        { merge: true }
      ),
    visitorRef.get().then((doc) =>
      doc.exists
        ? visitorRef.set({ lastSeenAt: now }, { merge: true })
        : visitorRef.set(
            stripUndefined({ visitorId: body.visitorId, storeId: tenant?.id, firstSeenAt: now, lastSeenAt: now })
          )
    ),
  ]);

  return NextResponse.json({ ok: true });
}
