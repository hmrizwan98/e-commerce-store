"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { createStore, type StoreFormInput } from "./actions";
import { slugify } from "@/lib/utils/slugify";
import { THEME_PRESETS, type ThemePresetKey } from "@/lib/themes/theme-presets";
import { buildTenantUrl } from "@/lib/platform/tenant-url";
import type { StoreStatus, StoreTemplate } from "@/types/store";

const STEPS = ["Store Details", "Owner Account", "Review & Create"] as const;

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
const labelClass = "block text-sm font-medium mb-1";
const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";

/** Create-only, multi-step version of store provisioning - StoreForm.tsx keeps handling
 * edit mode unchanged. Reuses the same createStore() action, slugify() convention, and
 * error/loading/credential-reveal patterns already established there. */
const StoreCreationWizard: React.FC<{ platformBaseUrl: string }> = ({ platformBaseUrl }) => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ adminEmail: string; adminTempPassword: string } | null>(null);

  const [name, setName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [slug, setSlug] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [status, setStatus] = useState<StoreStatus>("active");
  const [template, setTemplate] = useState<StoreTemplate>("empty");
  const [themeKey, setThemeKey] = useState<ThemePresetKey>("universal-premium");

  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  function validateStep(currentStep: number): string | null {
    if (currentStep === 0) {
      if (!name.trim()) return "Store name is required.";
      if (!slug.trim()) return "Slug couldn't be generated from the store name.";
    }
    if (currentStep === 1) {
      if (!ownerName.trim()) return "Owner name is required.";
      if (!email.trim()) return "Owner email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid owner email.";
    }
    return null;
  }

  function goNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleCreate() {
    const validationError = validateStep(0) || validateStep(1);
    if (validationError) {
      setError(validationError);
      return;
    }
    const payload: StoreFormInput = {
      name: name.trim(),
      brandName: brandName.trim() || undefined,
      slug: slug.trim(),
      email: email.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim() || undefined,
      country: country.trim() || undefined,
      currency: currency.trim() || undefined,
      timezone: timezone.trim() || undefined,
      status,
      template,
      themeKey,
    };
    setSubmitting(true);
    setError(null);
    try {
      const result = await createStore(payload);
      if (result.success) setCredentials(result);
      else setError(`${result.error.message} (${result.error.code}, trace ${result.error.traceId})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (credentials) {
    return (
      <div className={cardClass}>
        <h2 className="text-lg font-semibold">Store created</h2>
        <p className="text-sm text-neutral-500">
          Share these one-time credentials with the store owner so they can sign in to their Admin Panel.
          This password will not be shown again.
        </p>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Admin email: </span>
            {credentials.adminEmail}
          </div>
          <div>
            <span className="font-medium">Temporary password: </span>
            <code className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
              {credentials.adminTempPassword}
            </code>
          </div>
        </div>
        <ButtonPrimary onClick={() => router.push("/superadmin/stores" as any)}>Back to stores</ButtonPrimary>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <ol className="flex items-center gap-2 text-sm">
        {STEPS.map((label, i) => (
          <li key={label} className={`flex items-center gap-2 ${i === step ? "font-semibold" : "text-neutral-500"}`}>
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                i === step
                  ? "bg-primary-6000 text-white"
                  : i < step
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-neutral-100 dark:bg-neutral-800"
              }`}
            >
              {i + 1}
            </span>
            {label}
            {i < STEPS.length - 1 && <span className="text-neutral-300 dark:text-neutral-700">→</span>}
          </li>
        ))}
      </ol>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}

      {step === 0 && (
        <div className={cardClass}>
          <div>
            <label className={labelClass}>Store name</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(slugify(e.target.value));
              }}
              required
            />
            {slug && <p className="text-xs text-neutral-500 mt-1">{buildTenantUrl(platformBaseUrl, slug)}</p>}
          </div>
          <div>
            <label className={labelClass}>Brand name (optional)</label>
            <input className={inputClass} value={brandName} onChange={(e) => setBrandName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Currency</label>
              <input className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Timezone</label>
              <input className={inputClass} value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Theme</label>
            <select className={inputClass} value={themeKey} onChange={(e) => setThemeKey(e.target.value as ThemePresetKey)}>
              {Object.values(THEME_PRESETS).map((preset) => (
                <option key={preset.key} value={preset.key}>
                  {preset.name} — {preset.suitableFor.join(", ")}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-1">{THEME_PRESETS[themeKey].description}</p>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as StoreStatus)}>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Template</label>
            <select
              className={inputClass}
              value={template}
              onChange={(e) => setTemplate(e.target.value as StoreTemplate)}
            >
              <option value="empty">Empty Store — blank homepage/CMS, no placeholder content</option>
              <option value="demo">Demo Store — placeholder testimonials/FAQs (no sample products)</option>
            </select>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className={cardClass}>
          <div>
            <label className={labelClass}>Owner name</label>
            <input className={inputClass} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Owner email (used to create the store&apos;s admin login)</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={cardClass}>
          <h2 className="text-lg font-semibold">Review</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-neutral-500">Store name</span>
              {name || "—"}
            </div>
            <div>
              <span className="block text-neutral-500">Brand name</span>
              {brandName || name || "—"}
            </div>
            <div>
              <span className="block text-neutral-500">Subdomain</span>
              {slug ? buildTenantUrl(platformBaseUrl, slug) : "—"}
            </div>
            <div>
              <span className="block text-neutral-500">Status</span>
              {status}
            </div>
            <div>
              <span className="block text-neutral-500">Template</span>
              {template === "demo" ? "Demo Store" : "Empty Store"}
            </div>
            <div>
              <span className="block text-neutral-500">Theme</span>
              {THEME_PRESETS[themeKey].name}
            </div>
            <div>
              <span className="block text-neutral-500">Currency</span>
              {currency || "—"}
            </div>
            <div>
              <span className="block text-neutral-500">Country</span>
              {country || "—"}
            </div>
            <div>
              <span className="block text-neutral-500">Owner</span>
              {ownerName || "—"}
            </div>
            <div>
              <span className="block text-neutral-500">Owner email</span>
              {email || "—"}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0 || submitting}
          className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium disabled:opacity-50"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <ButtonPrimary type="button" onClick={goNext}>
            Next
          </ButtonPrimary>
        ) : (
          <ButtonPrimary type="button" onClick={handleCreate} loading={submitting}>
            Create store
          </ButtonPrimary>
        )}
      </div>
    </div>
  );
};

export default StoreCreationWizard;
