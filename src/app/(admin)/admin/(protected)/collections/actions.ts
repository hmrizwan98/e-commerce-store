"use server";

import { revalidatePath } from "next/cache";
import { serverTimestamp } from "@/lib/firebase/admin";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined, docData } from "@/lib/firebase/repositories/utils";
import { deleteImagesByUrls, diffRemovedImages } from "@/lib/images/cleanup";
import type { Collection } from "@/types/collection";

export interface CollectionFormInput {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
}

function revalidateStorefront() {
  revalidatePath("/admin/collections");
  revalidatePath("/", "layout");
}

export async function createCollection(input: CollectionFormInput): Promise<string> {
  await requireAdmin();
  const col = await tenantCollection("collections");
  const ref = col.doc();
  await ref.set({
    ...stripUndefined(input),
    isDeleted: false,
    deletedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  revalidateStorefront();
  return ref.id;
}

export async function updateCollection(id: string, input: CollectionFormInput): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("collections");
  const ref = col.doc(id);
  const before = docData<Collection>(await ref.get());

  await ref.update({ ...stripUndefined(input), updatedAt: serverTimestamp() });
  revalidateStorefront();

  await deleteImagesByUrls(diffRemovedImages([before?.image], [input.image]));
}

export async function softDeleteCollection(id: string): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("collections");
  await col.doc(id).update({ isDeleted: true, deletedAt: Date.now(), updatedAt: serverTimestamp() });
  revalidateStorefront();
}

export async function restoreCollection(id: string): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("collections");
  await col.doc(id).update({ isDeleted: false, deletedAt: null, updatedAt: serverTimestamp() });
  revalidateStorefront();
}
