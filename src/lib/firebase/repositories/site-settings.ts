import "server-only";
import { adminDb } from "../admin";
import type {
  GeneralSettings,
  PaymentSettings,
  ShippingSettings,
  EmailSettings,
  AnalyticsSettings,
  WhatsAppSettings,
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

export async function getGeneralSettings(): Promise<GeneralSettings> {
  const doc = await adminDb().collection(COLLECTION).doc("general").get();
  return doc.exists ? { ...DEFAULT_GENERAL_SETTINGS, ...doc.data() } : DEFAULT_GENERAL_SETTINGS;
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  const doc = await adminDb().collection(COLLECTION).doc("shipping").get();
  return doc.exists ? { ...DEFAULT_SHIPPING_SETTINGS, ...doc.data() } : DEFAULT_SHIPPING_SETTINGS;
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const doc = await adminDb().collection(COLLECTION).doc("payments").get();
  return doc.exists
    ? ({ ...DEFAULT_PAYMENT_SETTINGS, ...doc.data() } as PaymentSettings)
    : DEFAULT_PAYMENT_SETTINGS;
}

export async function getEmailSettings(): Promise<EmailSettings> {
  const doc = await adminDb().collection(COLLECTION).doc("email").get();
  return doc.exists ? { ...DEFAULT_EMAIL_SETTINGS, ...doc.data() } : DEFAULT_EMAIL_SETTINGS;
}

export async function getAnalyticsSettings(): Promise<AnalyticsSettings> {
  const doc = await adminDb().collection(COLLECTION).doc("analytics").get();
  if (!doc.exists) return DEFAULT_ANALYTICS_SETTINGS;
  const data = doc.data() as Partial<AnalyticsSettings>;
  return {
    integrations: { ...DEFAULT_ANALYTICS_SETTINGS.integrations, ...data.integrations },
    alerts: { ...DEFAULT_ANALYTICS_SETTINGS.alerts, ...data.alerts },
  };
}

export async function getWhatsAppSettings(): Promise<WhatsAppSettings> {
  const doc = await adminDb().collection(COLLECTION).doc("whatsapp").get();
  return doc.exists
    ? ({ ...DEFAULT_WHATSAPP_SETTINGS, ...doc.data() } as WhatsAppSettings)
    : DEFAULT_WHATSAPP_SETTINGS;
}
