"use client";

import React from "react";
import WizardStepShell, { inputClass, labelClass } from "./WizardStepShell";
import type { ShippingSettings } from "@/types/site-settings";

export interface ShippingStepProps {
  shipping: ShippingSettings;
  onChange: (patch: Partial<ShippingSettings>) => void;
  onBack: () => void;
  onNext: () => void;
  saving: boolean;
  error: string | null;
}

export default function ShippingStep({ shipping, onChange, onBack, onNext, saving, error }: ShippingStepProps) {
  return (
    <WizardStepShell
      title="Shipping configuration"
      description="A flat-rate baseline - fine-tune further any time in Settings → Shipping."
      onBack={onBack}
      onNext={onNext}
      saving={saving}
      error={error}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Flat shipping rate</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            value={shipping.flatRate}
            onChange={(e) => onChange({ flatRate: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className={labelClass}>Free shipping over</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            value={shipping.freeShippingThreshold ?? ""}
            onChange={(e) => onChange({ freeShippingThreshold: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Estimated days (min)</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={shipping.estimateDaysMin ?? ""}
            onChange={(e) => onChange({ estimateDaysMin: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div>
          <label className={labelClass}>Estimated days (max)</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={shipping.estimateDaysMax ?? ""}
            onChange={(e) => onChange({ estimateDaysMax: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>
    </WizardStepShell>
  );
}
