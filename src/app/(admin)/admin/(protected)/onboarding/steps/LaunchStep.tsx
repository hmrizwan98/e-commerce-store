"use client";

import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import WizardStepShell from "./WizardStepShell";
import type { OnboardingStepId } from "@/types/onboarding";
import type { StoreHealthCheck } from "../health";

const CHECKLIST: { id: OnboardingStepId; label: string }[] = [
  { id: "brand", label: "Brand information" },
  { id: "logo", label: "Logo & favicon" },
  { id: "contact", label: "Contact information" },
  { id: "currency", label: "Currency & timezone" },
  { id: "shipping", label: "Shipping configuration" },
  { id: "payment", label: "Payment configuration" },
  { id: "social", label: "Social links" },
  { id: "seo", label: "SEO basics" },
];

export interface LaunchStepProps {
  completedSteps: OnboardingStepId[];
  health: StoreHealthCheck[];
  launched: boolean;
  onBack: () => void;
  onLaunch: () => void;
  saving: boolean;
  error: string | null;
}

function ChecklistRow({ label, healthy }: { label: string; healthy: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1.5 text-sm">
      <CheckCircleIcon className={`w-5 h-5 flex-shrink-0 ${healthy ? "text-green-500" : "text-neutral-300 dark:text-neutral-700"}`} />
      <span className={healthy ? "" : "text-neutral-400"}>{label}</span>
    </div>
  );
}

export default function LaunchStep({ completedSteps, health, launched, onBack, onLaunch, saving, error }: LaunchStepProps) {
  return (
    <WizardStepShell
      title={launched ? "Your store is launched" : "Launch checklist"}
      description={
        launched
          ? "You can keep refining any of these any time from Settings, Theme, or this wizard."
          : "Review what's set up so far. You can launch now and keep refining later - nothing here is required to launch."
      }
      onBack={launched ? undefined : onBack}
      onNext={onLaunch}
      nextLabel={launched ? "Back to Dashboard" : "Launch Store"}
      saving={saving}
      error={error}
    >
      <div>
        <h3 className="text-sm font-semibold mb-2">Setup checklist</h3>
        {CHECKLIST.map((item) => (
          <ChecklistRow key={item.id} label={item.label} healthy={completedSteps.includes(item.id)} />
        ))}
      </div>
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-semibold mb-2">Store health</h3>
        {health.map((check) => (
          <ChecklistRow key={check.label} label={check.label} healthy={check.healthy} />
        ))}
      </div>
    </WizardStepShell>
  );
}
