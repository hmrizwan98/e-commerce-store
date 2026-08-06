"use client";

import React from "react";
import WizardStepShell, { inputClass, labelClass } from "./WizardStepShell";
import type { GeneralSettings } from "@/types/site-settings";

export interface BrandStepProps {
  general: GeneralSettings;
  onChange: (patch: Partial<GeneralSettings>) => void;
  onBack: () => void;
  onNext: () => void;
  saving: boolean;
  error: string | null;
}

export default function BrandStep({ general, onChange, onBack, onNext, saving, error }: BrandStepProps) {
  return (
    <WizardStepShell
      title="Brand information"
      description="What should customers see as your store's name?"
      onBack={onBack}
      onNext={onNext}
      saving={saving}
      error={error}
    >
      <div>
        <label className={labelClass}>Store name</label>
        <input
          className={inputClass}
          value={general.storeName}
          onChange={(e) => onChange({ storeName: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClass}>Legal / business name (optional)</label>
        <input
          className={inputClass}
          value={general.businessName ?? ""}
          onChange={(e) => onChange({ businessName: e.target.value || undefined })}
        />
      </div>
    </WizardStepShell>
  );
}
