"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@heroicons/react/24/outline";
import { updateGeneralSettings, updateShippingSettings, updatePaymentSettings } from "../settings/actions";
import { saveThemeLogosAction } from "../appearance/actions";
import { saveOnboardingStep, launchStore } from "./actions";
import { computeStoreHealth } from "./health";
import { ONBOARDING_STEP_IDS, type OnboardingProgress, type OnboardingStepId } from "@/types/onboarding";
import type { GeneralSettings, ShippingSettings, PaymentSettings } from "@/types/site-settings";
import type { ThemeLogos } from "@/types/theme";

import WelcomeStep from "./steps/WelcomeStep";
import BrandStep from "./steps/BrandStep";
import LogoStep from "./steps/LogoStep";
import ContactStep from "./steps/ContactStep";
import CurrencyStep from "./steps/CurrencyStep";
import ShippingStep from "./steps/ShippingStep";
import PaymentStep from "./steps/PaymentStep";
import SocialStep from "./steps/SocialStep";
import SeoStep from "./steps/SeoStep";
import LaunchStep from "./steps/LaunchStep";

const STEP_LABELS: Record<OnboardingStepId, string> = {
  welcome: "Welcome",
  brand: "Brand",
  logo: "Logo & favicon",
  contact: "Contact",
  currency: "Currency & timezone",
  shipping: "Shipping",
  payment: "Payment",
  social: "Social links",
  seo: "SEO basics",
  launch: "Launch",
};

export interface OnboardingWizardProps {
  initialProgress: OnboardingProgress;
  initialGeneral: GeneralSettings;
  initialShipping: ShippingSettings;
  initialPayments: PaymentSettings;
  /** The store's live theme logos (themeSettings - the same ones the Customizer edits). */
  initialLogos: ThemeLogos;
}

