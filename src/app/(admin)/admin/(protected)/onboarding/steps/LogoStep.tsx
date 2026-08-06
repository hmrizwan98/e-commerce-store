"use client";

import React, { useState } from "react";
import WizardStepShell from "./WizardStepShell";
import ImageUploader from "@/components/admin/ImageUploader";
import type { ThemeLogos } from "@/types/theme";

export interface LogoStepProps {
  logos: ThemeLogos;
  onChange: (patch: Partial<ThemeLogos>) => void;
  onBack: () => void;
  onNext: () => void;
  saving: boolean;
  error: string | null;
}

export default function LogoStep({ logos, onChange, onBack, onNext, saving, error }: LogoStepProps) {
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);

  return (
    <WizardStepShell
      title="Logo & favicon"
      description="Reuses the same Theme Builder logo upload used elsewhere in Admin."
      onBack={onBack}
      onNext={onNext}
      saving={saving || logoUploading || faviconUploading}
      error={error}
    >
      <ImageUploader
        value={logos.logoLight ? [logos.logoLight] : []}
        onChange={(urls) => onChange({ logoLight: urls[0] })}
        imageType="themeLogo"
        subfolder="logo"
        multiple={false}
        label="Logo"
        onUploadingChange={setLogoUploading}
      />
      <ImageUploader
        value={logos.favicon ? [logos.favicon] : []}
        onChange={(urls) => onChange({ favicon: urls[0] })}
        imageType="themeFavicon"
        subfolder="favicon"
        multiple={false}
        label="Favicon"
        onUploadingChange={setFaviconUploading}
      />
    </WizardStepShell>
  );
}
