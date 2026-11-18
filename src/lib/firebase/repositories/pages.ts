import "server-only";
import { tenantCollection } from "../tenant-scope";
import { docData } from "./utils";
import type { CmsPage } from "@/types/page";
import { queryPublishedPageBySlug } from "./storefront-queries";
import { adminDb } from "../admin";
import { requireCurrentTenant } from "@/lib/tenant/current";

const COLLECTION = "pages";

export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  const tenant = await requireCurrentTenant();
  return queryPublishedPageBySlug(adminDb(), tenant.id, slug);
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
