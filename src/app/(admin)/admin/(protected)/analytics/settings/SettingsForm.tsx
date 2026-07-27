"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAnalyticsSettings } from "./actions";
import type { AnalyticsSettings } from "@/types/site-settings";

const cardClass = "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";
const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
const labelClass = "block text-sm font-medium mb-1";

export default function SettingsForm({ settings }: { settings: AnalyticsSettings }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const [ga4MeasurementId, setGa4MeasurementId] = useState(settings.integrations.ga4MeasurementId ?? "");
  const [gtmContainerId, setGtmContainerId] = useState(settings.integrations.gtmContainerId ?? "");
  const [metaPixelId, setMetaPixelId] = useState(settings.integrations.metaPixelId ?? "");
  const [metaConversionApiToken, setMetaConversionApiToken] = useState(
    settings.integrations.metaConversionApiToken ?? ""
  );
  const [tiktokPixelId, setTiktokPixelId] = useState(settings.integrations.tiktokPixelId ?? "");
  const [googleAdsConversionId, setGoogleAdsConversionId] = useState(settings.integrations.googleAdsConversionId ?? "");
  const [googleAdsConversionLabel, setGoogleAdsConversionLabel] = useState(
    settings.integrations.googleAdsConversionLabel ?? ""
  );
  const [microsoftClarityId, setMicrosoftClarityId] = useState(settings.integrations.microsoftClarityId ?? "");
  const [hotjarId, setHotjarId] = useState(settings.integrations.hotjarId ?? "");
  const [googleSearchConsoleVerification, setGoogleSearchConsoleVerification] = useState(
    settings.integrations.googleSearchConsoleVerification ?? ""
  );

  const [trafficSpikePercent, setTrafficSpikePercent] = useState(String(settings.alerts.trafficSpikePercent));
  const [salesSpikePercent, setSalesSpikePercent] = useState(String(settings.alerts.salesSpikePercent));
  const [conversionDropPercent, setConversionDropPercent] = useState(String(settings.alerts.conversionDropPercent));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSaved(false);
    try {
      await updateAnalyticsSettings({
        integrations: {
          ga4MeasurementId: ga4MeasurementId || undefined,
          gtmContainerId: gtmContainerId || undefined,
          metaPixelId: metaPixelId || undefined,
          metaConversionApiToken: metaConversionApiToken || undefined,
          tiktokPixelId: tiktokPixelId || undefined,
          googleAdsConversionId: googleAdsConversionId || undefined,
          googleAdsConversionLabel: googleAdsConversionLabel || undefined,
          microsoftClarityId: microsoftClarityId || undefined,
          hotjarId: hotjarId || undefined,
          googleSearchConsoleVerification: googleSearchConsoleVerification || undefined,
        },
        alerts: {
          trafficSpikePercent: Number(trafficSpikePercent) || 0,
          salesSpikePercent: Number(salesSpikePercent) || 0,
          conversionDropPercent: Number(conversionDropPercent) || 0,
        },
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className={cardClass}>
        <h2 className="font-semibold">Integrations</h2>
        <p className="text-xs text-neutral-500">
          Paste in real IDs from each platform to activate it store-wide. Leave blank to keep it disabled - nothing
          fires until an ID is set here.
        </p>

        <div>
          <label className={labelClass}>Google Analytics 4 - Measurement ID</label>
          <input className={inputClass} placeholder="G-XXXXXXXXXX" value={ga4MeasurementId} onChange={(e) => setGa4MeasurementId(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Google Tag Manager - Container ID</label>
          <input className={inputClass} placeholder="GTM-XXXXXXX" value={gtmContainerId} onChange={(e) => setGtmContainerId(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Meta (Facebook) Pixel ID</label>
          <input className={inputClass} value={metaPixelId} onChange={(e) => setMetaPixelId(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Meta Conversion API access token (optional, server-side)</label>
          <input className={inputClass} type="password" value={metaConversionApiToken} onChange={(e) => setMetaConversionApiToken(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>TikTok Pixel ID</label>
          <input className={inputClass} value={tiktokPixelId} onChange={(e) => setTiktokPixelId(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Google Ads Conversion ID</label>
            <input className={inputClass} placeholder="AW-XXXXXXXXX" value={googleAdsConversionId} onChange={(e) => setGoogleAdsConversionId(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Google Ads Conversion Label</label>
            <input className={inputClass} value={googleAdsConversionLabel} onChange={(e) => setGoogleAdsConversionLabel(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Microsoft Clarity ID</label>
          <input className={inputClass} value={microsoftClarityId} onChange={(e) => setMicrosoftClarityId(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Hotjar Site ID</label>
          <input className={inputClass} value={hotjarId} onChange={(e) => setHotjarId(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Google Search Console verification (meta tag content)</label>
          <input className={inputClass} value={googleSearchConsoleVerification} onChange={(e) => setGoogleSearchConsoleVerification(e.target.value)} />
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold">Alert thresholds</h2>
        <p className="text-xs text-neutral-500">
          Shown as banners on the Analytics Overview page when the current period moves past these thresholds
          compared to the prior equal-length period.
        </p>
        <div>
          <label className={labelClass}>Traffic spike (%)</label>
          <input type="number" className={inputClass} value={trafficSpikePercent} onChange={(e) => setTrafficSpikePercent(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Sales spike (%)</label>
          <input type="number" className={inputClass} value={salesSpikePercent} onChange={(e) => setSalesSpikePercent(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Conversion rate drop (%)</label>
          <input type="number" className={inputClass} value={conversionDropPercent} onChange={(e) => setConversionDropPercent(e.target.value)} />
        </div>
      </div>

      {saved && <p className="text-sm text-green-600">Saved.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
