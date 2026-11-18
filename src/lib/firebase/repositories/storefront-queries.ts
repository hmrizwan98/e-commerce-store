import "server-only";
import type { Firestore } from "firebase-admin/firestore";
import { docData } from "./utils";
import { isPublicBlogPost } from "@/lib/blog/visibility";
import { isPublicTestimonial } from "@/lib/testimonials/seed";
import { isBannerLive } from "@/lib/banners/schedule";
import type { BlogPost } from "@/types/blog-post";
import type { Testimonial } from "@/types/testimonial";
import type { CmsPage } from "@/types/page";
import type { Banner, BannerPlacement } from "@/types/banner";

/**
 * The public storefront's content queries, with the store id passed in explicitly (the
 * tenant-scoped repository functions call these with the current store). Shared with the
 * emulator tests, so the exact same code is tested. Every result is re-checked against the
 * store id and the visibility rules.
 */

/** Published blog posts of one store (Active + published date reached), newest first. */
export async function queryPublicBlogPosts(db: Firestore, storeId: string, limit?: number, now = Date.now()): Promise<BlogPost[]> {
  if (!storeId) return [];
  let q: FirebaseFirestore.Query = db
    .collection("blogPosts")
    .where("storeId", "==", storeId)
    .where("isActive", "==", true)
    // Date filter in the query (not only after it), so a future-dated post can't use up the
    // limit and hide published ones. Same index as before: storeId + isActive + publishedAt desc.
    .where("publishedAt", "<=", now)
    .orderBy("publishedAt", "desc");
  if (limit) q = q.limit(limit);
  const snap = await q.get();
  return snap.docs
    .map((d) => docData<BlogPost>(d))
    .filter((p): p is BlogPost => p !== null && p.storeId === storeId && isPublicBlogPost(p, now));
}

export async function queryPublicBlogPostBySlug(db: Firestore, storeId: string, slug: string, now = Date.now()): Promise<BlogPost | null> {
  if (!storeId || !slug) return null;
  const snap = await db.collection("blogPosts").where("storeId", "==", storeId).where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const post = docData<BlogPost>(snap.docs[0]);
  return post && post.storeId === storeId && isPublicBlogPost(post, now) ? post : null;
}

/** Active testimonials of one store, without unchanged installer samples. */
export async function queryPublicTestimonials(db: Firestore, storeId: string): Promise<Testimonial[]> {
  if (!storeId) return [];
  const snap = await db.collection("stores").doc(storeId).collection("testimonials").where("isActive", "==", true).orderBy("order", "asc").get();
  return snap.docs.map((d) => docData<Testimonial>(d)).filter((t): t is Testimonial => t !== null && isPublicTestimonial(t));
}

/** A published CMS page of one store by slug (e.g. "about"), or null. */
export async function queryPublishedPageBySlug(db: Firestore, storeId: string, slug: string): Promise<CmsPage | null> {
  if (!storeId || !slug) return null;
  const snap = await db.collection("stores").doc(storeId).collection("pages").where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const page = docData<CmsPage>(snap.docs[0]);
  return page && page.isActive ? page : null;
}

/** Live (Active + inside its schedule) banners of one store in a placement, by order. */
export async function queryLiveBanners(db: Firestore, storeId: string, placement: BannerPlacement, now = Date.now()): Promise<Banner[]> {
  if (!storeId) return [];
  const snap = await db
    .collection("stores")
    .doc(storeId)
    .collection("banners")
    .where("placement", "==", placement)
    .where("isActive", "==", true)
    .orderBy("order", "asc")
    .get();
  return snap.docs.map((d) => docData<Banner>(d)).filter((b): b is Banner => b !== null && isBannerLive(b, now));
}
