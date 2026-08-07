"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { createStore, updateStore, type StoreFormInput } from "./actions";
import { slugify } from "@/lib/utils/slugify";
import { buildTenantUrl } from "@/lib/platform/tenant-url";
import type { Store } from "@/types/store";

const StoreForm: React.FC<{ mode: "create" | "edit"; store?: Store; platformBaseUrl: string }> = ({
  mode,
  store,
  platformBaseUrl,
}) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ adminEmail: string; adminTempPassword: string } | null>(null);

  const [name, setName] = useState(store?.name ?? "");
  const [slug, setSlug] = useState(store?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(store?.slug));
  const [email, setEmail] = useState(store?.email ?? "");
  const [ownerName, setOwnerName] = useState(store?.ownerName ?? "");
  const [phone, setPhone] = useState(store?.phone ?? "");
  const [country, setCountry] = useState(store?.country ?? "");
  const [currency, setCurrency] = useState(store?.currency ?? "USD");
  const [timezone, setTimezone] = useState(store?.timezone ?? "");
  const [language, setLanguage] = useState(store?.language ?? "en");
  const [notes, setNotes] = useState(store?.notes ?? "");
  const [domainsText, setDomainsText] = useState(store?.domains?.join("\n") ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !slug.trim()) {
      setError("Store name and slug are required.");
      return;
    }
    const payload: StoreFormInput = {
      name: name.trim(),
      slug: slug.trim(),
      email: email.trim() || undefined,
      ownerName: ownerName.trim() || undefined,
      phone: phone.trim() || undefined,
      country: country.trim() || undefined,
      currency: currency.trim() || undefined,
      timezone: timezone.trim() || undefined,
      language: language.trim() || undefined,
      notes: notes.trim() || undefined,
      domains: domainsText
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean),
    };
    setSubmitting(true);
    try {
      if (mode === "create") {
        const result = await createStore(payload);
        if (result.success) setCredentials(result);
        else setError(`${result.error.message} (${result.error.code}, trace ${result.error.traceId})`);
      } else if (store) {
        await updateStore(store.id, payload);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
  const labelClass = "block text-sm font-medium mb-1";
  const cardClass =
    "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";

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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
      )}
      {mode === "edit" && store && (
        <div className={cardClass}>
          <h2 className="text-lg font-semibold">Store details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-neutral-500">Plan</span>
              {store.subscription?.plan || "—"}
              {store.subscription?.expiryDate
                ? ` (expires ${new Date(store.subscription.expiryDate).toLocaleDateString()})`
                : ""}
            </div>
            <div>
              <span className="block text-neutral-500">Website</span>
              {store.websiteUrl ? (
                <a href={store.websiteUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
                  {store.websiteUrl}
                </a>
              ) : (
                "—"
              )}
            </div>
            <div>
              <span className="block text-neutral-500">Admin panel</span>
              {store.adminUrl ? (
                <a href={store.adminUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
                  {store.adminUrl}
                </a>
              ) : (
                "—"
              )}
            </div>
            <div>
              {/* storageLimit is a configured cap, not a measured usage value - there's no real
                  usage metering yet, so this only reflects the plan's limit. */}
              <span className="block text-neutral-500">Storage limit</span>
              {store.storageLimit ? `${store.storageLimit} MB` : "—"}
            </div>
            <div>
              <span className="block text-neutral-500">Domains</span>
              {store.domains?.length ? store.domains.join(", ") : "—"}
            </div>
          </div>
        </div>
      )}
      <div className={cardClass}>
        <div>
          <label className={labelClass}>Store name</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Slug (subdomain)</label>
          <input
            className={inputClass}
            value={slug}
            disabled={mode === "edit"}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugTouched(true);
            }}
            required
          />
          {slug && (
            <p className="text-xs text-neutral-500 mt-1">
              {store?.websiteUrl ?? buildTenantUrl(platformBaseUrl, slug)}
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>Email {mode === "create" && "(used to create the store's admin login)"}</label>
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={mode === "edit"}
            required={mode === "create"}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Owner name</label>
            <input className={inputClass} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <input className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <input className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Timezone</label>
            <input className={inputClass} value={timezone} onChange={(e) => setTimezone(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Language</label>
            <input className={inputClass} value={language} onChange={(e) => setLanguage(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Notes</label>
          <textarea className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Custom domains (one per line)</label>
          <textarea
            className={inputClass}
            rows={3}
            placeholder={"abcstore.com\nwww.abcstore.com"}
            value={domainsText}
            onChange={(e) => setDomainsText(e.target.value)}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Point each domain&apos;s DNS at this app and add it here - no code change needed per domain.
          </p>
        </div>
      </div>

      <ButtonPrimary type="submit" loading={submitting}>
        {mode === "create" ? "Create store" : "Save changes"}
      </ButtonPrimary>
    </form>
  );
};

export default StoreForm;
