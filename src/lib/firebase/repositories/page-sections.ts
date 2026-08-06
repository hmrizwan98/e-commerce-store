import "server-only";
import { tenantCollection } from "../tenant-scope";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { PageSection } from "@/types/page-section";

async function collection(pageId: string) {
  return (await tenantCollection("pages")).doc(pageId).collection("sections");
}

export async function getActivePageSections(pageId: string): Promise<PageSection[]> {
  return safeQuery("getActivePageSections", [], async () => {
    const snap = await (await collection(pageId)).where("isActive", "==", true).orderBy("order", "asc").get();
    return snap.docs
      .map((doc) => docData<PageSection>(doc))
      .filter((s): s is PageSection => s !== null);
  });
}

// --- Admin ---

export async function getAllPageSectionsForAdmin(pageId: string): Promise<PageSection[]> {
  const snap = await (await collection(pageId)).orderBy("order", "asc").get();
  return snap.docs
    .map((doc) => docData<PageSection>(doc))
    .filter((s): s is PageSection => s !== null);
}
