import "server-only";
import { adminDb } from "../admin";
import { docData } from "./utils";
import type { BlogPost } from "@/types/blog-post";

const COLLECTION = "blogPosts";

export async function getActiveBlogPosts(limit?: number): Promise<BlogPost[]> {
  let query: FirebaseFirestore.Query = adminDb()
    .collection(COLLECTION)
    .where("isActive", "==", true)
    .orderBy("publishedAt", "desc");
  if (limit) {
    query = query.limit(limit);
  }
  const snap = await query.get();
  return snap.docs
    .map((doc) => docData<BlogPost>(doc))
    .filter((p): p is BlogPost => p !== null);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const snap = await adminDb().collection(COLLECTION).where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  return docData<BlogPost>(snap.docs[0]);
}

// --- Admin ---

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  return docData<BlogPost>(doc);
}

export async function getAllBlogPostsForAdmin(): Promise<BlogPost[]> {
  const snap = await adminDb().collection(COLLECTION).orderBy("order", "asc").get();
  return snap.docs
    .map((doc) => docData<BlogPost>(doc))
    .filter((p): p is BlogPost => p !== null);
}
