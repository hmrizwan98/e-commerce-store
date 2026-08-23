import { NextResponse } from "next/server";
import { tenantCollection } from "@/lib/firebase/tenant-scope";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
