import { NextResponse } from "next/server";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { getUnreadStoreNotificationSummary } from "@/lib/firebase/repositories/store-notifications";

export const dynamic = "force-dynamic";

const EMPTY = { pendingCount: 0, pendingIds: [], notifications: { count: 0, items: [] } };

/** The Store Admin shell's single poll: pending order ids (new-order chime + Orders badge)
 * and unread store notifications (bell badge + chime) - one request instead of two. */
export async function GET() {
  try {
    // Admin-only: without this anyone could list a store's pending order IDs. A missing/
    // invalid session throws (redirect) and lands in the catch -> empty result.
    const decoded = await requireAdmin();
    const ordersCol = await tenantCollection("orders");
    const [snap, notifications] = await Promise.all([
      ordersCol.where("orderStatus", "==", "pending").select("orderNumber").get(),
      // The session's own tenant - requireAdmin() already checked it matches this host's store.
      getUnreadStoreNotificationSummary(decoded.tenantId).catch(() => ({ count: 0, items: [] })),
    ]);
    const pendingIds = snap.docs.map((d) => d.id);

    return NextResponse.json({
      pendingCount: pendingIds.length,
      pendingIds,
      notifications,
    });
  } catch {
    return NextResponse.json(EMPTY, { status: 200 });
  }
}
