import "server-only";
import { adminDb } from "../admin";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import { getCurrentTenant, requireCurrentTenant } from "@/lib/tenant/current";
import type { BlogPost } from "@/types/blog-post";

const COLLECTION = "blogPosts";

/** Root-level collection (not path-scoped under stores/{id}) - storeId is the tenant
 * boundary here, filtered on every read below. See BlogPost's storeId doc comment. */
export async function getActiveBlogPosts(limit?: number): Promise<BlogPost[]> {
  const tenant = await getCurrentTenant();
  if (!tenant) return [];
  return safeQuery("getActiveBlogPosts", [], async () => {
    let query: FirebaseFirestore.Query = adminDb()
      .collection(COLLECTION)
      .where("storeId", "==", tenant.id)
      .where("isActive", "==", true)
      .orderBy("publishedAt", "desc");
    if (limit) {
      query = query.limit(limit);
    }
    const snap = await query.get();
    return snap.docs
      .map((doc) => docData<BlogPost>(doc))
      .filter((p): p is BlogPost => p !== null);
  });
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;
  return safeQuery("getBlogPostBySlug", null, async () => {
    const snap = await adminDb()
      .collection(COLLECTION)
      .where("storeId", "==", tenant.id)
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return docData<BlogPost>(snap.docs[0]);
  });
}

// --- Admin ---

/** Returns null if the post doesn't exist OR belongs to a different tenant - callers
 * must treat both cases identically and never fall through to a raw doc(id) write. */
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const tenant = await requireCurrentTenant();
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  const post = docData<BlogPost>(doc);
  if (!post || post.storeId !== tenant.id) return null;
  return post;
}

export async function getAllBlogPostsForAdmin(): Promise<BlogPost[]> {
  const tenant = await requireCurrentTenant();
  return safeQuery("getAllBlogPostsForAdmin", [], async () => {
    const snap = await adminDb()
      .collection(COLLECTION)
      .where("storeId", "==", tenant.id)
      .orderBy("order", "asc")
      .get();
    return snap.docs
      .map((doc) => docData<BlogPost>(doc))
      .filter((p): p is BlogPost => p !== null);
  });
}
