"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/require-admin";
import type { OrderStatus, PaymentStatus } from "@/types/order";

export async function updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<void> {
  await requireAdmin();
  await adminDb()
    .collection("orders")
    .doc(id)
    .update({
      orderStatus: status,
      statusHistory: FieldValue.arrayUnion({ status, at: Date.now(), note: note ?? null }),
      updatedAt: FieldValue.serverTimestamp(),
    });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function updatePaymentStatus(id: string, status: PaymentStatus): Promise<void> {
  await requireAdmin();
  await adminDb()
    .collection("orders")
    .doc(id)
    .update({ paymentStatus: status, updatedAt: FieldValue.serverTimestamp() });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function setTrackingNumber(id: string, trackingNumber: string): Promise<void> {
  await requireAdmin();
  await adminDb()
    .collection("orders")
    .doc(id)
    .update({ trackingNumber, updatedAt: FieldValue.serverTimestamp() });
  revalidatePath(`/admin/orders/${id}`);
}
