"use server";

import { revalidatePath } from "next/cache";
import { serverTimestamp } from "@/lib/firebase/admin";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import { ONBOARDING_STEP_IDS, type OnboardingStepId } from "@/types/onboarding";

const COLLECTION = "onboarding";
const DOC_ID = "state";

function revalidateOnboarding() {
  revalidatePath("/admin/onboarding");
  revalidatePath("/admin");
}

/** Records that `stepId` has been saved and which step to resume at next time -
 * called alongside (not instead of) each step's own existing settings-save action. */
export async function saveOnboardingStep(stepId: OnboardingStepId, nextStep: OnboardingStepId): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection(COLLECTION);
  const ref = col.doc(DOC_ID);
  const snap = await ref.get();
  const existingCompleted = (snap.exists ? (snap.data()?.completedSteps as OnboardingStepId[] | undefined) : []) ?? [];
  const completedSteps = Array.from(new Set([...existingCompleted, stepId]));

  await ref.set(
    stripUndefined({
      completedSteps,
      currentStep: nextStep,
      updatedAt: serverTimestamp(),
    }),
    { merge: true }
  );
  revalidateOnboarding();
}

/** Marks the wizard as launched - an onboarding-progress milestone only, not a change
 * to the store's own StoreStatus (which is already "active" from creation). */
export async function launchStore(): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection(COLLECTION);
  await col.doc(DOC_ID).set(
    {
      completedSteps: ONBOARDING_STEP_IDS,
      currentStep: "launch",
      launchedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  revalidateOnboarding();
}
