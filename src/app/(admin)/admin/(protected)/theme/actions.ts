"use server";

import { revalidatePath } from "next/cache";
import { serverTimestamp } from "@/lib/firebase/admin";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined, docData } from "@/lib/firebase/repositories/utils";
import { getThemeById, DEFAULT_THEME } from "@/lib/firebase/repositories/themes";
import { deleteImagesByUrls, diffRemovedImages } from "@/lib/images/cleanup";
import type { Theme, ThemeInput } from "@/types/theme";

const COLLECTION = "themes";

function revalidateStorefront() {
  revalidatePath("/admin/theme");
  revalidatePath("/", "layout");
}

function logoUrls(logos: Theme["logos"] | undefined): (string | undefined)[] {
  if (!logos) return [];
  return [logos.logoLight, logos.logoDark, logos.favicon, logos.appleTouchIcon, logos.loadingLogo, logos.footerLogo];
}

export async function createTheme(input: ThemeInput): Promise<string> {
  await requireAdmin();
  const col = await tenantCollection(COLLECTION);
  const ref = col.doc();
  await ref.set({
    ...stripUndefined(input),
    isActive: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  revalidateStorefront();
  return ref.id;
}

export async function updateTheme(id: string, input: ThemeInput): Promise<void> {
  await requireAdmin();
  const before = await getThemeById(id);

  const col = await tenantCollection(COLLECTION);
  await col.doc(id).update({ ...stripUndefined(input), updatedAt: serverTimestamp() });
  revalidateStorefront();

  await deleteImagesByUrls(diffRemovedImages(logoUrls(before?.logos), logoUrls(input.logos)));
}

export async function deleteTheme(id: string): Promise<void> {
  await requireAdmin();
  const theme = await getThemeById(id);
  if (!theme) return;
  if (theme.isActive) throw new Error("Cannot delete the active theme - publish a different theme first.");
  const col = await tenantCollection(COLLECTION);
  await col.doc(id).delete();
  revalidateStorefront();
  await deleteImagesByUrls(logoUrls(theme.logos));
}

export async function duplicateTheme(id: string): Promise<string> {
  await requireAdmin();
  const theme = await getThemeById(id);
  if (!theme) throw new Error("Theme not found");
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = theme;
  const col = await tenantCollection(COLLECTION);
  const ref = col.doc();
  await ref.set({
    ...stripUndefined({ ...rest, name: `${theme.name} (copy)`, isActive: false }),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  revalidateStorefront();
  return ref.id;
}

/** Flips isActive off on every other theme and on for the target - only one theme is ever active. */
export async function setActiveTheme(id: string): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection(COLLECTION);
  const snap = await col.get();
  const batch = col.firestore.batch();

  let targetExists = false;
  snap.docs.forEach((doc) => {
    const isTarget = doc.id === id;
    if (isTarget) targetExists = true;
    batch.update(doc.ref, { isActive: isTarget, updatedAt: serverTimestamp() });
  });

  if (!targetExists && id === DEFAULT_THEME.id) {
    const ref = col.doc();
    const { id: _id, ...rest } = DEFAULT_THEME;
    batch.set(ref, { ...stripUndefined(rest), isActive: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  } else if (!targetExists) {
    throw new Error("Theme not found");
  }

  await batch.commit();
  revalidateStorefront();
}
