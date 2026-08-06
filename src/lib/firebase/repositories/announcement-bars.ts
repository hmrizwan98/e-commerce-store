import "server-only";
import { tenantCollection } from "../tenant-scope";
import { docData } from "./utils";
import type { AnnouncementBar } from "@/types/announcement-bar";

const COLLECTION = "announcementBars";

/** The single bar to render right now: highest-priority active bar whose date window (if any) covers now. */
export async function getActiveAnnouncementBar(): Promise<AnnouncementBar | null> {
  const snap = await (await tenantCollection(COLLECTION)).where("isActive", "==", true).get();
  const now = Date.now();

  const eligible = snap.docs
    .map((doc) => docData<AnnouncementBar>(doc))
    .filter((b): b is AnnouncementBar => b !== null)
    .filter((b) => (b.startDate ? b.startDate <= now : true))
    .filter((b) => (b.endDate ? b.endDate >= now : true));

  if (!eligible.length) return null;
  eligible.sort((a, b) => b.priority - a.priority);
  return eligible[0];
}

// --- Admin ---

export async function getAnnouncementBarById(id: string): Promise<AnnouncementBar | null> {
  const doc = await (await tenantCollection(COLLECTION)).doc(id).get();
  return docData<AnnouncementBar>(doc);
}

export async function getAllAnnouncementBarsForAdmin(): Promise<AnnouncementBar[]> {
  const snap = await (await tenantCollection(COLLECTION)).orderBy("priority", "desc").get();
  return snap.docs
    .map((doc) => docData<AnnouncementBar>(doc))
    .filter((b): b is AnnouncementBar => b !== null);
}
