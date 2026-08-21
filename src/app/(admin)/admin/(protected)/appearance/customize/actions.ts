"use server";

import { requireAdmin } from "@/lib/firebase/require-admin";
import {
  saveDraftThemeConfig,
  setActiveThemeConfig,
  getActiveThemeConfig,
  getDraftThemeConfig,
} from "@/lib/theme/theme-repository";
import { revalidatePath } from "next/cache";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";

/** Persists the customizer's in-memory draft. Never touches the live storefront. */
export async function saveCustomizerDraftAction(draftConfig: Partial<SystemThemeConfig>) {
  await requireAdmin();
  await saveDraftThemeConfig(draftConfig);
  revalidatePath("/admin/appearance/customize/preview");
  return { ok: true as const };
}

import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { FieldValue } from "firebase-admin/firestore";

/** Publishes whatever is currently saved as the draft. Callers must save the draft first. */
export async function publishCustomizerAction() {
  await requireAdmin();
  const currentDraft = await getDraftThemeConfig();
  await setActiveThemeConfig(currentDraft);

  if (currentDraft.homepageSections !== undefined) {
    const col = await tenantCollection("homepageSections");
    const snap = await col.get();
    const batch = col.firestore.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));

    currentDraft.homepageSections.forEach((sec, idx) => {
      const docRef = col.doc(sec.id || `sec-${idx}`);
      batch.set(docRef, {
        type: sec.type,
        title: sec.title,
        order: sec.order ?? idx,
        isActive: sec.isActive ?? true,
        config: sec.config ?? {},
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/appearance/customize/preview");
  return { ok: true as const };
}

/** Overwrites the draft with the currently-published config - the customizer's "Discard" action. */
export async function discardCustomizerDraftAction() {
  await requireAdmin();
  const activeConfig = await getActiveThemeConfig();
  await saveDraftThemeConfig(activeConfig);
  revalidatePath("/admin/appearance/customize/preview");
  return { ok: true as const, config: activeConfig };
}
