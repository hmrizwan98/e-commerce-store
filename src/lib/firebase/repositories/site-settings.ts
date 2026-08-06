import "server-only";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import type {
  GeneralSettings,
  PaymentSettings,
  ShippingSettings,
  EmailSettings,
  AnalyticsSettings,
  WhatsAppSettings,
  BrandingSettings,
  LocalizationSettings,
  SeoSettings,
  EmailTemplatesSettings,
  IntegrationsSettings,
  NotificationsSettings,
  AdvancedSettings,
  CommissionSettings,
  TaxSettings,
} from "@/types/site-settings";

const COLLECTION = "siteSettings";

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  storeName: "Tradz Glint",
  storeEmail: "support@example.com",
  currency: "PKR",
  currencySymbol: "Rs",
  taxRatePercent: 0,
  taxInclusive: false,
};

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  flatRate: 5,
  freeShippingThreshold: 100,
  estimateDaysMin: 3,
  estimateDaysMax: 7,
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  cod: { enabled: true, instructions: "Pay cash when your order arrives." },
  bankTransfer: { enabled: false, instructions: "", accountName: "", accountNumber: "", bankName: "" },
  jazzcash: { enabled: false, instructions: "", accountName: "", accountNumber: "" },
};

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  fromName: "Tradz Glint",
  fromEmail: "no-reply@example.com",
};

export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettings = {
  integrations: {},
  alerts: {
    trafficSpikePercent: 50,
    salesSpikePercent: 50,
    conversionDropPercent: 30,
  },
};

export const DEFAULT_WHATSAPP_SETTINGS: WhatsAppSettings = {
  enabled: false,
  defaultMessage: "Hi! I have a question about your products.",
};

export const DEFAULT_BRANDING_SETTINGS: BrandingSettings = {
  primaryColor: "#0284c7",
  secondaryColor: "#16a34a",
  fontFamily: "poppins",
  borderRadius: "md",
};

export const DEFAULT_LOCALIZATION_SETTINGS: LocalizationSettings = {
  language: "en",
  dateFormat: "MMM D, YYYY",
  numberFormat: "1,234.56",
  direction: "ltr",
};

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  twitterCard: "summary_large_image",
  robots: "index, follow",
  sitemapChangeFrequency: "weekly",
  sitemapPriority: 0.5,
};

export const DEFAULT_EMAIL_TEMPLATES_SETTINGS: EmailTemplatesSettings = {
  welcome: { subject: "Welcome to {{storeName}}!", enabled: true },
  orderConfirmation: { subject: "Your order {{orderNumber}} is confirmed", enabled: true },
  passwordReset: { subject: "Reset your password", enabled: true },
  contact: { subject: "We received your message", enabled: true },
  newsletter: { subject: "What's new at {{storeName}}", enabled: false },
};

export const DEFAULT_INTEGRATIONS_SETTINGS: IntegrationsSettings = {
  smtp: { enabled: false },
  recaptcha: { enabled: false },
};

export const DEFAULT_NOTIFICATIONS_SETTINGS: NotificationsSettings = {
  email: { enabled: true },
  push: { enabled: false },
  sms: { enabled: false },
  whatsapp: { enabled: false },
};

export const DEFAULT_ADVANCED_SETTINGS: AdvancedSettings = {
  maintenanceMode: false,
  cacheVersion: "1",
  debugFlag: false,
  themeRebuildFlag: false,
};

export const DEFAULT_COMMISSION_SETTINGS: CommissionSettings = {
  type: "none",
  value: 0,
};

export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  taxRegistered: false,
};

export async function getGeneralSettings(): Promise<GeneralSettings> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc("general").get();
  return doc.exists ? { ...DEFAULT_GENERAL_SETTINGS, ...doc.data() } : DEFAULT_GENERAL_SETTINGS;
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc("shipping").get();
  return doc.exists ? { ...DEFAULT_SHIPPING_SETTINGS, ...doc.data() } : DEFAULT_SHIPPING_SETTINGS;
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc("payments").get();
  return doc.exists
    ? ({ ...DEFAULT_PAYMENT_SETTINGS, ...doc.data() } as PaymentSettings)
    : DEFAULT_PAYMENT_SETTINGS;
}

export async function getEmailSettings(): Promise<EmailSettings> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc("email").get();
  return doc.exists ? { ...DEFAULT_EMAIL_SETTINGS, ...doc.data() } : DEFAULT_EMAIL_SETTINGS;
}

