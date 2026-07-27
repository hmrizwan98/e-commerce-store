"use server";

import { revalidatePath } from "next/cache";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import { getBlogPostById } from "@/lib/firebase/repositories/blog-posts";
import { deleteImagesByUrls, diffRemovedImages } from "@/lib/images/cleanup";

export interface BlogPostFormInput {
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImage: string;
  publishedAt: number;
  isActive: boolean;
  order: number;
  seoTitle?: string;
  seoDescription?: string;
}

function revalidateStorefront() {
  revalidatePath("/admin/blog-posts");
  revalidatePath("/", "layout");
  revalidatePath("/blog");
}

export async function createBlogPost(input: BlogPostFormInput): Promise<string> {
  await requireAdmin();
  const ref = adminDb().collection("blogPosts").doc();
  await ref.set({ ...stripUndefined(input), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  revalidateStorefront();
  return ref.id;
}

export async function updateBlogPost(id: string, input: BlogPostFormInput): Promise<void> {
  await requireAdmin();
  const before = await getBlogPostById(id);

  await adminDb().collection("blogPosts").doc(id).update({ ...stripUndefined(input), updatedAt: serverTimestamp() });
  revalidateStorefront();

  await deleteImagesByUrls(diffRemovedImages([before?.coverImage], [input.coverImage]));
}

export async function deleteBlogPost(id: string): Promise<void> {
  await requireAdmin();
  const post = await getBlogPostById(id);
  await adminDb().collection("blogPosts").doc(id).delete();
  revalidateStorefront();
  await deleteImagesByUrls([post?.coverImage]);
}
