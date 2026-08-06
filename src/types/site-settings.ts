export interface GeneralSettings {
  storeName: string;
  /** Legal/registered business name, distinct from the public-facing storeName. */
  businessName?: string;
  storeEmail: string;
  storePhone?: string;
  storeAddress?: string;
  timezone?: string;
  country?: string;
  currency: string;
  currencySymbol: string;
  taxRatePercent: number;
  taxInclusive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    /** Field name kept for compatibility - labeled "X" in the UI. */
    twitter?: string;
    tiktok?: string;
    linkedin?: string;
    youtube?: string;
  };
}

/** Basic brand-identity metadata - deliberately independent of the Theme Builder's
 * `themes` collection (colors/typography/buttons/layout for the full storefront theme).
 * This is a lighter set of brand basics (e.g. for emails, loading screens, social previews). */
export interface BrandingSettings {
  logoUrl?: string;
  faviconUrl?: string;
  loadingLogoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  borderRadius?: string;
}

/** Currency stays owned by GeneralSettings - not duplicated here. */
export interface LocalizationSettings {
  language?: string;
  dateFormat?: string;
  numberFormat?: string;
  direction?: "ltr" | "rtl";
}

/** Additive to GeneralSettings' existing seoTitle/seoDescription. */
export interface SeoSettings {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: "summary" | "summary_large_image";
  robots?: string;
  canonicalUrl?: string;
  sitemapChangeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  sitemapPriority?: number;
}

export interface EmailTemplateMeta {
  subject: string;
  enabled: boolean;
}

/** Editable metadata only (subject line + on/off) - no HTML body/engine, no real SMTP. */
export interface EmailTemplatesSettings {
  welcome: EmailTemplateMeta;
  orderConfirmation: EmailTemplateMeta;
  passwordReset: EmailTemplateMeta;
  contact: EmailTemplateMeta;
  newsletter: EmailTemplateMeta;
}

/** Cloudinary/Firebase/Google Analytics/GTM/Meta Pixel are NOT stored here - Cloudinary/
 * Firebase are shown read-only from existing config, and GA/GTM/Meta Pixel already live in
 * AnalyticsSettings (see analytics/settings). This only owns the genuinely new integrations. */
export interface IntegrationsSettings {
  smtp: { host?: string; port?: number; username?: string; enabled: boolean };
  recaptcha: { siteKey?: string; enabled: boolean };
}

/** Simple channel-preference toggles for a future notification-dispatch system - distinct
 * from and doesn't touch the existing, more detailed WhatsAppSettings chat-button config. */
export interface NotificationsSettings {
  email: { enabled: boolean };
  push: { enabled: boolean };
  sms: { enabled: boolean };
  whatsapp: { enabled: boolean };
}

/** Metadata only - no flag here is wired to real behavior yet (no maintenance-mode gate,
 * no real cache-busting, no real theme rebuild trigger). */
export interface AdvancedSettings {
  maintenanceMode: boolean;
  cacheVersion: string;
  debugFlag: boolean;
  themeRebuildFlag: boolean;
}

export interface ShippingSettings {
  flatRate: number;
  freeShippingThreshold?: number;
  estimateDaysMin?: number;
  estimateDaysMax?: number;
}

export interface PaymentMethodSetting {
  enabled: boolean;
  instructions?: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
}

export interface PaymentSettings {
  cod: PaymentMethodSetting;
  bankTransfer: PaymentMethodSetting;
  jazzcash: PaymentMethodSetting;
}

export interface EmailSettings {
  fromName: string;
  fromEmail: string;
  supportEmail?: string;
}

export interface AnalyticsIntegrationSettings {
  ga4MeasurementId?: string;
  gtmContainerId?: string;
  metaPixelId?: string;
  metaConversionApiToken?: string;
  tiktokPixelId?: string;
  googleAdsConversionId?: string;
  googleAdsConversionLabel?: string;
  microsoftClarityId?: string;
  hotjarId?: string;
  googleSearchConsoleVerification?: string;
}

export interface AnalyticsAlertSettings {
  trafficSpikePercent: number;
  salesSpikePercent: number;
  conversionDropPercent: number;
}

export interface AnalyticsSettings {
  integrations: AnalyticsIntegrationSettings;
  alerts: AnalyticsAlertSettings;
}

export interface WhatsAppSettings {
  enabled: boolean;
  /** Digits only, with country code, no "+" or spaces (e.g. 923001234567). */
  phoneNumber?: string;
  defaultMessage?: string;
}

/** Store-level Commission Engine config - "percentage"/"fixed" apply to every payment
 * transaction; "none" means the platform doesn't take a per-transaction cut for this
 * store (e.g. a one-time/flat subscription plan handles platform revenue instead). */
export interface CommissionSettings {
  type: "percentage" | "fixed" | "none";
  value: number;
}

/** Architecture-only metadata - not wired into any real tax calculation. The
 * existing GeneralSettings.taxRatePercent/taxInclusive remain the only fields
 * Checkout's tax math actually reads; this is purely registration/jurisdiction
 * metadata for a future invoicing/reporting phase. */
export interface TaxSettings {
  taxId?: string;
  taxJurisdiction?: string;
  taxRegistered: boolean;
}
