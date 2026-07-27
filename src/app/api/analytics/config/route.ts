import { NextResponse } from "next/server";
import { getAnalyticsSettings } from "@/lib/firebase/repositories/site-settings";

export const dynamic = "force-dynamic";

// Public - these are client-embeddable pixel/measurement IDs (not secrets).
// metaConversionApiToken is server-side only and intentionally excluded here.
export async function GET() {
  const { integrations } = await getAnalyticsSettings();
  return NextResponse.json({
    ga4MeasurementId: integrations.ga4MeasurementId ?? null,
    gtmContainerId: integrations.gtmContainerId ?? null,
    metaPixelId: integrations.metaPixelId ?? null,
    tiktokPixelId: integrations.tiktokPixelId ?? null,
    googleAdsConversionId: integrations.googleAdsConversionId ?? null,
    microsoftClarityId: integrations.microsoftClarityId ?? null,
    hotjarId: integrations.hotjarId ?? null,
    googleSearchConsoleVerification: integrations.googleSearchConsoleVerification ?? null,
  });
}