export async function getAnalyticsSettings(): Promise<AnalyticsSettings> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc("analytics").get();
  if (!doc.exists) return DEFAULT_ANALYTICS_SETTINGS;
  const data = doc.data() as Partial<AnalyticsSettings>;
  return {
    integrations: { ...DEFAULT_ANALYTICS_SETTINGS.integrations, ...data.integrations },
    alerts: { ...DEFAULT_ANALYTICS_SETTINGS.alerts, ...data.alerts },
  };
}

export async function getWhatsAppSettings(): Promise<WhatsAppSettings> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc("whatsapp").get();
  return doc.exists
    ? ({ ...DEFAULT_WHATSAPP_SETTINGS, ...doc.data() } as WhatsAppSettings)
    : DEFAULT_WHATSAPP_SETTINGS;
}

export async function getBrandingSettings(): Promise<BrandingSettings> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc("branding").get();
  return doc.exists ? { ...DEFAULT_BRANDING_SETTINGS, ...doc.data() } : DEFAULT_BRANDING_SETTINGS;
}

export async function getLocalizationSettings(): Promise<LocalizationSettings> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc("localization").get();
  return doc.exists ? { ...DEFAULT_LOCALIZATION_SETTINGS, ...doc.data() } : DEFAULT_LOCALIZATION_SETTINGS;
}

export async function getSeoSettings(): Promise<SeoSettings> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc("seo").get();
  return doc.exists ? { ...DEFAULT_SEO_SETTINGS, ...doc.data() } : DEFAULT_SEO_SETTINGS;
}

export async function getEmailTemplatesSettings(): Promise<EmailTemplatesSettings> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc("emailTemplates").get();
  if (!doc.exists) return DEFAULT_EMAIL_TEMPLATES_SETTINGS;
  const data = doc.data() as Partial<EmailTemplatesSettings>;
  return {
    welcome: { ...DEFAULT_EMAIL_TEMPLATES_SETTINGS.welcome, ...data.welcome },
    orderConfirmation: { ...DEFAULT_EMAIL_TEMPLATES_SETTINGS.orderConfirmation, ...data.orderConfirmation },
    passwordReset: { ...DEFAULT_EMAIL_TEMPLATES_SETTINGS.passwordReset, ...data.passwordReset },
    contact: { ...DEFAULT_EMAIL_TEMPLATES_SETTINGS.contact, ...data.contact },
    newsletter: { ...DEFAULT_EMAIL_TEMPLATES_SETTINGS.newsletter, ...data.newsletter },
  };
}

export async function getIntegrationsSettings(): Promise<IntegrationsSettings> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc("integrations").get();
  if (!doc.exists) return DEFAULT_INTEGRATIONS_SETTINGS;
  const data = doc.data() as Partial<IntegrationsSettings>;
  return {
    smtp: { ...DEFAULT_INTEGRATIONS_SETTINGS.smtp, ...data.smtp },
    recaptcha: { ...DEFAULT_INTEGRATIONS_SETTINGS.recaptcha, ...data.recaptcha },
  };
}

export async function getNotificationsSettings(): Promise<NotificationsSettings> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc("notifications").get();
  if (!doc.exists) return DEFAULT_NOTIFICATIONS_SETTINGS;
  const data = doc.data() as Partial<NotificationsSettings>;
  return {
    email: { ...DEFAULT_NOTIFICATIONS_SETTINGS.email, ...data.email },
    push: { ...DEFAULT_NOTIFICATIONS_SETTINGS.push, ...data.push },
    sms: { ...DEFAULT_NOTIFICATIONS_SETTINGS.sms, ...data.sms },
    whatsapp: { ...DEFAULT_NOTIFICATIONS_SETTINGS.whatsapp, ...data.whatsapp },
  };
}

export async function getAdvancedSettings(): Promise<AdvancedSettings> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc("advanced").get();
  return doc.exists ? { ...DEFAULT_ADVANCED_SETTINGS, ...doc.data() } : DEFAULT_ADVANCED_SETTINGS;
}

export async function getCommissionSettings(): Promise<CommissionSettings> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc("commission").get();
  return doc.exists
    ? ({ ...DEFAULT_COMMISSION_SETTINGS, ...doc.data() } as CommissionSettings)
    : DEFAULT_COMMISSION_SETTINGS;
}

export async function getTaxSettings(): Promise<TaxSettings> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc("tax").get();
  return doc.exists ? { ...DEFAULT_TAX_SETTINGS, ...doc.data() } : DEFAULT_TAX_SETTINGS;
}
