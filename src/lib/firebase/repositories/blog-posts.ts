import "server-only";
import { FieldPath } from "firebase-admin/firestore";
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

export interface BlogPostsPageCursor {
  order: number;
  id: string;
}

export interface BlogPostsPage {
  posts: BlogPost[];
  hasMore: boolean;
}

/**
 * Cursor-paginated - `order` is admin-set and defaults to 0 for every new post, so ties are
 * the common case here (not an edge case), unlike a createdAt-millis cursor elsewhere in
 * this codebase. Ordering explicitly by document ID as a tiebreaker (Firestore already
 * appends `__name__` as an implicit final sort/index component to every query, so this
 * doesn't change what the existing `{storeId, order}` index supports) makes the cursor
 * stable: startAfter(order, id) can't skip or duplicate posts that share the same `order`
 * value. Cursors by these two plain, URL-safe values instead of a DocumentSnapshot, which
 * can't be serialized across a Server Component page's searchParams boundary. Fetches
 * `limit + 1` docs so hasMore is known from this same single query - no count query, no
 * offset(), no full-collection read.
 */
export async function getBlogPostsPageForAdmin(opts?: {
  limit?: number;
  startAfter?: BlogPostsPageCursor;
}): Promise<BlogPostsPage> {
  const tenant = await requireCurrentTenant();
  return safeQuery("getBlogPostsPageForAdmin", { posts: [], hasMore: false }, async () => {
    const limit = opts?.limit ?? 20;
    let query: FirebaseFirestore.Query = adminDb()
      .collection(COLLECTION)
      .where("storeId", "==", tenant.id)
      .orderBy("order", "asc")
      .orderBy(FieldPath.documentId(), "asc");
    if (opts?.startAfter) {
      query = query.startAfter(opts.startAfter.order, opts.startAfter.id);
    }
    const snap = await query.limit(limit + 1).get();
    const posts = snap.docs
      .slice(0, limit)
      .map((doc) => docData<BlogPost>(doc))
      .filter((p): p is BlogPost => p !== null);
    return { posts, hasMore: snap.docs.length > limit };
  });
}
