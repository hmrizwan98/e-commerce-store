export interface GeneralSettings {
  storeName: string;
  storeEmail: string;
  storePhone?: string;
  storeAddress?: string;
  currency: string;
  currencySymbol: string;
  taxRatePercent: number;
  taxInclusive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
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
