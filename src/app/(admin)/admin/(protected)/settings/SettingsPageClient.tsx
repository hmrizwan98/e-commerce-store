"use client";

import React, { useState } from "react";
import {
  updateGeneralSettings,
  updateShippingSettings,
  updatePaymentSettings,
  updateEmailSettings,
  updateWhatsAppSettings,
} from "./actions";
import type {
  GeneralSettings,
  ShippingSettings,
  PaymentSettings,
  EmailSettings,
  PaymentMethodSetting,
  WhatsAppSettings,
} from "@/types/site-settings";

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
const labelClass = "block text-sm font-medium mb-1";
const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";

function SaveButton({ onClick }: { onClick: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={async () => {
          setSaving(true);
          setSaved(false);
          await onClick();
          setSaving(false);
          setSaved(true);
        }}
        disabled={saving}
        className="px-5 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
      {saved && <span className="text-sm text-green-600">Saved.</span>}
    </div>
  );
}

export default function SettingsPageClient({
  general: initialGeneral,
  shipping: initialShipping,
  payments: initialPayments,
  email: initialEmail,
  whatsapp: initialWhatsApp,
}: {
  general: GeneralSettings;
  shipping: ShippingSettings;
  payments: PaymentSettings;
  email: EmailSettings;
  whatsapp: WhatsAppSettings;
}) {
  const [general, setGeneral] = useState(initialGeneral);
  const [shipping, setShipping] = useState(initialShipping);
  const [payments, setPayments] = useState(initialPayments);
  const [email, setEmail] = useState(initialEmail);
  const [whatsapp, setWhatsapp] = useState(initialWhatsApp);

  const updatePaymentMethod = (key: keyof PaymentSettings, patch: Partial<PaymentMethodSetting>) => {
    setPayments((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <section className={cardClass}>
        <h2 className="font-semibold">General / Store information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Store name</label>
            <input className={inputClass} value={general.storeName} onChange={(e) => setGeneral({ ...general, storeName: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Store email</label>
            <input className={inputClass} value={general.storeEmail} onChange={(e) => setGeneral({ ...general, storeEmail: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Store phone</label>
            <input className={inputClass} value={general.storePhone ?? ""} onChange={(e) => setGeneral({ ...general, storePhone: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Store address</label>
            <input className={inputClass} value={general.storeAddress ?? ""} onChange={(e) => setGeneral({ ...general, storeAddress: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Currency code</label>
            <input className={inputClass} value={general.currency} onChange={(e) => setGeneral({ ...general, currency: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Currency symbol</label>
            <input className={inputClass} value={general.currencySymbol} onChange={(e) => setGeneral({ ...general, currencySymbol: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Tax rate (%)</label>
            <input
              type="number"
              className={inputClass}
              value={general.taxRatePercent}
              onChange={(e) => setGeneral({ ...general, taxRatePercent: Number(e.target.value) || 0 })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm mt-6">
            <input
              type="checkbox"
              checked={general.taxInclusive}
              onChange={(e) => setGeneral({ ...general, taxInclusive: e.target.checked })}
            />
            Prices include tax
          </label>
        </div>
        <div>
          <label className={labelClass}>SEO title</label>
          <input className={inputClass} value={general.seoTitle ?? ""} onChange={(e) => setGeneral({ ...general, seoTitle: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>SEO description</label>
          <textarea className={inputClass} rows={3} value={general.seoDescription ?? ""} onChange={(e) => setGeneral({ ...general, seoDescription: e.target.value })} />
        </div>
        <SaveButton onClick={() => updateGeneralSettings(general)} />
      </section>

      <section className={cardClass}>
        <h2 className="font-semibold">Shipping</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Flat rate</label>
            <input
              type="number"
              className={inputClass}
              value={shipping.flatRate}
              onChange={(e) => setShipping({ ...shipping, flatRate: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className={labelClass}>Free shipping threshold</label>
            <input
              type="number"
              className={inputClass}
              value={shipping.freeShippingThreshold ?? 0}
              onChange={(e) => setShipping({ ...shipping, freeShippingThreshold: Number(e.target.value) || undefined })}
            />
          </div>
          <div>
            <label className={labelClass}>Estimate - min days</label>
            <input
              type="number"
              className={inputClass}
              value={shipping.estimateDaysMin ?? 0}
              onChange={(e) => setShipping({ ...shipping, estimateDaysMin: Number(e.target.value) || undefined })}
            />
          </div>
          <div>
            <label className={labelClass}>Estimate - max days</label>
            <input
              type="number"
              className={inputClass}
              value={shipping.estimateDaysMax ?? 0}
              onChange={(e) => setShipping({ ...shipping, estimateDaysMax: Number(e.target.value) || undefined })}
            />
          </div>
        </div>
        <SaveButton onClick={() => updateShippingSettings(shipping)} />
      </section>

      <section className={cardClass}>
        <h2 className="font-semibold">Payment methods</h2>

        {(["cod", "bankTransfer", "jazzcash"] as const).map((key) => (
          <div key={key} className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium capitalize">
              <input
                type="checkbox"
                checked={payments[key].enabled}
                onChange={(e) => updatePaymentMethod(key, { enabled: e.target.checked })}
              />
              {key === "cod" ? "Cash on delivery" : key === "bankTransfer" ? "Bank transfer" : "JazzCash"}
            </label>
            {key !== "cod" && (
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  placeholder="Account name"
                  className={inputClass}
                  value={payments[key].accountName ?? ""}
                  onChange={(e) => updatePaymentMethod(key, { accountName: e.target.value })}
                />
                <input
                  placeholder="Account number"
                  className={inputClass}
                  value={payments[key].accountNumber ?? ""}
                  onChange={(e) => updatePaymentMethod(key, { accountNumber: e.target.value })}
                />
                {key === "bankTransfer" && (
                  <input
                    placeholder="Bank name"
                    className={inputClass}
                    value={payments.bankTransfer.bankName ?? ""}
                    onChange={(e) => updatePaymentMethod("bankTransfer", { bankName: e.target.value })}
                  />
                )}
              </div>
            )}
            <textarea
              placeholder="Instructions shown to customer at checkout"
              className={inputClass}
              rows={2}
              value={payments[key].instructions ?? ""}
              onChange={(e) => updatePaymentMethod(key, { instructions: e.target.value })}
            />
          </div>
        ))}
        <p className="text-xs text-neutral-500">
          JazzCash/Bank transfer are manual/instructions-based for now (customer submits a transaction
          reference, admin verifies via Orders). Real gateway APIs can be added later without changing this
          settings shape.
        </p>
        <SaveButton onClick={() => updatePaymentSettings(payments)} />
      </section>

      <section className={cardClass}>
        <h2 className="font-semibold">Email</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>From name</label>
            <input className={inputClass} value={email.fromName} onChange={(e) => setEmail({ ...email, fromName: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>From email</label>
            <input className={inputClass} value={email.fromEmail} onChange={(e) => setEmail({ ...email, fromEmail: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Support email</label>
            <input className={inputClass} value={email.supportEmail ?? ""} onChange={(e) => setEmail({ ...email, supportEmail: e.target.value })} />
          </div>
        </div>
        <SaveButton onClick={() => updateEmailSettings(email)} />
      </section>

      <section className={cardClass}>
        <h2 className="font-semibold">WhatsApp chat button</h2>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={whatsapp.enabled}
            onChange={(e) => setWhatsapp({ ...whatsapp, enabled: e.target.checked })}
          />
          Show floating WhatsApp button on the storefront
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>WhatsApp number (with country code, digits only)</label>
            <input
              placeholder="923001234567"
              className={inputClass}
              value={whatsapp.phoneNumber ?? ""}
              onChange={(e) => setWhatsapp({ ...whatsapp, phoneNumber: e.target.value.replace(/[^\d]/g, "") })}
            />
          </div>
          <div>
            <label className={labelClass}>Default message</label>
            <input
              className={inputClass}
              value={whatsapp.defaultMessage ?? ""}
              onChange={(e) => setWhatsapp({ ...whatsapp, defaultMessage: e.target.value })}
            />
          </div>
        </div>
        <p className="text-xs text-neutral-500">
          Opens a WhatsApp chat with this number pre-filled with the default message. Leave the number empty
          to keep the button hidden even if enabled above.
        </p>
        <SaveButton onClick={() => updateWhatsAppSettings(whatsapp)} />
      </section>
    </div>
  );
}
