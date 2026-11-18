import type { GeneralSettings } from "@/types/site-settings";

const PLACEHOLDER_EMAIL = /@example\.(com|org|net)$/i;

/** Contact page rows from Settings → General - only fields the merchant actually filled in.
 * The platform default email (support@example.com) is never shown to customers. */
export function contactInfoRows(general: Pick<GeneralSettings, "storeAddress" | "storeEmail" | "storePhone">): { title: string; desc: string }[] {
  const rows: { title: string; desc: string }[] = [];
  if (general.storeAddress?.trim()) rows.push({ title: "🗺 ADDRESS", desc: general.storeAddress.trim() });
  const email = general.storeEmail?.trim();
  if (email && !PLACEHOLDER_EMAIL.test(email)) rows.push({ title: "💌 EMAIL", desc: email });
  if (general.storePhone?.trim()) rows.push({ title: "☎ PHONE", desc: general.storePhone.trim() });
  return rows;
}
