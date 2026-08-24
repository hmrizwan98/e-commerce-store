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
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-wider mb-2">
          ⚙️ System &amp; Store Configuration
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Store Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage general store details, payments, taxes, shipping, localization, integrations, and backups.
        </p>
      </div>
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
