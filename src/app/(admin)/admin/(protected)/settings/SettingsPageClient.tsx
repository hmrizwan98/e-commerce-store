"use client";

import React, { useState } from "react";
import Link from "next/link";
import AdminThemeSelector from "@/components/admin/AdminThemeSelector";
import {
  updateGeneralSettings,
  updateShippingSettings,
  updatePaymentSettings,
  updateEmailSettings,
  updateWhatsAppSettings,
  updateBrandingSettings,
  updateLocalizationSettings,
  updateSeoSettings,
  updateEmailTemplatesSettings,
  updateIntegrationsSettings,
  updateNotificationsSettings,
  updateAdvancedSettings,
  updateCommissionSettings,
  updateTaxSettings,
  requestBackupExport,
  requestBackupImport,
} from "./actions";
import type {
  GeneralSettings,
  ShippingSettings,
  PaymentSettings,
  EmailSettings,
  PaymentMethodSetting,
  WhatsAppSettings,
  BrandingSettings,
  LocalizationSettings,
  SeoSettings,
  EmailTemplatesSettings,
  EmailTemplateMeta,
  IntegrationsSettings,
  NotificationsSettings,
  AdvancedSettings,
  AnalyticsSettings,
  CommissionSettings,
  TaxSettings,
} from "@/types/site-settings";
import type { BackupRecord } from "@/types/backup-record";

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

const TABS = [
  "General",
  "Branding",
  "Localization",
  "SEO",
  "Social",
  "Shipping",
  "Payments",
  "Commission",
  "Tax",
  "Email",
  "Email Templates",
  "WhatsApp",
  "Integrations",
  "Notifications",
  "Backup",
  "Advanced",
] as const;
type Tab = (typeof TABS)[number];

