"use client";

import React, { useState } from "react";
import Link from "next/link";
import AdminThemeSelector from "@/components/admin/AdminThemeSelector";
import CustomSelect from "@/components/admin/CustomSelect";
import { COUNTRY_OPTIONS, CURRENCY_OPTIONS, TIMEZONE_OPTIONS } from "@/lib/constants/location-options";
import {
  Cog6ToothIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  TruckIcon,
  CreditCardIcon,
  BanknotesIcon,
  DocumentCheckIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  BellIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
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
  "w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-xs hover:border-slate-300 dark:hover:border-slate-600";
const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5";
const cardClass =
  "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-6 transition-all";

// Pre-formatted options for CustomSelect dropdowns
const COUNTRY_SELECT_OPTIONS = COUNTRY_OPTIONS.map((c) => ({
  value: c.name,
  label: `${c.flag} ${c.name}`,
}));

const TIMEZONE_SELECT_OPTIONS = TIMEZONE_OPTIONS.map((t) => ({
  value: t.value,
  label: t.label,
}));

const CURRENCY_SELECT_OPTIONS = CURRENCY_OPTIONS.map((c) => ({
  value: c.code,
  label: `${c.code} (${c.symbol}) — ${c.name}`,
}));

const BORDER_RADIUS_OPTIONS = [
  { value: "none", label: "None (Square)" },
  { value: "sm", label: "Small (Curved)" },
  { value: "md", label: "Medium (Default)" },
  { value: "lg", label: "Large (Rounded)" },
  { value: "full", label: "Full (Pill)" },
];

const DIRECTION_OPTIONS = [
  { value: "ltr", label: "Left-to-right (LTR)" },
  { value: "rtl", label: "Right-to-left (RTL)" },
];

const TWITTER_CARD_OPTIONS = [
  { value: "summary", label: "Summary" },
  { value: "summary_large_image", label: "Summary with large image" },
];

const SITEMAP_FREQ_OPTIONS = [
  { value: "always", label: "Always" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "never", label: "Never" },
];

const COMMISSION_TYPE_OPTIONS = [
  { value: "none", label: "No commission (0%)" },
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed amount" },
];

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-6000 dark:text-primary-400 flex items-center justify-center font-bold shadow-xs border border-primary-100 dark:border-primary-900/50 shrink-0">
        <Icon className="w-5 h-5 stroke-[2]" />
      </div>
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function SaveButton({ onClick }: { onClick: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
        className="px-6 py-2.5 rounded-full bg-primary-6000 hover:bg-primary-700 text-white text-xs font-bold shadow-lg shadow-primary-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
      >
        {saving ? "Saving Changes…" : "Save Changes"}
      </button>
      {saved && (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
          ✓ Saved successfully
        </span>
      )}
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

const TAB_ICONS: Record<Tab, React.ComponentType<{ className?: string }>> = {
  General: Cog6ToothIcon,
  Branding: PaintBrushIcon,
  Localization: GlobeAltIcon,
  SEO: MagnifyingGlassIcon,
  Social: ShareIcon,
  Shipping: TruckIcon,
  Payments: CreditCardIcon,
  Commission: BanknotesIcon,
  Tax: DocumentCheckIcon,
  Email: EnvelopeIcon,
  "Email Templates": EnvelopeOpenIcon,
  WhatsApp: ChatBubbleLeftRightIcon,
  Integrations: PuzzlePieceIcon,
  Notifications: BellIcon,
  Backup: ArrowPathIcon,
  Advanced: AdjustmentsHorizontalIcon,
};

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
    <div className="w-full max-w-5xl space-y-6">
      {/* Theme Pill Tabs Header with Scroll Padding Fix */}
      <div className="w-full overflow-x-auto no-scrollbar p-2 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-900/5">
        <div className="flex items-center gap-2 min-w-max px-1">
          {TABS.map((t) => {
            const Icon = TAB_ICONS[t];
            const isActiveTab = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  isActiveTab
                    ? "bg-primary-6000 text-white shadow-md shadow-primary-500/25 ring-1 ring-primary-500/30 scale-[1.02]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActiveTab ? "stroke-[2.5]" : "opacity-75"}`} />
                <span>{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* General Tab */}
      {tab === "General" && (
        <section className={cardClass}>
          <SectionHeader icon={Cog6ToothIcon} title="General / Store Information" subtitle="Manage your primary store details, contact info, location, currency & tax settings." />
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
            <div className="sm:col-span-2">
              <label className={labelClass}>Store address</label>
              <input className={inputClass} value={general.storeAddress ?? ""} onChange={(e) => setGeneral({ ...general, storeAddress: e.target.value })} />
            </div>

            <div>
              <label className={labelClass}>Country</label>
              <CustomSelect
                value={general.country ?? "Pakistan"}
                onChange={(val) => setGeneral({ ...general, country: val })}
                options={COUNTRY_SELECT_OPTIONS}
              />
            </div>
            <div>
              <label className={labelClass}>Timezone</label>
              <CustomSelect
                value={general.timezone ?? "Asia/Karachi"}
                onChange={(val) => setGeneral({ ...general, timezone: val })}
                options={TIMEZONE_SELECT_OPTIONS}
              />
            </div>
            <div>
              <label className={labelClass}>Currency code</label>
              <CustomSelect
                value={general.currency ?? "PKR"}
                onChange={(val) => {
                  const selected = CURRENCY_OPTIONS.find((c) => c.code === val);
                  setGeneral({
                    ...general,
                    currency: val,
                    currencySymbol: selected ? selected.symbol : general.currencySymbol,
                  });
                }}
                options={CURRENCY_SELECT_OPTIONS}
              />
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
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-md text-primary-6000 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
                  checked={general.taxInclusive}
                  onChange={(e) => setGeneral({ ...general, taxInclusive: e.target.checked })}
                />
                Prices include tax
              </label>
            </div>
          </div>
          <SaveButton onClick={() => updateGeneralSettings(general)} />
        </section>
      )}

      {/* Branding Tab */}
      {tab === "Branding" && (
        <section className={cardClass}>
          <SectionHeader icon={PaintBrushIcon} title="Branding & Identity" subtitle="Configure logo URLs, brand colors, typography and store admin theme presets." />

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
              <div className="flex items-center gap-2">
                <input type="color" className="w-12 h-10 rounded-xl border border-slate-200 dark:border-slate-700 p-1 cursor-pointer bg-white dark:bg-slate-800" value={branding.primaryColor ?? "#000000"} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} />
                <input className={inputClass} value={branding.primaryColor ?? "#000000"} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Secondary color</label>
              <div className="flex items-center gap-2">
                <input type="color" className="w-12 h-10 rounded-xl border border-slate-200 dark:border-slate-700 p-1 cursor-pointer bg-white dark:bg-slate-800" value={branding.secondaryColor ?? "#000000"} onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })} />
                <input className={inputClass} value={branding.secondaryColor ?? "#000000"} onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Border radius</label>
              <CustomSelect
                value={branding.borderRadius ?? "md"}
                onChange={(val) => setBranding({ ...branding, borderRadius: val })}
                options={BORDER_RADIUS_OPTIONS}
              />
            </div>
            <div className="sm:col-span-2 pt-6 border-t border-slate-100 dark:border-slate-800">
              <AdminThemeSelector
                selectedTheme={branding.adminTheme || "indigo"}
                onSelect={(themeId) => setBranding({ ...branding, adminTheme: themeId })}
              />
            </div>
          </div>
          <SaveButton onClick={() => updateBrandingSettings(branding)} />
        </section>
      )}

      {/* Localization Tab */}
      {tab === "Localization" && (
        <section className={cardClass}>
          <SectionHeader icon={GlobeAltIcon} title="Localization & Regional" subtitle="Manage default language, date formats and text direction." />
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
              <CustomSelect
                value={localization.direction ?? "ltr"}
                onChange={(val) => setLocalization({ ...localization, direction: val as "ltr" | "rtl" })}
                options={DIRECTION_OPTIONS}
              />
            </div>
          </div>
          <SaveButton onClick={() => updateLocalizationSettings(localization)} />
        </section>
      )}

      {/* SEO Tab */}
      {tab === "SEO" && (
        <section className={cardClass}>
          <SectionHeader icon={MagnifyingGlassIcon} title="Search Engine Optimization (SEO)" subtitle="Optimize meta tags, Open Graph previews, and XML sitemap directives." />
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Meta title</label>
              <input className={inputClass} value={general.seoTitle ?? ""} onChange={(e) => setGeneral({ ...general, seoTitle: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Meta description</label>
              <textarea className={inputClass} rows={3} value={general.seoDescription ?? ""} onChange={(e) => setGeneral({ ...general, seoDescription: e.target.value })} />
            </div>
          </div>
          <SaveButton onClick={() => updateGeneralSettings(general)} />

          <hr className="border-slate-100 dark:border-slate-800" />

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
              <CustomSelect
                value={seo.twitterCard ?? "summary_large_image"}
                onChange={(val) => setSeo({ ...seo, twitterCard: val as SeoSettings["twitterCard"] })}
                options={TWITTER_CARD_OPTIONS}
              />
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
              <CustomSelect
                value={seo.sitemapChangeFrequency ?? "weekly"}
                onChange={(val) => setSeo({ ...seo, sitemapChangeFrequency: val as SeoSettings["sitemapChangeFrequency"] })}
                options={SITEMAP_FREQ_OPTIONS}
              />
            </div>
            <div>
              <label className={labelClass}>Sitemap priority (0 - 1.0)</label>
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

      {/* Social Tab */}
      {tab === "Social" && (
        <section className={cardClass}>
          <SectionHeader icon={ShareIcon} title="Social Media Profiles" subtitle="Connect official social channels displayed across website header/footer." />
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

      {/* Shipping Tab */}
      {tab === "Shipping" && (
        <section className={cardClass}>
          <SectionHeader icon={TruckIcon} title="Shipping & Delivery Rates" subtitle="Set standard flat rates, free shipping thresholds and estimated delivery times." />
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
              <label className={labelClass}>Estimated delivery - Minimum days</label>
              <input
                type="number"
                className={inputClass}
                value={shipping.estimateDaysMin ?? 0}
                onChange={(e) => setShipping({ ...shipping, estimateDaysMin: Number(e.target.value) || undefined })}
              />
            </div>
            <div>
              <label className={labelClass}>Estimated delivery - Maximum days</label>
              <input
                type="number"
                className={inputClass}
                value={shipping.estimateDaysMax ?? 0}
                onChange={(e) => setShipping({ ...shipping, estimateDaysMax: Number(e.target.value) || undefined })}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Order Tracking Page</h3>
                <p className="text-xs text-slate-500">Allow customers to track orders on your store web page (/order-tracking)</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all ${
                  (shipping.trackingEnabled ?? true)
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                }`}>
                  {(shipping.trackingEnabled ?? true) ? "Active (ON)" : "Disabled (OFF)"}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={shipping.trackingEnabled ?? true}
                    onChange={(e) => setShipping({ ...shipping, trackingEnabled: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            {shipping.trackingEnabled !== false && (
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className={labelClass}>Default Delivery / Courier Provider</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g. TCS, PostEx, Trax, Leopards"
                    value={shipping.defaultCourierName ?? ""}
                    onChange={(e) => setShipping({ ...shipping, defaultCourierName: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Allowed Tracking Modes</label>
                  <CustomSelect
                    value={shipping.trackingMode ?? "both"}
                    options={[
                      { value: "both", label: "Both 3rd-Party Courier & In-House Delivery" },
                      { value: "external_courier", label: "3rd-Party Courier Only" },
                      { value: "in_house", label: "In-House Delivery Only" },
                    ]}
                    onChange={(val) => setShipping({ ...shipping, trackingMode: val as any })}
                  />
                </div>
              </div>
            )}
          </div>

          <SaveButton onClick={() => updateShippingSettings(shipping)} />
        </section>
      )}

      {/* Payments Tab */}
      {tab === "Payments" && (
        <section className={cardClass}>
          <SectionHeader icon={CreditCardIcon} title="Payment Gateways & Options" subtitle="Enable supported checkout methods and customer transaction instructions." />

          {(["cod", "bankTransfer", "jazzcash"] as const).map((key) => (
            <div key={key} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 bg-slate-50/50 dark:bg-slate-800/30">
              <label className="flex items-center gap-3 text-sm font-extrabold text-slate-900 dark:text-slate-100 capitalize cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-md text-primary-6000 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
                  checked={payments[key].enabled}
                  onChange={(e) => updatePaymentMethod(key, { enabled: e.target.checked })}
                />
                {key === "cod" ? "Cash on delivery (COD)" : key === "bankTransfer" ? "Direct Bank Transfer" : "JazzCash / Mobile Wallet"}
              </label>
              {key !== "cod" && (
                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  <input
                    placeholder="Account Name"
                    className={inputClass}
                    value={payments[key].accountName ?? ""}
                    onChange={(e) => updatePaymentMethod(key, { accountName: e.target.value })}
                  />
                  <input
                    placeholder="Account Number / IBAN"
                    className={inputClass}
                    value={payments[key].accountNumber ?? ""}
                    onChange={(e) => updatePaymentMethod(key, { accountNumber: e.target.value })}
                  />
                  {key === "bankTransfer" && (
                    <input
                      placeholder="Bank Name"
                      className={inputClass}
                      value={payments.bankTransfer.bankName ?? ""}
                      onChange={(e) => updatePaymentMethod("bankTransfer", { bankName: e.target.value })}
                    />
                  )}
                </div>
              )}
              <textarea
                placeholder="Instructions shown to customer at checkout..."
                className={inputClass}
                rows={2}
                value={payments[key].instructions ?? ""}
                onChange={(e) => updatePaymentMethod(key, { instructions: e.target.value })}
              />
            </div>
          ))}
          <SaveButton onClick={() => updatePaymentSettings(payments)} />
        </section>
      )}

      {/* Commission Tab */}
      {tab === "Commission" && (
        <section className={cardClass}>
          <SectionHeader icon={BanknotesIcon} title="Commission Engine" subtitle="Configure transaction commission rates for order settlements." />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Commission type</label>
              <CustomSelect
                value={commission.type}
                onChange={(val) => setCommission({ ...commission, type: val as CommissionSettings["type"] })}
                options={COMMISSION_TYPE_OPTIONS}
              />
            </div>
            {commission.type !== "none" && (
              <div>
                <label className={labelClass}>
                  {commission.type === "percentage" ? "Percentage Rate (%)" : "Fixed Amount"}
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

      {/* Tax Tab */}
      {tab === "Tax" && (
        <section className={cardClass}>
          <SectionHeader icon={DocumentCheckIcon} title="Tax Metadata & Jurisdiction" subtitle="Registration details for official tax compliance and invoicing." />
          
          <label className="flex items-center gap-3 text-sm font-extrabold text-slate-900 dark:text-slate-100 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded-md text-primary-6000 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
              checked={tax.taxRegistered}
              onChange={(e) => setTax({ ...tax, taxRegistered: e.target.checked })}
            />
            Store is officially tax-registered
          </label>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tax ID / NTN / Registration Number</label>
              <input className={inputClass} value={tax.taxId ?? ""} onChange={(e) => setTax({ ...tax, taxId: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Tax Jurisdiction</label>
              <input className={inputClass} value={tax.taxJurisdiction ?? ""} onChange={(e) => setTax({ ...tax, taxJurisdiction: e.target.value })} />
            </div>
          </div>
          <SaveButton onClick={() => updateTaxSettings(tax)} />
        </section>
      )}

      {/* Email Tab */}
      {tab === "Email" && (
        <section className={cardClass}>
          <SectionHeader icon={EnvelopeIcon} title="Email Sender Info" subtitle="Sender details used for transactional email notifications." />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>From Name</label>
              <input className={inputClass} value={email.fromName} onChange={(e) => setEmail({ ...email, fromName: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>From Email Address</label>
              <input className={inputClass} value={email.fromEmail} onChange={(e) => setEmail({ ...email, fromEmail: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Support Email Address</label>
              <input className={inputClass} value={email.supportEmail ?? ""} onChange={(e) => setEmail({ ...email, supportEmail: e.target.value })} />
            </div>
          </div>
          <SaveButton onClick={() => updateEmailSettings(email)} />
        </section>
      )}

      {/* Email Templates Tab */}
      {tab === "Email Templates" && (
        <section className={cardClass}>
          <SectionHeader icon={EnvelopeOpenIcon} title="Email Templates" subtitle="Configure automated subjects and active status for customer triggers." />
          {(
            [
              ["welcome", "Welcome Email"],
              ["orderConfirmation", "Order Confirmation Email"],
              ["passwordReset", "Password Reset Email"],
              ["contact", "Contact Form Response"],
              ["newsletter", "Newsletter Subscription"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 bg-slate-50/50 dark:bg-slate-800/30">
              <label className="flex items-center gap-3 text-sm font-extrabold text-slate-900 dark:text-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-md text-primary-6000 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
                  checked={emailTemplates[key].enabled}
                  onChange={(e) => updateEmailTemplate(key, { enabled: e.target.checked })}
                />
                {label}
              </label>
              <input
                placeholder="Subject Line"
                className={inputClass}
                value={emailTemplates[key].subject}
                onChange={(e) => updateEmailTemplate(key, { subject: e.target.value })}
              />
            </div>
          ))}
          <SaveButton onClick={() => updateEmailTemplatesSettings(emailTemplates)} />
        </section>
      )}

      {/* WhatsApp Tab */}
      {tab === "WhatsApp" && (
        <section className={cardClass}>
          <SectionHeader icon={ChatBubbleLeftRightIcon} title="WhatsApp Support Widget" subtitle="Configure the floating WhatsApp button for instant storefront chat." />
          <label className="flex items-center gap-3 text-sm font-extrabold text-slate-900 dark:text-slate-100 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded-md text-primary-6000 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
              checked={whatsapp.enabled}
              onChange={(e) => setWhatsapp({ ...whatsapp, enabled: e.target.checked })}
            />
            Show floating WhatsApp widget on store pages
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>WhatsApp Number (Digits only with country code)</label>
              <input
                placeholder="923001234567"
                className={inputClass}
                value={whatsapp.phoneNumber ?? ""}
                onChange={(e) => setWhatsapp({ ...whatsapp, phoneNumber: e.target.value.replace(/[^\d]/g, "") })}
              />
            </div>
            <div>
              <label className={labelClass}>Default Greeting Message</label>
              <input
                className={inputClass}
                value={whatsapp.defaultMessage ?? ""}
                onChange={(e) => setWhatsapp({ ...whatsapp, defaultMessage: e.target.value })}
              />
            </div>
          </div>
          <SaveButton onClick={() => updateWhatsAppSettings(whatsapp)} />
        </section>
      )}

      {/* Integrations Tab */}
      {tab === "Integrations" && (
        <div className="space-y-6">
          <section className={cardClass}>
            <SectionHeader icon={PuzzlePieceIcon} title="Connected Services Status" subtitle="Overview of active third-party APIs and Cloud integrations." />
            <div className="grid sm:grid-cols-2 gap-4 text-sm font-medium">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="block text-xs font-bold text-slate-500 uppercase">Cloudinary Storage</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Configured</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="block text-xs font-bold text-slate-500 uppercase">Firebase Backend</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Configured</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="block text-xs font-bold text-slate-500 uppercase">Google Analytics (GA4)</span>
                {analytics.integrations.ga4MeasurementId ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Configured</span>
                ) : (
                  <span className="text-slate-400 font-bold">Not configured</span>
                )}
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="block text-xs font-bold text-slate-500 uppercase">Meta Pixel</span>
                {analytics.integrations.metaPixelId ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Configured</span>
                ) : (
                  <span className="text-slate-400 font-bold">Not configured</span>
                )}
              </div>
            </div>
            <Link href={"/admin/analytics/settings" as any} className="text-xs font-bold text-primary-6000 hover:underline inline-block">
              Manage GA4 / Meta Pixel Settings →
            </Link>
          </section>

          <section className={cardClass}>
            <SectionHeader icon={EnvelopeIcon} title="SMTP Server Config" subtitle="Custom mail server settings for transactional email routing." />
            <label className="flex items-center gap-3 text-sm font-extrabold text-slate-900 dark:text-slate-100 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded-md text-primary-6000 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
                checked={integrations.smtp.enabled}
                onChange={(e) => setIntegrations({ ...integrations, smtp: { ...integrations.smtp, enabled: e.target.checked } })}
              />
              Enable Custom SMTP Server
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <input placeholder="Host (e.g. smtp.mailgun.org)" className={inputClass} value={integrations.smtp.host ?? ""} onChange={(e) => setIntegrations({ ...integrations, smtp: { ...integrations.smtp, host: e.target.value } })} />
              <input
                placeholder="Port (e.g. 587)"
                type="number"
                className={inputClass}
                value={integrations.smtp.port ?? ""}
                onChange={(e) => setIntegrations({ ...integrations, smtp: { ...integrations.smtp, port: Number(e.target.value) || undefined } })}
              />
              <input placeholder="Username" className={inputClass} value={integrations.smtp.username ?? ""} onChange={(e) => setIntegrations({ ...integrations, smtp: { ...integrations.smtp, username: e.target.value } })} />
            </div>
          </section>

          <section className={cardClass}>
            <SectionHeader icon={PuzzlePieceIcon} title="Google reCAPTCHA" subtitle="Spam protection settings for form submissions." />
            <label className="flex items-center gap-3 text-sm font-extrabold text-slate-900 dark:text-slate-100 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded-md text-primary-6000 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
                checked={integrations.recaptcha.enabled}
                onChange={(e) => setIntegrations({ ...integrations, recaptcha: { ...integrations.recaptcha, enabled: e.target.checked } })}
              />
              Enable reCAPTCHA Validation
            </label>
            <input placeholder="Site Key" className={inputClass} value={integrations.recaptcha.siteKey ?? ""} onChange={(e) => setIntegrations({ ...integrations, recaptcha: { ...integrations.recaptcha, siteKey: e.target.value } })} />
            <SaveButton onClick={() => updateIntegrationsSettings(integrations)} />
          </section>
        </div>
      )}

      {/* Notifications Tab */}
      {tab === "Notifications" && (
        <section className={cardClass}>
          <SectionHeader icon={BellIcon} title="Notification Channels" subtitle="Select active communication channels for operational notifications." />
          <div className="grid sm:grid-cols-2 gap-4">
            {(
              [
                ["email", "Email Notifications"],
                ["push", "Push Notifications"],
                ["sms", "SMS Notifications"],
                ["whatsapp", "WhatsApp Alerts"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-sm font-extrabold text-slate-900 dark:text-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-md text-primary-6000 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
                  checked={notifications[key].enabled}
                  onChange={(e) => setNotifications({ ...notifications, [key]: { enabled: e.target.checked } })}
                />
                {label}
              </label>
            ))}
          </div>
          <SaveButton onClick={() => updateNotificationsSettings(notifications)} />
        </section>
      )}

      {/* Backup Tab */}
      {tab === "Backup" && (
        <section className={cardClass}>
          <SectionHeader icon={ArrowPathIcon} title="Data Backup & Export" subtitle="Export or import store catalog snapshots and configuration backups." />
          <div className="flex gap-3">
            <button
              type="button"
              disabled={backupBusy}
              onClick={() => handleBackup("export")}
              className="px-5 py-2.5 rounded-full bg-primary-6000 hover:bg-primary-700 text-white text-xs font-bold shadow-lg shadow-primary-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              Request Export Snapshot
            </button>
            <button
              type="button"
              disabled={backupBusy}
              onClick={() => handleBackup("import")}
              className="px-5 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              Request Import Snapshot
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((record) => (
              <div key={record.id} className="py-3 text-sm flex items-center justify-between">
                <span className="capitalize font-bold text-slate-900 dark:text-slate-100">{record.type}</span>
                <span className="text-slate-500 capitalize text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">{record.status}</span>
                <span className="text-xs text-slate-400">
                  {record.createdAt ? new Date(record.createdAt).toLocaleString() : ""}
                </span>
              </div>
            ))}
            {!history.length && <p className="text-xs text-slate-500 py-3">No backup history available.</p>}
          </div>
        </section>
      )}

      {/* Advanced Tab */}
      {tab === "Advanced" && (
        <section className={cardClass}>
          <SectionHeader icon={AdjustmentsHorizontalIcon} title="Advanced Settings" subtitle="System controls, maintenance mode and cache directives." />
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm font-extrabold text-slate-900 dark:text-slate-100 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded-md text-primary-6000 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
                checked={advanced.maintenanceMode}
                onChange={(e) => setAdvanced({ ...advanced, maintenanceMode: e.target.checked })}
              />
              Maintenance Mode
            </label>
            <label className="flex items-center gap-3 text-sm font-extrabold text-slate-900 dark:text-slate-100 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded-md text-primary-6000 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
                checked={advanced.debugFlag}
                onChange={(e) => setAdvanced({ ...advanced, debugFlag: e.target.checked })}
              />
              Debug Logging Flag
            </label>
            <label className="flex items-center gap-3 text-sm font-extrabold text-slate-900 dark:text-slate-100 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded-md text-primary-6000 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
                checked={advanced.themeRebuildFlag}
                onChange={(e) => setAdvanced({ ...advanced, themeRebuildFlag: e.target.checked })}
              />
              Theme Rebuild Flag
            </label>
            <div>
              <label className={labelClass}>Cache Version Tag</label>
              <input className={inputClass} value={advanced.cacheVersion} onChange={(e) => setAdvanced({ ...advanced, cacheVersion: e.target.value })} />
            </div>
          </div>
          <SaveButton onClick={() => updateAdvancedSettings(advanced)} />
        </section>
      )}
    </div>
  );
}
