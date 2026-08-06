"use client";

import React from "react";
import WizardStepShell, { inputClass, labelClass } from "./WizardStepShell";
import type { GeneralSettings } from "@/types/site-settings";

export interface SocialStepProps {
  general: GeneralSettings;
  onChange: (patch: Partial<GeneralSettings>) => void;
  onBack: () => void;
  onNext: () => void;
  saving: boolean;
  error: string | null;
}

const FIELDS: { key: keyof NonNullable<GeneralSettings["socialLinks"]>; label: string }[] = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "twitter", label: "X (Twitter)" },
  { key: "tiktok", label: "TikTok" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "youtube", label: "YouTube" },
];

export default function SocialStep({ general, onChange, onBack, onNext, saving, error }: SocialStepProps) {
  const links = general.socialLinks ?? {};

  return (
    <WizardStepShell
      title="Social links"
      description="Optional - shown wherever your storefront's theme surfaces social icons."
      onBack={onBack}
      onNext={onNext}
      saving={saving}
      error={error}
    >
      {FIELDS.map(({ key, label }) => (
        <div key={key}>
          <label className={labelClass}>{label}</label>
          <input
            className={inputClass}
            placeholder="https://"
            value={links[key] ?? ""}
            onChange={(e) => onChange({ socialLinks: { ...links, [key]: e.target.value || undefined } })}
          />
        </div>
      ))}
    </WizardStepShell>
  );
}
