"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import type {
  GeneralSettings,
  ShippingSettings,
  PaymentSettings,
  EmailSettings,
  WhatsAppSettings,
} from "@/types/site-settings";

function revalidateStorefront() {
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

export async function updateGeneralSettings(settings: GeneralSettings): Promise<void> {
  await requireAdmin();
  await adminDb().collection("siteSettings").doc("general").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updateShippingSettings(settings: ShippingSettings): Promise<void> {
  await requireAdmin();
  await adminDb().collection("siteSettings").doc("shipping").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updatePaymentSettings(settings: PaymentSettings): Promise<void> {
  await requireAdmin();
  await adminDb().collection("siteSettings").doc("payments").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updateEmailSettings(settings: EmailSettings): Promise<void> {
  await requireAdmin();
  await adminDb().collection("siteSettings").doc("email").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}

export async function updateWhatsAppSettings(settings: WhatsAppSettings): Promise<void> {
  await requireAdmin();
  await adminDb().collection("siteSettings").doc("whatsapp").set(stripUndefined(settings), { merge: true });
  revalidateStorefront();
}
