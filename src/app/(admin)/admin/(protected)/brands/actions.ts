"use server";

import { revalidatePath } from "next/cache";
import { serverTimestamp } from "@/lib/firebase/admin";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined, docData } from "@/lib/firebase/repositories/utils";
import { deleteImagesByUrls, diffRemovedImages } from "@/lib/images/cleanup";
import type { Brand } from "@/types/brand";

export interface BrandFormInput {
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  order: number;
}

function revalidateStorefront(slug?: string) {
  revalidatePath("/admin/brands");
  revalidatePath("/");
  if (slug) revalidatePath(`/brand/${slug}`);
}

export async function createBrand(input: BrandFormInput): Promise<string> {
  await requireAdmin();
  const col = await tenantCollection("brands");
  const ref = col.doc();
  await ref.set({
    ...stripUndefined(input),
    isDeleted: false,
    deletedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  revalidateStorefront(input.slug);
  return ref.id;
}

export async function updateBrand(id: string, input: BrandFormInput): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("brands");
  const ref = col.doc(id);
  const before = docData<Brand>(await ref.get());

  await ref.update({ ...stripUndefined(input), updatedAt: serverTimestamp() });
  revalidateStorefront(input.slug);

  await deleteImagesByUrls(
    diffRemovedImages([before?.logo, before?.banner], [input.logo, input.banner])
  );
}

export async function softDeleteBrand(id: string, slug?: string): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("brands");
  await col
    .doc(id)
    .update({ isDeleted: true, deletedAt: Date.now(), updatedAt: serverTimestamp() });
  revalidateStorefront(slug);
}

export async function restoreBrand(id: string, slug?: string): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("brands");
  await col
    .doc(id)
    .update({ isDeleted: false, deletedAt: null, updatedAt: serverTimestamp() });
  revalidateStorefront(slug);
}
