import "server-only";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import type { OnboardingProgress } from "@/types/onboarding";

const COLLECTION = "onboarding";
const DOC_ID = "state";

export const DEFAULT_ONBOARDING_PROGRESS: OnboardingProgress = {
  completedSteps: [],
  currentStep: "welcome",
};

/** Mirrors the siteSettings repository's single-doc getter pattern (tenantCollection +
 * merge over a DEFAULT_* constant) - see src/lib/firebase/repositories/site-settings.ts. */
export async function getOnboardingProgress(): Promise<OnboardingProgress> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc(DOC_ID).get();
  return doc.exists
    ? ({ ...DEFAULT_ONBOARDING_PROGRESS, ...doc.data() } as OnboardingProgress)
    : DEFAULT_ONBOARDING_PROGRESS;
}
