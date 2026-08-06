"use server";

import { revalidatePath } from "next/cache";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import { queueBackupExport, queueBackupImport } from "@/lib/firebase/services/backup-service";
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
  const col = await tenantCollection("siteSettings");
  await col.doc("whatsapp").set(stripUndefined(settings), { merge: true });
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

export async function updateCommissionSettings(settings: CommissionSettings): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("siteSettings");
  await col.doc("commission").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updateTaxSettings(settings: TaxSettings): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("siteSettings");
  await col.doc("tax").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function requestBackupExport(): Promise<void> {
  await requireAdmin();
  await queueBackupExport();
  revalidatePath("/admin/settings");
}

export async function requestBackupImport(): Promise<void> {
  await requireAdmin();
  await queueBackupImport();
  revalidatePath("/admin/settings");
}
