"use server";

import { revalidatePath } from "next/cache";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import { requireCurrentTenant } from "@/lib/tenant/current";
import { queueBackupExport, queueBackupImport } from "@/lib/firebase/services/backup-service";
import { createSuperAdminNotification } from "@/lib/firebase/repositories/superadmin-notifications";
import { formatPhoneNumber } from "@/lib/notifications/whatsapp-service";
import type {
  GeneralSettings,
  ShippingSettings,
  PaymentSettings,
  EmailSettings,
  WhatsAppSettings,
  BrandingSettings,
  LocalizationSettings,
  SeoSettings,
  EmailTemplatesSettings,
  IntegrationsSettings,
  NotificationsSettings,
  AdvancedSettings,
  CommissionSettings,
  TaxSettings,
} from "@/types/site-settings";

function revalidateStorefront() {
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

export async function updateGeneralSettings(settings: GeneralSettings): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("siteSettings");
  await col.doc("general").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updateShippingSettings(settings: ShippingSettings): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("siteSettings");
  await col.doc("shipping").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updatePaymentSettings(settings: PaymentSettings): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("siteSettings");
  await col.doc("payments").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updateEmailSettings(settings: EmailSettings): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("siteSettings");
  await col.doc("email").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updateWhatsAppSettings(settings: WhatsAppSettings): Promise<void> {
  await requireAdmin();
  if (settings.enabled && !settings.phoneNumber?.trim()) {
    throw new Error("Please enter a WhatsApp number before enabling the WhatsApp button.");
  }
  // Normalize server-side regardless of input source (client-side digit-stripping is a
  // convenience, not a guarantee) so a malformed stored value can never produce a broken
  // wa.me link on the storefront.
  const normalized: WhatsAppSettings = {
    ...settings,
    phoneNumber: settings.phoneNumber ? formatPhoneNumber(settings.phoneNumber) : settings.phoneNumber,
  };
  const col = await tenantCollection("siteSettings");
  await col.doc("whatsapp").set(stripUndefined(normalized), { merge: true });
  revalidateStorefront();
}

export async function updateBrandingSettings(settings: BrandingSettings): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("siteSettings");
  await col.doc("branding").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updateLocalizationSettings(settings: LocalizationSettings): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("siteSettings");
  await col.doc("localization").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updateSeoSettings(settings: SeoSettings): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("siteSettings");
  await col.doc("seo").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updateEmailTemplatesSettings(settings: EmailTemplatesSettings): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("siteSettings");
  await col.doc("emailTemplates").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updateIntegrationsSettings(settings: IntegrationsSettings): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("siteSettings");
  await col.doc("integrations").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updateNotificationsSettings(settings: NotificationsSettings): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("siteSettings");
  await col.doc("notifications").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updateAdvancedSettings(settings: AdvancedSettings): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("siteSettings");
  await col.doc("advanced").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updateTaxSettings(settings: TaxSettings): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("siteSettings");
  await col.doc("tax").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export type BackupRequestResult = { ok: true } | { ok: false; error: string };

/** Store Admin backup request: one open (pending/approved) request per type at a time, and
 * the platform (Super Admin) is notified. Only a REQUEST is recorded - no backup is produced
 * here (see src/lib/firebase/services/backup-service.ts). */
async function requestBackup(kind: "export" | "import"): Promise<BackupRequestResult> {
  await requireAdmin();
  try {
    const store = await requireCurrentTenant();
    const col = await tenantCollection("backupHistory");
    const open = await col.where("status", "in", ["queued", "approved"]).limit(20).get();
    if (open.docs.some((d) => d.data().type === kind)) {
      return { ok: false, error: `You already have an open ${kind} request - the platform will process it.` };
    }
    const backupId = kind === "export" ? await queueBackupExport() : await queueBackupImport();
    await createSuperAdminNotification({
      type: "backup_request",
      storeId: store.id,
      storeName: store.name,
      title: `${store.name} requested a backup ${kind}`,
      refId: `${store.id}__${backupId}`,
      href: "/notifications",
    }).catch((err) => console.error("[backup] notification failed", err));
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (err) {
    console.error("[backup] request failed", err);
    return { ok: false, error: "Could not send the request. Please try again." };
  }
}

export async function requestBackupExport(): Promise<BackupRequestResult> {
  return requestBackup("export");
}

export async function requestBackupImport(): Promise<BackupRequestResult> {
  return requestBackup("import");
}
