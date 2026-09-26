"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { updatePlatformEmailSettingsAction } from "../actions";
import type { PlatformEmailSettings } from "@/lib/firebase/repositories/platform-settings";

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
const labelClass = "block text-sm font-medium mb-1";
const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";

export default function PlatformSettingsClient({ initialEmail }: { initialEmail: PlatformEmailSettings }) {
  const [email, setEmail] = useState(initialEmail);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePlatformEmailSettingsAction(email);
      toast.success("Platform settings saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cardClass}>
      <h2 className="text-base font-semibold">Sender Email</h2>
      <p className="text-xs text-neutral-500">
        Used as the &quot;from&quot; address for store welcome emails, password reset links, and other platform-sent emails.
        Requires <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">RESEND_API_KEY</code> to be
        configured in the environment for real delivery - without it, emails are logged server-side only.
      </p>
      <div>
        <label className={labelClass}>From Name</label>
        <input
          className={inputClass}
          value={email.fromName}
          onChange={(e) => setEmail({ ...email, fromName: e.target.value })}
          placeholder="Webriiz"
        />
      </div>
      <div>
        <label className={labelClass}>From Email</label>
        <input
          type="email"
          className={inputClass}
          value={email.fromEmail}
          onChange={(e) => setEmail({ ...email, fromEmail: e.target.value })}
          placeholder="support@webriiz.com"
        />
        <p className="text-xs text-neutral-500 mt-1">
          Must be a verified sender/domain in your Resend account, or delivery will fail.
        </p>
      </div>
      <button
        type="button"
        disabled={saving}
        onClick={handleSave}
        className="px-4 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
