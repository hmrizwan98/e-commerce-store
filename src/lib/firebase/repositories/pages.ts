import "server-only";
import { tenantCollection } from "../tenant-scope";
import { docData } from "./utils";
import type { CmsPage } from "@/types/page";

const COLLECTION = "pages";

export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  const snap = await (await tenantCollection(COLLECTION)).where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const page = docData<CmsPage>(snap.docs[0]);
  if (!page || !page.isActive) return null;
  return page;
}

// --- Admin ---

export async function getPageById(id: string): Promise<CmsPage | null> {
  const doc = await (await tenantCollection(COLLECTION)).doc(id).get();
  return docData<CmsPage>(doc);
}

export async function getAllPagesForAdmin(): Promise<CmsPage[]> {
  const snap = await (await tenantCollection(COLLECTION)).orderBy("title", "asc").get();
  return snap.docs.map((doc) => docData<CmsPage>(doc)).filter((p): p is CmsPage => p !== null);
}
