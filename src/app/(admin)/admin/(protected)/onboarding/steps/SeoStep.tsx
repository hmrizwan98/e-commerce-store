"use client";

import React from "react";
import WizardStepShell, { inputClass, labelClass } from "./WizardStepShell";
import type { GeneralSettings } from "@/types/site-settings";

export interface SeoStepProps {
  general: GeneralSettings;
  onChange: (patch: Partial<GeneralSettings>) => void;
  onBack: () => void;
  onNext: () => void;
  saving: boolean;
  error: string | null;
}

export default function SeoStep({ general, onChange, onBack, onNext, saving, error }: SeoStepProps) {
  return (
    <WizardStepShell
      title="SEO basics"
      description="Used for your storefront's page title and meta description. More advanced SEO options are in Settings → SEO."
      onBack={onBack}
      onNext={onNext}
      saving={saving}
      error={error}
    >
      <div>
        <label className={labelClass}>SEO title</label>
        <input
          className={inputClass}
          value={general.seoTitle ?? ""}
          onChange={(e) => onChange({ seoTitle: e.target.value || undefined })}
        />
      </div>
      <div>
        <label className={labelClass}>SEO description</label>
        <textarea
          rows={3}
          className={inputClass}
          value={general.seoDescription ?? ""}
          onChange={(e) => onChange({ seoDescription: e.target.value || undefined })}
        />
      </div>
    </WizardStepShell>
  );
}