export default function OnboardingWizard({
  initialProgress,
  initialGeneral,
  initialShipping,
  initialPayments,
  initialLogos,
}: OnboardingWizardProps) {
  const router = useRouter();

  const [general, setGeneral] = useState(initialGeneral);
  const [shipping, setShipping] = useState(initialShipping);
  const [payments, setPayments] = useState(initialPayments);
  const [logos, setLogos] = useState<ThemeLogos>(initialLogos ?? {});
  // Only the logo fields the merchant changed here are saved, so an unpublished logo in the
  // Customizer draft is never replaced by the value this page loaded.
  const [logoChanges, setLogoChanges] = useState<Partial<ThemeLogos>>({});
  const [completedSteps, setCompletedSteps] = useState<OnboardingStepId[]>(initialProgress.completedSteps);
  const [launchedAt, setLaunchedAt] = useState<number | undefined>(initialProgress.launchedAt);
  const [stepIndex, setStepIndex] = useState(() => {
    const idx = ONBOARDING_STEP_IDS.indexOf(initialProgress.currentStep);
    return idx >= 0 ? idx : 0;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const health = useMemo(
    () => computeStoreHealth(general, shipping, payments, logos),
    [general, shipping, payments, logos]
  );

  const currentStepId = ONBOARDING_STEP_IDS[stepIndex];

  function goBack() {
    setError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function goToStep(index: number) {
    setError(null);
    setStepIndex(index);
  }

  async function persistCurrentStepData(stepId: OnboardingStepId) {
    switch (stepId) {
      case "brand":
      case "contact":
      case "currency":
      case "social":
      case "seo":
        await updateGeneralSettings(general);
        return;
      case "logo": {
        // Writes the canonical theme settings (draft + live) - not the legacy `themes` collection,
        // which the storefront ignores once a store has published theme settings.
        if (Object.keys(logoChanges).length) {
          await saveThemeLogosAction(logoChanges);
          setLogoChanges({});
        }
        return;
      }
      case "shipping":
        await updateShippingSettings(shipping);
        return;
      case "payment":
        await updatePaymentSettings(payments);
        return;
      default:
        return;
    }
  }

  async function handleSaveAndContinue(stepId: OnboardingStepId) {
    setSaving(true);
    setError(null);
    try {
      await persistCurrentStepData(stepId);
      const nextIndex = Math.min(stepIndex + 1, ONBOARDING_STEP_IDS.length - 1);
      const nextStepId = ONBOARDING_STEP_IDS[nextIndex];
      await saveOnboardingStep(stepId, nextStepId);
      setCompletedSteps((prev) => Array.from(new Set([...prev, stepId])));
      setStepIndex(nextIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLaunch() {
    if (launchedAt) {
      router.push("/admin");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await launchStore();
      setLaunchedAt(Date.now());
      setCompletedSteps(ONBOARDING_STEP_IDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-8">
      <ol className="space-y-1">
        {ONBOARDING_STEP_IDS.map((stepId, index) => {
          const done = completedSteps.includes(stepId);
          const isCurrent = index === stepIndex;
          const canJump = done || index <= stepIndex;
          return (
            <li key={stepId}>
              <button
                type="button"
                disabled={!canJump}
                onClick={() => canJump && goToStep(index)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left ${
                  isCurrent
                    ? "bg-primary-6000 text-white"
                    : canJump
                      ? "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      : "opacity-40 cursor-not-allowed"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                    isCurrent
                      ? "bg-white/20"
                      : done
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-neutral-100 dark:bg-neutral-800"
                  }`}
                >
                  {done && !isCurrent ? <CheckIcon className="w-3.5 h-3.5" /> : index + 1}
                </span>
                {STEP_LABELS[stepId]}
              </button>
            </li>
          );
        })}
      </ol>

      <div>
        {currentStepId === "welcome" && <WelcomeStep onNext={() => handleSaveAndContinue("welcome")} />}
        {currentStepId === "brand" && (
          <BrandStep
            general={general}
            onChange={(patch) => setGeneral((g) => ({ ...g, ...patch }))}
            onBack={goBack}
            onNext={() => handleSaveAndContinue("brand")}
            saving={saving}
            error={error}
          />
        )}
        {currentStepId === "logo" && (
          <LogoStep
            logos={logos}
            onChange={(patch) => {
              // A removed image is saved as "" (cleared), never as a missing key.
              const normalized = Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, v ?? ""])) as Partial<ThemeLogos>;
              setLogos((l) => ({ ...l, ...normalized }));
              setLogoChanges((c) => ({ ...c, ...normalized }));
            }}
            onBack={goBack}
            onNext={() => handleSaveAndContinue("logo")}
            saving={saving}
            error={error}
          />
        )}
        {currentStepId === "contact" && (
          <ContactStep
            general={general}
            onChange={(patch) => setGeneral((g) => ({ ...g, ...patch }))}
            onBack={goBack}
            onNext={() => handleSaveAndContinue("contact")}
            saving={saving}
            error={error}
          />
        )}
        {currentStepId === "currency" && (
          <CurrencyStep
            general={general}
            onChange={(patch) => setGeneral((g) => ({ ...g, ...patch }))}
            onBack={goBack}
            onNext={() => handleSaveAndContinue("currency")}
            saving={saving}
            error={error}
          />
        )}
        {currentStepId === "shipping" && (
          <ShippingStep
            shipping={shipping}
            onChange={(patch) => setShipping((s) => ({ ...s, ...patch }))}
            onBack={goBack}
            onNext={() => handleSaveAndContinue("shipping")}
            saving={saving}
            error={error}
          />
        )}
        {currentStepId === "payment" && (
          <PaymentStep
            payments={payments}
            onChange={(patch) => setPayments((p) => ({ ...p, ...patch }))}
            onBack={goBack}
            onNext={() => handleSaveAndContinue("payment")}
            saving={saving}
            error={error}
          />
        )}
        {currentStepId === "social" && (
          <SocialStep
            general={general}
            onChange={(patch) => setGeneral((g) => ({ ...g, ...patch }))}
            onBack={goBack}
            onNext={() => handleSaveAndContinue("social")}
            saving={saving}
            error={error}
          />
        )}
        {currentStepId === "seo" && (
          <SeoStep
            general={general}
            onChange={(patch) => setGeneral((g) => ({ ...g, ...patch }))}
            onBack={goBack}
            onNext={() => handleSaveAndContinue("seo")}
            saving={saving}
            error={error}
          />
        )}
        {currentStepId === "launch" && (
          <LaunchStep
            completedSteps={completedSteps}
            health={health}
            launched={Boolean(launchedAt)}
            onBack={goBack}
            onLaunch={handleLaunch}
            saving={saving}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
