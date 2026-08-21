import "server-only";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { toMillis } from "@/lib/firebase/repositories/utils";
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
  if (!doc.exists) return DEFAULT_ONBOARDING_PROGRESS;

  // launchedAt/updatedAt come back as Firestore Timestamp instances (from
  // serverTimestamp() writes in onboarding/actions.ts), not the plain
  // numbers this type promises - converting here (not just at the page/prop
  // boundary) is what actually fixes the "Only plain objects... Classes...
  // not supported" Server->Client Component crash at the root cause.
  const data = doc.data() as Record<string, unknown>;
  return {
    ...DEFAULT_ONBOARDING_PROGRESS,
    ...data,
    launchedAt: toMillis(data.launchedAt),
    updatedAt: toMillis(data.updatedAt),
  } as OnboardingProgress;
}
