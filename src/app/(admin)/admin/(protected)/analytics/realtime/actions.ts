"use server";

import { requireAdmin } from "@/lib/firebase/require-admin";
import { getRealtimeActiveSessions, type RealtimeSession } from "@/lib/firebase/repositories/analytics";

export async function fetchRealtimeSessions(): Promise<RealtimeSession[]> {
  await requireAdmin();
  return getRealtimeActiveSessions();
}
