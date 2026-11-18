import "server-only";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { docData } from "@/lib/firebase/repositories/utils";
import { planSectionPublish, sectionContent, type SectionConflict, type SectionsBaseline } from "./homepage-sections-sync";
import type { HomepageSection } from "@/types/homepage-section";

export interface PublishSectionsResult {
  ok: boolean;
  conflicts: SectionConflict[];
  upserted: number;
  deleted: number;
  /** Baseline of the live sections right after this publish (for the editor to continue from). */
  baseline: SectionsBaseline;
}

/**
 * Publishes the Customizer's homepage sections into stores/{storeId}/homepageSections inside a
 * transaction - non-destructively:
 * - the live collection is re-read in the transaction and compared with the baseline the
 *   Customizer copied; if anything changed elsewhere since then, NOTHING is written and the
 *   conflicts are returned (unless `force`, which still never deletes sections added elsewhere);
 * - only changed/new sections are written; each keeps its id, createdAt and any other existing
 *   fields; only sections the merchant removed in the Customizer are deleted.
 */
export async function publishHomepageSections(
  db: Firestore,
  storeId: string,
  input: { draft: HomepageSection[]; baseline?: SectionsBaseline | null; draftUpdatedAt?: number; force?: boolean }
): Promise<PublishSectionsResult> {
  const col = db.collection("stores").doc(storeId).collection("homepageSections");

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(col);
    const liveDocs = new Map(snap.docs.map((d) => [d.id, d]));
    const live = snap.docs.map((d) => docData<HomepageSection>(d)).filter((s): s is HomepageSection => s !== null);
    const plan = planSectionPublish({ live, draft: input.draft, baseline: input.baseline, draftUpdatedAt: input.draftUpdatedAt });

    const blocked = plan.conflicts.length > 0 && !input.force;
    const staleWithoutBaseline = plan.conflicts.some((c) => c.kind === "stale-draft");
    if (blocked || staleWithoutBaseline) {
      // A draft without a baseline that is older than the live data can't be applied safely,
      // even with force - the merchant must reload the live sections first.
      return { ok: false, conflicts: plan.conflicts, upserted: 0, deleted: 0 };
    }

    for (const section of plan.upserts) {
      const existing = liveDocs.get(section.id);
      const ref = col.doc(section.id);
      // Full replace of the content (so removed config keys really go away) while keeping every
      // other stored field - createdAt included - exactly as it was.
      tx.set(ref, {
        ...(existing ? existing.data() : { createdAt: FieldValue.serverTimestamp() }),
        ...sectionContent(section),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    for (const id of plan.deletes) tx.delete(col.doc(id));
    return { ok: true, conflicts: plan.conflicts, upserted: plan.upserts.length, deleted: plan.deletes.length };
  });

  const after = await col.get();
  const baseline = Object.fromEntries(after.docs.map((d) => [d.id, docData<HomepageSection>(d)?.updatedAt ?? 0]));
  return { ...result, baseline };
}
