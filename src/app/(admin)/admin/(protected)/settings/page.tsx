import React from "react";
import {
  getGeneralSettings,
  getShippingSettings,
  getPaymentSettings,
  getEmailSettings,
  getWhatsAppSettings,
} from "@/lib/firebase/repositories/site-settings";
import SettingsPageClient from "./SettingsPageClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [general, shipping, payments, email, whatsapp] = await Promise.all([
    getGeneralSettings(),
    getShippingSettings(),
    getPaymentSettings(),
    getEmailSettings(),
    getWhatsAppSettings(),
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
      />
    </div>
  );
}
