"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined, docData } from "@/lib/firebase/repositories/utils";
import type { PageSectionConfig, PageSectionType, PageSection } from "@/types/page-section";
import type { CmsPage, CmsPageStatus } from "@/types/page";
import { getPageById } from "@/lib/firebase/repositories/pages";
import { getAllPageSectionsForAdmin } from "@/lib/firebase/repositories/page-sections";
import { deleteImagesByUrls, diffRemovedImages } from "@/lib/images/cleanup";

export interface PageFormInput {
  slug: string;
  title: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  status: CmsPageStatus;
}

function revalidateStorefront(slug?: string) {
  revalidatePath("/admin/pages");
  if (slug) {
    revalidatePath(`/${slug}`);
    revalidatePath(`/pages/${slug}`);
  }
}

export async function createPage(input: PageFormInput): Promise<string> {
  await requireAdmin();
  const ref = adminDb().collection("pages").doc();
  await ref.set({
    ...stripUndefined(input),
    isActive: input.status === "published",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  revalidateStorefront(input.slug);
  return ref.id;
}

export async function updatePage(id: string, input: PageFormInput): Promise<void> {
  await requireAdmin();
  await adminDb()
    .collection("pages")
    .doc(id)
    .update({ ...stripUndefined(input), isActive: input.status === "published", updatedAt: serverTimestamp() });
  revalidateStorefront(input.slug);
}

export async function deletePage(id: string, slug?: string): Promise<void> {
  await requireAdmin();
  const sections = await getAllPageSectionsForAdmin(id);

  const batch = adminDb().batch();
  sections.forEach((s) => batch.delete(sectionsCollection(id).doc(s.id)));
  batch.delete(adminDb().collection("pages").doc(id));
  await batch.commit();

  revalidateStorefront(slug);
  await deleteImagesByUrls(sections.map((s) => s.config.image));
}

export async function duplicatePage(id: string): Promise<string> {
  await requireAdmin();
  const page = await getPageById(id);
  if (!page) throw new Error("Page not found");

  const slug = `${page.slug}-copy-${Date.now().toString(36)}`;
  const ref = adminDb().collection("pages").doc();
  const copy: Omit<CmsPage, "id"> = {
    slug,
    title: `${page.title} (copy)`,
    content: page.content,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    isActive: false,
    status: "draft",
  };
  await ref.set({ ...stripUndefined(copy), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

  const sections = await getAllPageSectionsForAdmin(id);
  if (sections.length) {
    const batch = adminDb().batch();
    sections.forEach((s) => {
      const sectionRef = ref.collection("sections").doc();
      batch.set(sectionRef, {
        type: s.type,
        title: s.title,
        order: s.order,
        isActive: s.isActive,
        config: stripUndefined(s.config),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
  }

  revalidateStorefront();
  return ref.id;
}

// --- Page Builder (per-page sections subcollection) ---

function sectionsCollection(pageId: string) {
  return adminDb().collection("pages").doc(pageId).collection("sections");
}

export async function createPageSection(
  pageId: string,
  type: PageSectionType,
  title: string,
  order: number,
  config: PageSectionConfig = {}
): Promise<string> {
  await requireAdmin();
  const ref = sectionsCollection(pageId).doc();
  await ref.set({
    type,
    title,
    order,
    isActive: true,
    config: stripUndefined(config),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath("/admin/pages");
  return ref.id;
}

export async function updatePageSection(
  pageId: string,
  id: string,
  patch: { title?: string; isActive?: boolean; config?: PageSectionConfig }
): Promise<void> {
  await requireAdmin();
  const before = docData<PageSection>(await sectionsCollection(pageId).doc(id).get());

  await sectionsCollection(pageId)
    .doc(id)
    .update({ ...stripUndefined(patch), updatedAt: FieldValue.serverTimestamp() });
  revalidatePath("/admin/pages");

  if (patch.config) {
    await deleteImagesByUrls(diffRemovedImages([before?.config.image], [patch.config.image]));
  }
}

/** Batched equivalent of updatePageSection - one Firestore batch write for the whole "Save" click. */
export async function updatePageSections(
  pageId: string,
  patches: { id: string; patch: { title?: string; isActive?: boolean; config?: PageSectionConfig } }[]
): Promise<void> {
  await requireAdmin();
  if (!patches.length) return;
  const before = await getAllPageSectionsForAdmin(pageId);
  const beforeById = new Map(before.map((s) => [s.id, s]));

  const batch = adminDb().batch();
  patches.forEach(({ id, patch }) => {
    batch.update(sectionsCollection(pageId).doc(id), {
      ...stripUndefined(patch),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
  revalidatePath("/admin/pages");

  const removedImages = patches
    .filter(({ patch }) => patch.config)
    .flatMap(({ id, patch }) => diffRemovedImages([beforeById.get(id)?.config.image], [patch.config?.image]));
  await deleteImagesByUrls(removedImages);
}

export async function deletePageSection(pageId: string, id: string): Promise<void> {
  await requireAdmin();
  const section = docData<PageSection>(await sectionsCollection(pageId).doc(id).get());
  await sectionsCollection(pageId).doc(id).delete();
  revalidatePath("/admin/pages");
  await deleteImagesByUrls([section?.config.image]);
}

export async function reorderPageSections(pageId: string, orderedIds: string[]): Promise<void> {
  await requireAdmin();
  const batch = adminDb().batch();
  orderedIds.forEach((id, index) => {
    batch.update(sectionsCollection(pageId).doc(id), { order: index, updatedAt: FieldValue.serverTimestamp() });
  });
  await batch.commit();
  revalidatePath("/admin/pages");
}
