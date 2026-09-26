import "server-only";
import { adminDb } from "@/lib/firebase/admin";

const COLLECTION = "platformSettings";

/** Platform-wide (not per-tenant) sender identity, used for store welcome emails,
 * password-reset-adjacent platform emails, and anything else sent by the platform
 * itself rather than by an individual store. Distinct from the per-tenant
 * `siteSettings/email` doc (src/lib/firebase/repositories/site-settings.ts), which is
 * each store's own "from" address for its own customer-facing emails. */
export interface PlatformEmailSettings {
  fromName: string;
  fromEmail: string;
}

export const DEFAULT_PLATFORM_EMAIL_SETTINGS: PlatformEmailSettings = {
  fromName: "Webriiz",
  fromEmail: "support@webriiz.com",
};

export async function getPlatformEmailSettings(): Promise<PlatformEmailSettings> {
  const doc = await adminDb().collection(COLLECTION).doc("email").get();
  return doc.exists
    ? { ...DEFAULT_PLATFORM_EMAIL_SETTINGS, ...(doc.data() as Partial<PlatformEmailSettings>) }
    : DEFAULT_PLATFORM_EMAIL_SETTINGS;
}

export async function updatePlatformEmailSettings(settings: PlatformEmailSettings): Promise<void> {
  await adminDb().collection(COLLECTION).doc("email").set(settings, { merge: true });
}
