"use client";

import React from "react";
import WizardStepShell from "./WizardStepShell";

export default function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <WizardStepShell
      title="Welcome to your new store"
      description="Let's get your store ready to launch. This takes about five minutes - you can save your progress and come back any time."
      onNext={onNext}
      nextLabel="Get Started"
    >
      <ul className="text-sm text-neutral-500 dark:text-neutral-400 list-disc list-inside space-y-1.5">
        <li>Brand information and logo</li>
        <li>Contact details, currency, and timezone</li>
        <li>Shipping and payment configuration</li>
        <li>Social links and basic SEO</li>
      </ul>
    </WizardStepShell>
  );
}
