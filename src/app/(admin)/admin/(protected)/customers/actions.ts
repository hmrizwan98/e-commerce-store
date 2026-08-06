"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { getOrCreateCustomerDoc } from "@/lib/firebase/repositories/customers";
import { logCustomerActivity } from "@/lib/firebase/repositories/customer-activity-logs";
import { queueCustomerExport } from "@/lib/firebase/services/customer-export-service";
import {
  requestCustomerDataExport as queueGdprDataExport,
  requestCustomerDeletion as applyGdprDeletion,
  deactivateCustomer as applyDeactivation,
} from "@/lib/firebase/services/gdpr-service";
import type { CustomerStatus } from "@/types/customer";
import type { CustomerExportFormat } from "@/types/customer-export-operation";

function revalidateCustomer(routeId: string) {
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${routeId}`);
}

// Customer Status - no complex transition guard needed (unlike order
// cancellation, there's no required lifecycle ordering between these 4 states).
export async function updateCustomerStatus(routeId: string, status: CustomerStatus): Promise<void> {
  const decoded = await requireAdmin();
  const customer = await getOrCreateCustomerDoc(routeId);
  const col = await tenantCollection("customers");
  await col.doc(customer.uid).update({ status, updatedAt: FieldValue.serverTimestamp() });
  await logCustomerActivity(customer.uid, "status_changed", decoded.uid, { status });
  revalidateCustomer(routeId);
}

export async function updateCustomerTags(routeId: string, tags: string[]): Promise<void> {
  const decoded = await requireAdmin();
  const customer = await getOrCreateCustomerDoc(routeId);
  const previous = new Set(customer.tags ?? []);
  const normalized = Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean)));

  const col = await tenantCollection("customers");
  await col.doc(customer.uid).update({ tags: normalized, updatedAt: FieldValue.serverTimestamp() });

  const added = normalized.filter((t) => !previous.has(t));
  const removed = Array.from(previous).filter((t) => !normalized.includes(t));
  if (added.length) await logCustomerActivity(customer.uid, "tag_added", decoded.uid, { tags: added.join(", ") });
  if (removed.length) await logCustomerActivity(customer.uid, "tag_removed", decoded.uid, { tags: removed.join(", ") });

  revalidateCustomer(routeId);
}

export async function addCustomerNote(routeId: string, text: string): Promise<void> {
  const decoded = await requireAdmin();
  const customer = await getOrCreateCustomerDoc(routeId);
  const col = await tenantCollection("customers");
  await col.doc(customer.uid).update({
    internalNotes: FieldValue.arrayUnion({ text, authorUid: decoded.uid, at: Date.now() }),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await logCustomerActivity(customer.uid, "note_added", decoded.uid);
  revalidateCustomer(routeId);
}

// Export Architecture - queues a record only, no CSV/Excel engine exists yet
// (see customer-export-service.ts). Store-wide, not tied to a single customer,
// so (like Order/Product bulk export) it isn't written to the per-customer
// activity log - the CustomerExportOperation record itself is the history.
export async function requestCustomerExport(format: CustomerExportFormat, note?: string): Promise<void> {
  await requireAdmin();
  await queueCustomerExport(format, note);
  revalidatePath("/admin/customers/export");
}

// GDPR Foundation
export async function requestCustomerDataExport(routeId: string): Promise<void> {
  const decoded = await requireAdmin();
  const customer = await getOrCreateCustomerDoc(routeId);
  await queueGdprDataExport(customer.uid);
  await logCustomerActivity(customer.uid, "gdpr_export_requested", decoded.uid);
  revalidateCustomer(routeId);
}

export async function requestCustomerDeletion(routeId: string): Promise<void> {
  const decoded = await requireAdmin();
  const customer = await getOrCreateCustomerDoc(routeId);
  await applyGdprDeletion(customer.uid);
  await logCustomerActivity(customer.uid, "gdpr_delete_requested", decoded.uid);
  revalidateCustomer(routeId);
}

export async function requestCustomerDeactivation(routeId: string): Promise<void> {
  const decoded = await requireAdmin();
  const customer = await getOrCreateCustomerDoc(routeId);
  await applyDeactivation(customer.uid);
  await logCustomerActivity(customer.uid, "deactivated", decoded.uid);
  revalidateCustomer(routeId);
}
