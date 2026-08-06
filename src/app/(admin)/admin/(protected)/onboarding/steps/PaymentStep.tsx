"use client";

import React from "react";
import WizardStepShell, { inputClass, labelClass } from "./WizardStepShell";
import type { PaymentSettings, PaymentMethodSetting } from "@/types/site-settings";

export interface PaymentStepProps {
  payments: PaymentSettings;
  onChange: (patch: Partial<PaymentSettings>) => void;
  onBack: () => void;
  onNext: () => void;
  saving: boolean;
  error: string | null;
}

function MethodFields({
  title,
  method,
  onChange,
}: {
  title: string;
  method: PaymentMethodSetting;
  onChange: (patch: Partial<PaymentMethodSetting>) => void;
}) {
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={method.enabled} onChange={(e) => onChange({ enabled: e.target.checked })} />
        {title}
      </label>
      {method.enabled && (
        <input
          className={inputClass}
          placeholder="Instructions shown to customers at checkout"
          value={method.instructions ?? ""}
          onChange={(e) => onChange({ instructions: e.target.value || undefined })}
        />
      )}
    </div>
  );
}

export default function PaymentStep({ payments, onChange, onBack, onNext, saving, error }: PaymentStepProps) {
  return (
    <WizardStepShell
      title="Payment configuration"
      description="Configuration only - no payment gateway is charged here. Fine-tune further any time in Settings → Payments."
      onBack={onBack}
      onNext={onNext}
      saving={saving}
      error={error}
    >
      <MethodFields
        title="Cash on delivery"
        method={payments.cod}
        onChange={(patch) => onChange({ cod: { ...payments.cod, ...patch } })}
      />
      <MethodFields
        title="Bank transfer"
        method={payments.bankTransfer}
        onChange={(patch) => onChange({ bankTransfer: { ...payments.bankTransfer, ...patch } })}
      />
      <MethodFields
        title="JazzCash"
        method={payments.jazzcash}
        onChange={(patch) => onChange({ jazzcash: { ...payments.jazzcash, ...patch } })}
      />
      <p className={labelClass + " !mb-0 text-neutral-400 font-normal"}>
        At least one method should be enabled before customers can check out.
      </p>
    </WizardStepShell>
  );
}
