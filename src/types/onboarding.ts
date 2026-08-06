export type OnboardingStepId =
  | "welcome"
  | "brand"
  | "logo"
  | "contact"
  | "currency"
  | "shipping"
  | "payment"
  | "social"
  | "seo"
  | "launch";

export const ONBOARDING_STEP_IDS: OnboardingStepId[] = [
  "welcome",
  "brand",
  "logo",
  "contact",
  "currency",
  "shipping",
  "payment",
  "social",
  "seo",
  "launch",
];

/** Progress through the first-time Store Owner onboarding wizard - stored
 * separately from `siteSettings` since it tracks wizard state, not store
 * configuration itself (see src/lib/firebase/repositories/onboarding.ts). */
export interface OnboardingProgress {
  completedSteps: OnboardingStepId[];
  currentStep: OnboardingStepId;
  launchedAt?: number;
  createdAt?: number;
  updatedAt?: number;
}
