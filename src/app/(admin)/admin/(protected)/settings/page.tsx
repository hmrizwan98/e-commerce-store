import React from "react";
import {
  getGeneralSettings,
  getShippingSettings,
  getPaymentSettings,
  getEmailSettings,
  getWhatsAppSettings,
  getBrandingSettings,
  getLocalizationSettings,
  getSeoSettings,
  getEmailTemplatesSettings,
  getIntegrationsSettings,
  getNotificationsSettings,
  getAdvancedSettings,
  getAnalyticsSettings,
  getCommissionSettings,
  getTaxSettings,
} from "@/lib/firebase/repositories/site-settings";
import { getBackupHistory } from "@/lib/firebase/repositories/backup-history";
import SettingsPageClient from "./SettingsPageClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [
    general,
    shipping,
    payments,
    email,
    whatsapp,
    branding,
    localization,
    seo,
    emailTemplates,
    integrations,
    notifications,
    advanced,
    analytics,
    backupHistory,
    commission,
    tax,
  ] = await Promise.all([
    getGeneralSettings(),
    getShippingSettings(),
    getPaymentSettings(),
    getEmailSettings(),
    getWhatsAppSettings(),
    getBrandingSettings(),
    getLocalizationSettings(),
    getSeoSettings(),
    getEmailTemplatesSettings(),
    getIntegrationsSettings(),
    getNotificationsSettings(),
    getAdvancedSettings(),
    getAnalyticsSettings(),
    getBackupHistory(),
    getCommissionSettings(),
    getTaxSettings(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <SettingsPageClient
        general={general}
        shipping={shipping}
        payments={payments}
        email={email}
        whatsapp={whatsapp}
        branding={branding}
        localization={localization}
        seo={seo}
        emailTemplates={emailTemplates}
        integrations={integrations}
        notifications={notifications}
        advanced={advanced}
        analytics={analytics}
        backupHistory={backupHistory}
        commission={commission}
        tax={tax}
      />
    </div>
  );
}
