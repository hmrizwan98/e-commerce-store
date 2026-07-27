import "server-only";
import { adminDb } from "../admin";
import { docData } from "./utils";
import type { HomepageSection } from "@/types/homepage-section";

const COLLECTION = "homepageSections";

export async function getActiveHomepageSections(): Promise<HomepageSection[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("isActive", "==", true)
    .orderBy("order", "asc")
    .get();

  return snap.docs
    .map((doc) => docData<HomepageSection>(doc))
    .filter((s): s is HomepageSection => s !== null);
}

export async function getAllHomepageSectionsForAdmin(): Promise<HomepageSection[]> {
  const snap = await adminDb().collection(COLLECTION).orderBy("order", "asc").get();
  return snap.docs
    .map((doc) => docData<HomepageSection>(doc))
    .filter((s): s is HomepageSection => s !== null);
}

export async function getHomepageSectionById(id: string): Promise<HomepageSection | null> {
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  return docData<HomepageSection>(doc);
}
