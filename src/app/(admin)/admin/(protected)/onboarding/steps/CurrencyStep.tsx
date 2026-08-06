"use client";

import React from "react";
import WizardStepShell, { inputClass, labelClass } from "./WizardStepShell";
import type { GeneralSettings } from "@/types/site-settings";

export interface CurrencyStepProps {
  general: GeneralSettings;
  onChange: (patch: Partial<GeneralSettings>) => void;
  onBack: () => void;
  onNext: () => void;
  saving: boolean;
  error: string | null;
}

export default function CurrencyStep({ general, onChange, onBack, onNext, saving, error }: CurrencyStepProps) {
  return (
    <WizardStepShell
      title="Currency & timezone"
      description="Used across pricing, invoices, and order timestamps."
      onBack={onBack}
      onNext={onNext}
      saving={saving}
      error={error}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Currency code</label>
          <input
            className={inputClass}
            placeholder="USD"
            value={general.currency}
            onChange={(e) => onChange({ currency: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Currency symbol</label>
          <input
            className={inputClass}
            placeholder="$"
            value={general.currencySymbol}
            onChange={(e) => onChange({ currencySymbol: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Timezone</label>
        <input
          className={inputClass}
          placeholder="e.g. America/New_York"
          value={general.timezone ?? ""}
          onChange={(e) => onChange({ timezone: e.target.value || undefined })}
        />
      </div>
    </WizardStepShell>
  );
}
