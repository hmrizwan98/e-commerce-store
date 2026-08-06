"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined, docData } from "@/lib/firebase/repositories/utils";
import { deleteImagesByUrls, diffRemovedImages } from "@/lib/images/cleanup";
import type { HomepageSection, HomepageSectionConfig, HomepageSectionType } from "@/types/homepage-section";

const COLLECTION = "homepageSections";

function revalidateStorefront() {
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

function tileImages(config: HomepageSectionConfig | undefined): (string | undefined)[] {
  return (config?.items ?? []).map((t) => t.image);
}

export async function createHomepageSection(
  type: HomepageSectionType,
  title: string,
  order: number,
  config: HomepageSectionConfig = {}
): Promise<string> {
  await requireAdmin();
  const col = await tenantCollection(COLLECTION);
  const ref = col.doc();
  await ref.set({
    type,
    title,
    order,
    isActive: true,
    config: stripUndefined(config) as HomepageSectionConfig,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidateStorefront();
  return ref.id;
}

export async function updateHomepageSection(
  id: string,
  patch: { title?: string; isActive?: boolean; order?: number; config?: HomepageSectionConfig }
): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection(COLLECTION);
  const ref = col.doc(id);
  const before = docData<HomepageSection>(await ref.get());

  await ref.update({ ...stripUndefined(patch), updatedAt: FieldValue.serverTimestamp() });
  revalidateStorefront();

  if (patch.config) {
    await deleteImagesByUrls(diffRemovedImages(tileImages(before?.config), tileImages(patch.config)));
  }
}

/** Batched equivalent of updateHomepageSection - one Firestore batch write for the whole "Save" click. */
export async function updateHomepageSections(
  patches: { id: string; patch: { title?: string; isActive?: boolean; config?: HomepageSectionConfig } }[]
): Promise<void> {
  await requireAdmin();
  if (!patches.length) return;

  const col = await tenantCollection(COLLECTION);
  const beforeSnaps = await Promise.all(patches.map(({ id }) => col.doc(id).get()));
  const befores = beforeSnaps.map((snap) => docData<HomepageSection>(snap));

  const batch = col.firestore.batch();
  patches.forEach(({ id, patch }) => {
    batch.update(col.doc(id), {
      ...stripUndefined(patch),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
  revalidateStorefront();

  await Promise.all(
    patches.map(({ patch }, index) => {
      if (!patch.config) return Promise.resolve();
      return deleteImagesByUrls(diffRemovedImages(tileImages(befores[index]?.config), tileImages(patch.config)));
    })
  );
}

export async function deleteHomepageSection(id: string): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection(COLLECTION);
  const ref = col.doc(id);
  const before = docData<HomepageSection>(await ref.get());

  await ref.delete();
  revalidateStorefront();

  await deleteImagesByUrls(tileImages(before?.config));
}

export async function reorderHomepageSections(orderedIds: string[]): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection(COLLECTION);
  const batch = col.firestore.batch();
  orderedIds.forEach((id, index) => {
    batch.update(col.doc(id), {
      order: index,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
  revalidateStorefront();
}
