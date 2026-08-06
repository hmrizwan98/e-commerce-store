"use client";

import React from "react";
import WizardStepShell, { inputClass, labelClass } from "./WizardStepShell";
import type { GeneralSettings } from "@/types/site-settings";

export interface ContactStepProps {
  general: GeneralSettings;
  onChange: (patch: Partial<GeneralSettings>) => void;
  onBack: () => void;
  onNext: () => void;
  saving: boolean;
  error: string | null;
}

export default function ContactStep({ general, onChange, onBack, onNext, saving, error }: ContactStepProps) {
  return (
    <WizardStepShell
      title="Store contact information"
      description="How should customers and the platform reach you?"
      onBack={onBack}
      onNext={onNext}
      saving={saving}
      error={error}
    >
      <div>
        <label className={labelClass}>Store email</label>
        <input
          type="email"
          className={inputClass}
          value={general.storeEmail}
          onChange={(e) => onChange({ storeEmail: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClass}>Store phone</label>
        <input
          className={inputClass}
          value={general.storePhone ?? ""}
          onChange={(e) => onChange({ storePhone: e.target.value || undefined })}
        />
      </div>
      <div>
        <label className={labelClass}>Store address</label>
        <input
          className={inputClass}
          value={general.storeAddress ?? ""}
          onChange={(e) => onChange({ storeAddress: e.target.value || undefined })}
        />
      </div>
    </WizardStepShell>
  );
}