export default function SettingsPageClient({
  general: initialGeneral,
  shipping: initialShipping,
  payments: initialPayments,
  email: initialEmail,
  whatsapp: initialWhatsApp,
  branding: initialBranding,
  localization: initialLocalization,
  seo: initialSeo,
  emailTemplates: initialEmailTemplates,
  integrations: initialIntegrations,
  notifications: initialNotifications,
  advanced: initialAdvanced,
  analytics,
  backupHistory,
  commission: initialCommission,
  tax: initialTax,
}: {
  general: GeneralSettings;
  shipping: ShippingSettings;
  payments: PaymentSettings;
  email: EmailSettings;
  whatsapp: WhatsAppSettings;
  branding: BrandingSettings;
  localization: LocalizationSettings;
  seo: SeoSettings;
  emailTemplates: EmailTemplatesSettings;
  integrations: IntegrationsSettings;
  notifications: NotificationsSettings;
  advanced: AdvancedSettings;
  analytics: AnalyticsSettings;
  backupHistory: BackupRecord[];
  commission: CommissionSettings;
  tax: TaxSettings;
}) {
  const [tab, setTab] = useState<Tab>("General");

  const [general, setGeneral] = useState(initialGeneral);
  const [shipping, setShipping] = useState(initialShipping);
  const [payments, setPayments] = useState(initialPayments);
  const [email, setEmail] = useState(initialEmail);
  const [whatsapp, setWhatsapp] = useState(initialWhatsApp);
  const [branding, setBranding] = useState(initialBranding);
  const [localization, setLocalization] = useState(initialLocalization);
  const [seo, setSeo] = useState(initialSeo);
  const [emailTemplates, setEmailTemplates] = useState(initialEmailTemplates);
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [advanced, setAdvanced] = useState(initialAdvanced);
  const [history, setHistory] = useState(backupHistory);
  const [backupBusy, setBackupBusy] = useState(false);
  const [commission, setCommission] = useState(initialCommission);
  const [tax, setTax] = useState(initialTax);

  const updatePaymentMethod = (key: keyof PaymentSettings, patch: Partial<PaymentMethodSetting>) => {
    setPayments((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const updateSocialLink = (key: keyof NonNullable<GeneralSettings["socialLinks"]>, value: string) => {
    setGeneral((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));
  };

  const updateEmailTemplate = (key: keyof EmailTemplatesSettings, patch: Partial<EmailTemplateMeta>) => {
    setEmailTemplates((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const handleBackup = async (kind: "export" | "import") => {
    setBackupBusy(true);
    try {
      if (kind === "export") await requestBackupExport();
      else await requestBackupImport();
      setHistory((prev) => [
        { id: `pending-${Date.now()}`, type: kind, status: "queued", createdAt: Date.now() },
        ...prev,
      ]);
    } finally {
      setBackupBusy(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap gap-1 border-b border-neutral-200 dark:border-neutral-800 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              tab === t
                ? "border-primary-6000 text-primary-6000"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "General" && (
        <section className={cardClass}>
          <h2 className="font-semibold">General / Store information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Store name</label>
              <input className={inputClass} value={general.storeName} onChange={(e) => setGeneral({ ...general, storeName: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Business name</label>
              <input className={inputClass} value={general.businessName ?? ""} onChange={(e) => setGeneral({ ...general, businessName: e.target.value })} />
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
              <label className={labelClass}>Country</label>
              <input className={inputClass} value={general.country ?? ""} onChange={(e) => setGeneral({ ...general, country: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Timezone</label>
              <input className={inputClass} value={general.timezone ?? ""} onChange={(e) => setGeneral({ ...general, timezone: e.target.value })} />
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
          <SaveButton onClick={() => updateGeneralSettings(general)} />
        </section>
      )}

      {tab === "Branding" && (
        <section className={cardClass}>
          <h2 className="font-semibold">Branding</h2>
          <p className="text-xs text-neutral-500">
            Basic brand identity (used for emails/loading screens/social previews) - independent
            of the full visual Theme Builder at <code>/admin/theme</code>.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Logo URL</label>
              <input className={inputClass} value={branding.logoUrl ?? ""} onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Favicon URL</label>
              <input className={inputClass} value={branding.faviconUrl ?? ""} onChange={(e) => setBranding({ ...branding, faviconUrl: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Loading logo URL</label>
              <input className={inputClass} value={branding.loadingLogoUrl ?? ""} onChange={(e) => setBranding({ ...branding, loadingLogoUrl: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Font family</label>
              <input className={inputClass} value={branding.fontFamily ?? ""} onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Primary color</label>
              <input type="color" className={`${inputClass} h-10`} value={branding.primaryColor ?? "#000000"} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Secondary color</label>
              <input type="color" className={`${inputClass} h-10`} value={branding.secondaryColor ?? "#000000"} onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Border radius</label>
              <select className={inputClass} value={branding.borderRadius ?? "md"} onChange={(e) => setBranding({ ...branding, borderRadius: e.target.value })}>
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="full">Full</option>
              </select>
            </div>
            <div className="sm:col-span-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <AdminThemeSelector
                selectedTheme={branding.adminTheme || "indigo"}
                onSelect={(themeId) => setBranding({ ...branding, adminTheme: themeId })}
              />
            </div>
          </div>
          <SaveButton onClick={() => updateBrandingSettings(branding)} />
        </section>
      )}

      {tab === "Localization" && (
        <section className={cardClass}>
          <h2 className="font-semibold">Localization</h2>
          <p className="text-xs text-neutral-500">Currency is managed on the General tab.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Language</label>
              <input className={inputClass} value={localization.language ?? ""} onChange={(e) => setLocalization({ ...localization, language: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Date format</label>
              <input className={inputClass} value={localization.dateFormat ?? ""} onChange={(e) => setLocalization({ ...localization, dateFormat: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Number format</label>
              <input className={inputClass} value={localization.numberFormat ?? ""} onChange={(e) => setLocalization({ ...localization, numberFormat: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Text direction</label>
              <select className={inputClass} value={localization.direction ?? "ltr"} onChange={(e) => setLocalization({ ...localization, direction: e.target.value as "ltr" | "rtl" })}>
                <option value="ltr">Left-to-right (LTR)</option>
                <option value="rtl">Right-to-left (RTL)</option>
              </select>
            </div>
          </div>
          <SaveButton onClick={() => updateLocalizationSettings(localization)} />
        </section>
      )}

      {tab === "SEO" && (
        <section className={cardClass}>
          <h2 className="font-semibold">SEO</h2>
          <div>
            <label className={labelClass}>Meta title</label>
            <input className={inputClass} value={general.seoTitle ?? ""} onChange={(e) => setGeneral({ ...general, seoTitle: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Meta description</label>
            <textarea className={inputClass} rows={3} value={general.seoDescription ?? ""} onChange={(e) => setGeneral({ ...general, seoDescription: e.target.value })} />
          </div>
          <SaveButton onClick={() => updateGeneralSettings(general)} />

          <hr className="border-neutral-200 dark:border-neutral-800" />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Open Graph title</label>
              <input className={inputClass} value={seo.ogTitle ?? ""} onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Open Graph image URL</label>
              <input className={inputClass} value={seo.ogImage ?? ""} onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Open Graph description</label>
              <textarea className={inputClass} rows={2} value={seo.ogDescription ?? ""} onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Twitter card type</label>
              <select className={inputClass} value={seo.twitterCard ?? "summary_large_image"} onChange={(e) => setSeo({ ...seo, twitterCard: e.target.value as SeoSettings["twitterCard"] })}>
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary with large image</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Robots directive</label>
              <input className={inputClass} value={seo.robots ?? ""} onChange={(e) => setSeo({ ...seo, robots: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Canonical URL</label>
              <input className={inputClass} value={seo.canonicalUrl ?? ""} onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Sitemap change frequency</label>
              <select
                className={inputClass}
                value={seo.sitemapChangeFrequency ?? "weekly"}
                onChange={(e) => setSeo({ ...seo, sitemapChangeFrequency: e.target.value as SeoSettings["sitemapChangeFrequency"] })}
              >
                {(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"] as const).map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Sitemap priority (0-1)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={1}
                className={inputClass}
                value={seo.sitemapPriority ?? 0.5}
                onChange={(e) => setSeo({ ...seo, sitemapPriority: Math.min(1, Math.max(0, Number(e.target.value) || 0)) })}
              />
            </div>
          </div>
          <SaveButton onClick={() => updateSeoSettings(seo)} />
        </section>
      )}

      {tab === "Social" && (
        <section className={cardClass}>
          <h2 className="font-semibold">Social links</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Facebook</label>
              <input className={inputClass} value={general.socialLinks?.facebook ?? ""} onChange={(e) => updateSocialLink("facebook", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Instagram</label>
              <input className={inputClass} value={general.socialLinks?.instagram ?? ""} onChange={(e) => updateSocialLink("instagram", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>TikTok</label>
              <input className={inputClass} value={general.socialLinks?.tiktok ?? ""} onChange={(e) => updateSocialLink("tiktok", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>LinkedIn</label>
              <input className={inputClass} value={general.socialLinks?.linkedin ?? ""} onChange={(e) => updateSocialLink("linkedin", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>X (Twitter)</label>
              <input className={inputClass} value={general.socialLinks?.twitter ?? ""} onChange={(e) => updateSocialLink("twitter", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>YouTube</label>
              <input className={inputClass} value={general.socialLinks?.youtube ?? ""} onChange={(e) => updateSocialLink("youtube", e.target.value)} />
            </div>
          </div>
          <SaveButton onClick={() => updateGeneralSettings(general)} />
        </section>
      )}

      {tab === "Shipping" && (
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
      )}

      {tab === "Payments" && (
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
      )}

      {tab === "Commission" && (
        <section className={cardClass}>
          <h2 className="font-semibold">Commission Engine</h2>
          <p className="text-xs text-neutral-500">
            Store-level configuration only - applied to each payment transaction logged in
            the Transaction Ledger (see Finance). &ldquo;None&rdquo; means the platform takes no
            per-transaction cut for this store.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Commission type</label>
              <select
                className={inputClass}
                value={commission.type}
                onChange={(e) => setCommission({ ...commission, type: e.target.value as CommissionSettings["type"] })}
              >
                <option value="none">No commission (one-time purchase)</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>
            {commission.type !== "none" && (
              <div>
                <label className={labelClass}>
                  {commission.type === "percentage" ? "Percentage (%)" : "Fixed amount"}
                </label>
                <input
                  type="number"
                  className={inputClass}
                  value={commission.value}
                  onChange={(e) => setCommission({ ...commission, value: Number(e.target.value) || 0 })}
                />
              </div>
            )}
          </div>
          <SaveButton onClick={() => updateCommissionSettings(commission)} />
        </section>
      )}

      {tab === "Tax" && (
        <section className={cardClass}>
          <h2 className="font-semibold">Tax Metadata</h2>
          <p className="text-xs text-neutral-500">
            Architecture only - registration/jurisdiction metadata for a future
            invoicing/reporting phase. The actual tax rate used at checkout is still the
            General tab&apos;s &ldquo;Tax rate (%)&rdquo;/&ldquo;Prices include tax&rdquo; fields, unchanged.
          </p>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={tax.taxRegistered}
              onChange={(e) => setTax({ ...tax, taxRegistered: e.target.checked })}
            />
            Store is tax-registered
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tax ID / registration number</label>
              <input className={inputClass} value={tax.taxId ?? ""} onChange={(e) => setTax({ ...tax, taxId: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Tax jurisdiction</label>
              <input className={inputClass} value={tax.taxJurisdiction ?? ""} onChange={(e) => setTax({ ...tax, taxJurisdiction: e.target.value })} />
            </div>
          </div>
          <SaveButton onClick={() => updateTaxSettings(tax)} />
        </section>
      )}

      {tab === "Email" && (
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
      )}

      {tab === "Email Templates" && (
        <section className={cardClass}>
          <h2 className="font-semibold">Email templates</h2>
          <p className="text-xs text-neutral-500">
            Subject line + on/off only - no HTML body editor or real sending yet (see Integrations
            → SMTP, not connected).
          </p>
          {(
            [
              ["welcome", "Welcome"],
              ["orderConfirmation", "Order Confirmation"],
              ["passwordReset", "Password Reset"],
              ["contact", "Contact"],
              ["newsletter", "Newsletter"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={emailTemplates[key].enabled}
                  onChange={(e) => updateEmailTemplate(key, { enabled: e.target.checked })}
                />
                {label}
              </label>
              <input
                placeholder="Subject line"
                className={inputClass}
                value={emailTemplates[key].subject}
                onChange={(e) => updateEmailTemplate(key, { subject: e.target.value })}
              />
            </div>
          ))}
          <SaveButton onClick={() => updateEmailTemplatesSettings(emailTemplates)} />
        </section>
      )}

      {tab === "WhatsApp" && (
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
      )}

      {tab === "Integrations" && (
        <div className="space-y-6">
          <section className={cardClass}>
            <h2 className="font-semibold">Status</h2>
            <p className="text-xs text-neutral-500">Read-only. No external service is connected from here.</p>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-neutral-500">Cloudinary</span>
                <span className="text-green-600">Configured</span> (asset folders provisioned)
              </div>
              <div>
                <span className="block text-neutral-500">Firebase</span>
                <span className="text-green-600">Configured</span> (project connected)
              </div>
              <div>
                <span className="block text-neutral-500">Google Analytics</span>
                {analytics.integrations.ga4MeasurementId ? (
                  <span className="text-green-600">Configured</span>
                ) : (
                  <span className="text-neutral-500">Not configured</span>
                )}
              </div>
              <div>
                <span className="block text-neutral-500">Google Tag Manager</span>
                {analytics.integrations.gtmContainerId ? (
                  <span className="text-green-600">Configured</span>
                ) : (
                  <span className="text-neutral-500">Not configured</span>
                )}
              </div>
              <div>
                <span className="block text-neutral-500">Meta Pixel</span>
                {analytics.integrations.metaPixelId ? (
                  <span className="text-green-600">Configured</span>
                ) : (
                  <span className="text-neutral-500">Not configured</span>
                )}
              </div>
            </div>
            <Link href={"/admin/analytics/settings" as any} className="text-sm font-medium hover:underline">
              Manage Google Analytics / GTM / Meta Pixel in Analytics Settings →
            </Link>
          </section>

          <section className={cardClass}>
            <h2 className="font-semibold">SMTP</h2>
            <p className="text-xs text-neutral-500">Metadata only - no real email is sent yet.</p>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={integrations.smtp.enabled}
                onChange={(e) => setIntegrations({ ...integrations, smtp: { ...integrations.smtp, enabled: e.target.checked } })}
              />
              Enabled
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <input placeholder="Host" className={inputClass} value={integrations.smtp.host ?? ""} onChange={(e) => setIntegrations({ ...integrations, smtp: { ...integrations.smtp, host: e.target.value } })} />
              <input
                placeholder="Port"
                type="number"
                className={inputClass}
                value={integrations.smtp.port ?? ""}
                onChange={(e) => setIntegrations({ ...integrations, smtp: { ...integrations.smtp, port: Number(e.target.value) || undefined } })}
              />
              <input placeholder="Username" className={inputClass} value={integrations.smtp.username ?? ""} onChange={(e) => setIntegrations({ ...integrations, smtp: { ...integrations.smtp, username: e.target.value } })} />
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="font-semibold">reCAPTCHA</h2>
            <p className="text-xs text-neutral-500">Metadata only - no real verification is performed yet.</p>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={integrations.recaptcha.enabled}
                onChange={(e) => setIntegrations({ ...integrations, recaptcha: { ...integrations.recaptcha, enabled: e.target.checked } })}
              />
              Enabled
            </label>
            <input placeholder="Site key" className={inputClass} value={integrations.recaptcha.siteKey ?? ""} onChange={(e) => setIntegrations({ ...integrations, recaptcha: { ...integrations.recaptcha, siteKey: e.target.value } })} />
          </section>

          <SaveButton onClick={() => updateIntegrationsSettings(integrations)} />
        </div>
      )}

      {tab === "Notifications" && (
        <section className={cardClass}>
          <h2 className="font-semibold">Notification channels</h2>
          <p className="text-xs text-neutral-500">
            Channel preferences for a future notification-dispatch system - independent of the
            WhatsApp chat-button config on the WhatsApp tab.
          </p>
          {(
            [
              ["email", "Email"],
              ["push", "Push"],
              ["sms", "SMS"],
              ["whatsapp", "WhatsApp"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={notifications[key].enabled}
                onChange={(e) => setNotifications({ ...notifications, [key]: { enabled: e.target.checked } })}
              />
              {label}
            </label>
          ))}
          <SaveButton onClick={() => updateNotificationsSettings(notifications)} />
        </section>
      )}

      {tab === "Backup" && (
        <section className={cardClass}>
          <h2 className="font-semibold">Backup</h2>
          <p className="text-xs text-neutral-500">
            Architecture only - requests are queued for a future export/import engine; nothing is
            produced yet.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={backupBusy}
              onClick={() => handleBackup("export")}
              className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium disabled:opacity-50"
            >
              Request export
            </button>
            <button
              type="button"
              disabled={backupBusy}
              onClick={() => handleBackup("import")}
              className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium disabled:opacity-50"
            >
              Request import
            </button>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {history.map((record) => (
              <div key={record.id} className="py-2 text-sm flex items-center justify-between">
                <span className="capitalize">{record.type}</span>
                <span className="text-neutral-500 capitalize">{record.status}</span>
                <span className="text-xs text-neutral-500">
                  {record.createdAt ? new Date(record.createdAt).toLocaleString() : ""}
                </span>
              </div>
            ))}
            {!history.length && <p className="text-sm text-neutral-500 py-2">No backup activity yet.</p>}
          </div>
        </section>
      )}

      {tab === "Advanced" && (
        <section className={cardClass}>
          <h2 className="font-semibold">Advanced</h2>
          <p className="text-xs text-neutral-500">
            Metadata only - none of these flags are wired to real behavior yet.
          </p>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={advanced.maintenanceMode}
              onChange={(e) => setAdvanced({ ...advanced, maintenanceMode: e.target.checked })}
            />
            Maintenance mode
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={advanced.debugFlag}
              onChange={(e) => setAdvanced({ ...advanced, debugFlag: e.target.checked })}
            />
            Debug flag
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={advanced.themeRebuildFlag}
              onChange={(e) => setAdvanced({ ...advanced, themeRebuildFlag: e.target.checked })}
            />
            Theme rebuild flag
          </label>
          <div>
            <label className={labelClass}>Cache version</label>
            <input className={inputClass} value={advanced.cacheVersion} onChange={(e) => setAdvanced({ ...advanced, cacheVersion: e.target.value })} />
          </div>
          <SaveButton onClick={() => updateAdvancedSettings(advanced)} />
        </section>
      )}
    </div>
  );
}
