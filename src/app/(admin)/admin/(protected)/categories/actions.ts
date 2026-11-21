"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
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
  productIds?: string[];
}

function revalidateStorefront(slug?: string) {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/collection");
  revalidatePath("/collection-2");
  revalidatePath("/search");
  revalidatePath("/category/[slug]", "page");
  if (slug) revalidatePath(`/category/${slug}`);
}

export async function createCategory(input: CategoryFormInput): Promise<string> {
  await requireAdmin();
  const { productIds, ...categoryData } = input;
  const col = await tenantCollection("categories");
  const ref = col.doc();
  await ref.set({
    ...stripUndefined(categoryData),
    isDeleted: false,
    deletedAt: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (productIds && productIds.length > 0) {
    const prodCol = await tenantCollection("products");
    const batch = prodCol.firestore.batch();
    for (const prodId of productIds) {
      batch.update(prodCol.doc(prodId), {
        categoryIds: FieldValue.arrayUnion(ref.id),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
  }

  revalidateStorefront(input.slug);
  return ref.id;
}

export async function updateCategory(id: string, input: CategoryFormInput): Promise<void> {
  await requireAdmin();
  const { productIds, ...categoryData } = input;
  const col = await tenantCollection("categories");
  const ref = col.doc(id);
  const before = docData<Category>(await ref.get());

  await ref.update({ ...stripUndefined(categoryData), updatedAt: FieldValue.serverTimestamp() });

  if (productIds !== undefined) {
    const prodCol = await tenantCollection("products");
    const currentSnap = await prodCol
      .where("isDeleted", "==", false)
      .where("categoryIds", "array-contains", id)
      .get();

    const currentProductIds = new Set(currentSnap.docs.map((d) => d.id));
    const targetProductIds = new Set(productIds);

    const toAdd = productIds.filter((pId) => !currentProductIds.has(pId));
    const toRemove = Array.from(currentProductIds).filter((pId) => !targetProductIds.has(pId));

    if (toAdd.length > 0 || toRemove.length > 0) {
      const batch = prodCol.firestore.batch();
      for (const pId of toAdd) {
        batch.update(prodCol.doc(pId), {
          categoryIds: FieldValue.arrayUnion(id),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      for (const pId of toRemove) {
        batch.update(prodCol.doc(pId), {
          categoryIds: FieldValue.arrayRemove(id),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
    }
  }

  revalidateStorefront(input.slug);

  await deleteImagesByUrls(diffRemovedImages([before?.image], [input.image]));
}

export async function softDeleteCategory(id: string, slug?: string): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("categories");
  await col.doc(id).update({ isDeleted: true, deletedAt: Date.now(), updatedAt: FieldValue.serverTimestamp() });
  revalidateStorefront(slug);
}

export async function restoreCategory(id: string, slug?: string): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("categories");
  await col.doc(id).update({ isDeleted: false, deletedAt: null, updatedAt: FieldValue.serverTimestamp() });
  revalidateStorefront(slug);
}
