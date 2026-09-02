import { NextResponse } from "next/server";
import { getActiveAnnouncementBar } from "@/lib/firebase/repositories/announcement-bars";

export const dynamic = "force-dynamic";

// Public - the currently-active announcement bar (or null), used by the
// storefront's client-rendered root layout.
export async function GET() {
  try {
    const bar = await getActiveAnnouncementBar();
    return NextResponse.json({ bar });
  } catch (error) {
    return NextResponse.json({ bar: null });
  }
}
