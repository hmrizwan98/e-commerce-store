import React from "react";
import Link from "next/link";
import { ONBOARDING_STEP_IDS, type OnboardingProgress } from "@/types/onboarding";

const TOTAL_STEPS = ONBOARDING_STEP_IDS.length - 1; // exclude "launch" itself from the count shown to the user

export default function OnboardingWelcomeCard({ progress }: { progress: OnboardingProgress }) {
  if (progress.launchedAt) return null;

  const completed = progress.completedSteps.filter((s) => s !== "launch").length;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="font-semibold">Welcome! Let&apos;s finish setting up your store</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {completed} of {TOTAL_STEPS} steps complete.
        </p>
      </div>
      <Link
        href={"/admin/onboarding" as any}
        className="px-5 py-2.5 rounded-full bg-primary-6000 text-white text-sm font-medium whitespace-nowrap"
      >
        Continue Setup
      </Link>
    </div>
  );
}
