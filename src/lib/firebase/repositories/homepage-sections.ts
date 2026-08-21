import "server-only";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { HomepageSection } from "@/types/homepage-section";

const COLLECTION = "homepageSections";

export async function getActiveHomepageSections(): Promise<HomepageSection[]> {
  return safeQuery("getActiveHomepageSections", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col.where("isActive", "==", true).orderBy("order", "asc").get();

    return snap.docs
      .map((doc) => docData<HomepageSection>(doc))
      .filter((s): s is HomepageSection => s !== null);
  });
}

export async function getAllHomepageSectionsForAdmin(): Promise<HomepageSection[]> {
  const col = await tenantCollection(COLLECTION);
  const snap = await col.orderBy("order", "asc").get();

  return snap.docs
    .map((doc) => docData<HomepageSection>(doc))
    .filter((s): s is HomepageSection => s !== null);
}

export async function getHomepageSectionById(id: string): Promise<HomepageSection | null> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc(id).get();
  return docData<HomepageSection>(doc);
}
