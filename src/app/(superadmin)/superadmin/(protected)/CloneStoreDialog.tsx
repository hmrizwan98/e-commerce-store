"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { slugify } from "@/lib/utils/slugify";
import { cloneStore } from "./actions";
import { buildTenantUrl } from "@/lib/platform/tenant-url";

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
const labelClass = "block text-sm font-medium mb-1";

const CloneStoreDialog: React.FC<{ sourceStoreId: string; platformBaseUrl: string }> = ({
  sourceStoreId,
  platformBaseUrl,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ adminEmail: string; adminTempPassword: string } | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
      >
        Clone this store
      </button>
    );
  }

  if (credentials) {
    return (
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2 text-sm">
        <p className="text-neutral-500">
          Store cloned. Share these one-time credentials with the new owner - this password
          will not be shown again.
        </p>
        <div>
          <span className="font-medium">Admin email: </span>
          {credentials.adminEmail}
        </div>
        <div>
          <span className="font-medium">Temporary password: </span>
          <code className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">{credentials.adminTempPassword}</code>
        </div>
        <ButtonPrimary onClick={() => router.push("/superadmin/stores" as any)}>Back to stores</ButtonPrimary>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !slug.trim() || !email.trim()) {
      setError("Store name, slug, and owner email are required.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await cloneStore(sourceStoreId, {
        name: name.trim(),
        slug: slug.trim(),
        ownerName: ownerName.trim() || undefined,
        email: email.trim(),
      });
      if (result.success) setCredentials(result);
      else setError(result.error.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clone store.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}
      <p className="text-sm text-neutral-500">
        Duplicates this store&apos;s CMS pages, homepage, navigation, settings, and theme into a
        brand-new store. Products, orders, and customers are never copied.
      </p>
      <div>
        <label className={labelClass}>New store name</label>
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
        <label className={labelClass}>Owner name</label>
        <input className={inputClass} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Owner email</label>
        <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="flex items-center gap-3">
        <ButtonPrimary type="submit" loading={submitting}>
          Clone store
        </ButtonPrimary>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500 hover:underline">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CloneStoreDialog;
