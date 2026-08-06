"use client";

import React from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";

export interface WizardStepShellProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  saving?: boolean;
  error?: string | null;
}

/** Shared footer/error/heading chrome for every onboarding step - the same
 * "Back" / "Save & Continue" pair and inline error text repeats across all
 * 10 steps, so it's centralized here once rather than copy-pasted. */
export default function WizardStepShell({
  title,
  description,
  children,
  onBack,
  onNext,
  nextLabel = "Save & Continue",
  saving = false,
  error,
}: WizardStepShellProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>}

      {children && <div className="mt-6 space-y-4">{children}</div>}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 flex items-center justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium rounded-full border border-neutral-300 dark:border-neutral-700 disabled:opacity-50"
          >
            Back
          </button>
        ) : (
          <span />
        )}
        <ButtonPrimary type="button" onClick={onNext} loading={saving}>
          {nextLabel}
        </ButtonPrimary>
      </div>
    </div>
  );
}

export const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
export const labelClass = "block text-sm font-medium mb-1";
