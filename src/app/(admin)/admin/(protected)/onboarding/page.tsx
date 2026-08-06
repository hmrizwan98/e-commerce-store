import React from "react";
import { getOnboardingProgress } from "@/lib/firebase/repositories/onboarding";
import { getGeneralSettings, getShippingSettings, getPaymentSettings } from "@/lib/firebase/repositories/site-settings";
import { getActiveTheme } from "@/lib/firebase/repositories/themes";
import OnboardingWizard from "./OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const [progress, general, shipping, payments, theme] = await Promise.all([
    getOnboardingProgress(),
    getGeneralSettings(),
    getShippingSettings(),
    getPaymentSettings(),
    getActiveTheme(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Store setup</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Progress is saved automatically - come back any time to pick up where you left off.
        </p>
      </div>
      <OnboardingWizard
        initialProgress={progress}
        initialGeneral={general}
        initialShipping={shipping}
        initialPayments={payments}
        initialTheme={theme}
      />
    </div>
  );
}
