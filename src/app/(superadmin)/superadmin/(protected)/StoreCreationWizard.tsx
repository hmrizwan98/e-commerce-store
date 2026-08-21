"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { createStore, type StoreFormInput } from "./actions";
import { slugify } from "@/lib/utils/slugify";
import { getTenantStorefrontUrl, getTenantAdminUrl, buildTenantUrl } from "@/lib/platform/tenant-url";
import Link from "next/link";
import type { StoreStatus } from "@/types/store";

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

  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const storefrontUrl = slug ? getTenantStorefrontUrl(platformBaseUrl, slug) : "";
  const adminUrl = slug ? getTenantAdminUrl(platformBaseUrl, slug) : "";

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
        <div className="flex items-center gap-2 text-emerald-600">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-lg font-bold">Store Provisioned Successfully</h2>
        </div>
        <p className="text-sm text-neutral-500">
          Your new tenant store is created. Share these one-time admin credentials with the store owner.
          Password will not be displayed again.
        </p>
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3 text-sm">
          <div>
            <span className="font-semibold text-neutral-600 dark:text-neutral-400">Admin Email: </span>
            <span className="font-mono text-neutral-900 dark:text-white font-medium">{credentials.adminEmail}</span>
          </div>
          <div>
            <span className="font-semibold text-neutral-600 dark:text-neutral-400">Temporary Password: </span>
            <code className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono font-bold text-neutral-900 dark:text-white">
              {credentials.adminTempPassword}
            </code>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-500">Tenant Access URLs</h3>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/30">
            <div>
              <span className="text-xs font-bold text-primary-900 dark:text-primary-200 block">Public Storefront</span>
              <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">{storefrontUrl}</span>
            </div>
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-primary-6000 text-white font-bold text-xs hover:bg-primary-700 transition-colors inline-flex items-center justify-center gap-1"
            >
              Open Storefront ↗
            </a>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
            <div>
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 block">Store Admin Dashboard</span>
              <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">{adminUrl}</span>
            </div>
            <a
              href={adminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors inline-flex items-center justify-center gap-1"
            >
              Open Store Admin ↗
            </a>
          </div>
        </div>

        <div className="pt-2">
          <ButtonPrimary onClick={() => router.push("/superadmin/stores" as any)}>Back to Store Directory</ButtonPrimary>
        </div>
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
            {slug && (
              <div className="mt-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1 text-xs font-mono">
                <div>
                  <span className="text-neutral-500">Public Storefront: </span>
                  <span className="font-semibold text-primary-6000">{storefrontUrl}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Store Admin: </span>
                  <span className="font-semibold text-indigo-600">{adminUrl}</span>
                </div>
              </div>
            )}
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
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as StoreStatus)}>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <p className="text-xs text-neutral-500">
            Every new store is automatically set up with the platform&apos;s default theme, a complete homepage, and a
            small set of demo products/categories/brands to customize or remove.
          </p>
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
            <div className="col-span-2">
              <span className="block text-neutral-500">Public Storefront URL</span>
              <span className="font-mono text-xs font-bold text-primary-6000">{storefrontUrl || "—"}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-neutral-500">Store Admin URL</span>
              <span className="font-mono text-xs font-bold text-indigo-600">{adminUrl || "—"}</span>
            </div>
            <div>
              <span className="block text-neutral-500">Status</span>
              {status}
            </div>
            <div>
              <span className="block text-neutral-500">Theme</span>
              Default Theme (with demo homepage/products)
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
