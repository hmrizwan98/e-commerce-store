import React from "react";
import AnalyticsNav from "@/components/admin/analytics/AnalyticsNav";
import SettingsForm from "./SettingsForm";
import { getAnalyticsSettings } from "@/lib/firebase/repositories/site-settings";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsSettingsPage() {
  const settings = await getAnalyticsSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics Settings</h1>
      <AnalyticsNav />
      <SettingsForm settings={settings} />
    </div>
  );
}
