import React from "react";
import { getOnboardingProgress } from "@/lib/firebase/repositories/onboarding";
import { getGeneralSettings, getShippingSettings, getPaymentSettings } from "@/lib/firebase/repositories/site-settings";
import { getActiveThemeConfig } from "@/lib/theme/theme-repository";
import OnboardingWizard from "./OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const [progress, general, shipping, payments, theme] = await Promise.all([
    getOnboardingProgress(),
    getGeneralSettings(),
    getShippingSettings(),
    getPaymentSettings(),
    getActiveThemeConfig(),
  ]);

  const cleanProgress = JSON.parse(JSON.stringify(progress));
  const cleanGeneral = JSON.parse(JSON.stringify(general));
  const cleanShipping = JSON.parse(JSON.stringify(shipping));
  const cleanPayments = JSON.parse(JSON.stringify(payments));
  const cleanLogos = JSON.parse(JSON.stringify(theme.logos ?? {}));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Store setup</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Progress is saved automatically - come back any time to pick up where you left off.
        </p>
      </div>
      <OnboardingWizard
        initialProgress={cleanProgress}
        initialGeneral={cleanGeneral}
        initialShipping={cleanShipping}
        initialPayments={cleanPayments}
        initialLogos={cleanLogos}
      />
    </div>
  );
}
