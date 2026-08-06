"use server";

import { revalidatePath } from "next/cache";
import { serverTimestamp } from "@/lib/firebase/admin";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined } from "@/lib/firebase/repositories/utils";

export interface SupplierFormInput {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  notes?: string;
  isActive: boolean;
}

function revalidateSuppliers() {
  revalidatePath("/admin/suppliers");
}

export async function createSupplier(input: SupplierFormInput): Promise<string> {
  await requireAdmin();
  const col = await tenantCollection("suppliers");
  const ref = col.doc();
  await ref.set({
    ...stripUndefined(input),
    isDeleted: false,
    deletedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  revalidateSuppliers();
  return ref.id;
}

export async function updateSupplier(id: string, input: SupplierFormInput): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("suppliers");
  await col.doc(id).update({ ...stripUndefined(input), updatedAt: serverTimestamp() });
  revalidateSuppliers();
}

export async function softDeleteSupplier(id: string): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("suppliers");
  await col.doc(id).update({ isDeleted: true, deletedAt: Date.now(), updatedAt: serverTimestamp() });
  revalidateSuppliers();
}

export async function restoreSupplier(id: string): Promise<void> {
  await requireAdmin();
  const col = await tenantCollection("suppliers");
  await col.doc(id).update({ isDeleted: false, deletedAt: null, updatedAt: serverTimestamp() });
  revalidateSuppliers();
}
