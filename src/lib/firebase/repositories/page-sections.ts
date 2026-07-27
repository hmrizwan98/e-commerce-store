import "server-only";
import { adminDb } from "../admin";
import { docData } from "./utils";
import type { PageSection } from "@/types/page-section";

function collection(pageId: string) {
  return adminDb().collection("pages").doc(pageId).collection("sections");
}

export async function getActivePageSections(pageId: string): Promise<PageSection[]> {
  const snap = await collection(pageId).where("isActive", "==", true).orderBy("order", "asc").get();
  return snap.docs
    .map((doc) => docData<PageSection>(doc))
    .filter((s): s is PageSection => s !== null);
}

// --- Admin ---

export async function getAllPageSectionsForAdmin(pageId: string): Promise<PageSection[]> {
  const snap = await collection(pageId).orderBy("order", "asc").get();
  return snap.docs
    .map((doc) => docData<PageSection>(doc))
    .filter((s): s is PageSection => s !== null);
}
