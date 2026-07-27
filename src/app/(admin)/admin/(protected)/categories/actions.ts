"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined, docData } from "@/lib/firebase/repositories/utils";
import { deleteImagesByUrls, diffRemovedImages } from "@/lib/images/cleanup";
import type { Category } from "@/types/category";

export interface CategoryFormInput {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string | null;
  order: number;
  isActive: boolean;
  showInNav: boolean;
  showOnHomepage: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

function revalidateStorefront(slug?: string) {
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/collection");
  revalidatePath("/collection-2");
  if (slug) revalidatePath(`/category/${slug}`);
}

export async function createCategory(input: CategoryFormInput): Promise<string> {
  await requireAdmin();
  const ref = adminDb().collection("categories").doc();
  await ref.set({
    ...stripUndefined(input),
    isDeleted: false,
    deletedAt: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidateStorefront(input.slug);
  return ref.id;
}

export async function updateCategory(id: string, input: CategoryFormInput): Promise<void> {
  await requireAdmin();
  const ref = adminDb().collection("categories").doc(id);
  const before = docData<Category>(await ref.get());

  await ref.update({ ...stripUndefined(input), updatedAt: FieldValue.serverTimestamp() });
  revalidateStorefront(input.slug);

  await deleteImagesByUrls(diffRemovedImages([before?.image], [input.image]));
}

export async function softDeleteCategory(id: string, slug?: string): Promise<void> {
  await requireAdmin();
  await adminDb()
    .collection("categories")
    .doc(id)
    .update({ isDeleted: true, deletedAt: Date.now(), updatedAt: FieldValue.serverTimestamp() });
  revalidateStorefront(slug);
}

export async function restoreCategory(id: string, slug?: string): Promise<void> {
  await requireAdmin();
  await adminDb()
    .collection("categories")
    .doc(id)
    .update({ isDeleted: false, deletedAt: null, updatedAt: FieldValue.serverTimestamp() });
  revalidateStorefront(slug);
}
