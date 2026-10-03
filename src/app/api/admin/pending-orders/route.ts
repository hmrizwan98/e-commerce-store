import { NextResponse } from "next/server";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Admin-only: without this anyone could list a store's pending order IDs. A missing/
    // invalid session throws (redirect) and lands in the catch -> empty result.
    await requireAdmin();
    const ordersCol = await tenantCollection("orders");
    const snap = await ordersCol.where("orderStatus", "==", "pending").select("orderNumber").get();
    const pendingIds = snap.docs.map((d) => d.id);
    
    return NextResponse.json({
      pendingCount: pendingIds.length,
      pendingIds,
    });
  } catch (err: any) {
    return NextResponse.json({ pendingCount: 0, pendingIds: [] }, { status: 200 });
  }
}
