import { NextResponse } from "next/server";
import { getWhatsAppSettings } from "@/lib/firebase/repositories/site-settings";

export const dynamic = "force-dynamic";

// Public - a WhatsApp number meant to be clicked by customers is not a secret.
export async function GET() {
  const settings = await getWhatsAppSettings();
  return NextResponse.json({
    enabled: settings.enabled,
    phoneNumber: settings.phoneNumber ?? null,
    defaultMessage: settings.defaultMessage ?? null,
  });
}
