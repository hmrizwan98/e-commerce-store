import "server-only";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import { withoutSectionStaging } from "./theme-safety";
import type { PopupThemeConfig } from "./theme-types";

/**
 * Popup settings (Appearance → Popups & Modals) written FIELD-LEVEL: only `popup` (and
 * `updatedAt`) changes in the theme docs. The page used to save a page-load snapshot of the
 * whole draft, which overwrote newer unpublished Customizer edits; its Publish pushed every
 * other unpublished draft change live; and its Reset replaced the whole draft with the live
 * theme. Each operation runs in a transaction on stores/{storeId}/themeSettings.
 *
 * `popup` is replaced as a whole value (update(), not a merge), so a field the merchant cleared
 * really goes away.
 */
export type PopupOperation = "save-draft" | "publish" | "reset-draft";

export async function applyPopupOperation(
  db: Firestore,
  storeId: string,
  op: PopupOperation,
  popup?: PopupThemeConfig
): Promise<{ popup: PopupThemeConfig | null }> {
  const col = db.collection("stores").doc(storeId).collection("themeSettings");
  const draftRef = col.doc("draft");
  const activeRef = col.doc("active");

  return db.runTransaction(async (tx) => {
    const [draftSnap, activeSnap] = await Promise.all([tx.get(draftRef), tx.get(activeRef)]);
    const now = Date.now();
    const clean = popup ? (stripUndefined(popup) as PopupThemeConfig) : undefined;

    /** Writes `value` as the draft's popup without touching any other draft field. */
    const writeDraftPopup = (value: PopupThemeConfig | null) => {
      if (draftSnap.exists) {
        tx.update(draftRef, { popup: value ?? FieldValue.delete(), updatedAt: now });
      } else if (activeSnap.exists) {
        // No draft yet = the editor shows the live theme. Start the draft from it (as every
        // other draft save does), never from a partial doc - that would switch the preset.
        const base = withoutSectionStaging(activeSnap.data() ?? {});
        const { popup: _livePopup, ...rest } = base as Record<string, unknown>;
        tx.set(draftRef, { ...rest, ...(value ? { popup: value } : {}), updatedAt: now });
      } else if (value) {
        tx.set(draftRef, { popup: value, updatedAt: now });
      }
    };

    if (op === "save-draft") {
      if (!clean) throw new Error("Popup settings are required.");
      writeDraftPopup(clean);
      return { popup: clean };
    }

    if (op === "publish") {
      if (!clean) throw new Error("Popup settings are required.");
      if (activeSnap.exists) {
        tx.update(activeRef, { popup: clean, updatedAt: now });
      } else {
        // No live theme doc yet: publish the draft (as the theme publish does) with this popup.
        const base = withoutSectionStaging(draftSnap.data() ?? {});
        tx.set(activeRef, { ...base, popup: clean, updatedAt: now });
      }
      writeDraftPopup(clean); // keep the draft's popup equal to what is live
      return { popup: clean };
    }

    // reset-draft: the draft's popup goes back to the live popup; nothing else changes.
    const livePopup = (activeSnap.data()?.popup as PopupThemeConfig | undefined) ?? null;
    if (draftSnap.exists) writeDraftPopup(livePopup);
    return { popup: livePopup };
  });
}
