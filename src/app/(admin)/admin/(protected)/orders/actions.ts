"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import { getOrderById } from "@/lib/firebase/repositories/orders";
import { logOrderActivity } from "@/lib/firebase/repositories/order-activity-logs";
import { queueInvoice, queuePackingSlip, queueShippingLabel } from "@/lib/firebase/services/order-document-service";
import { queueOrderExport } from "@/lib/firebase/services/order-bulk-service";
import { logTransaction } from "@/lib/firebase/repositories/transactions";
import { getCommissionSettings } from "@/lib/firebase/repositories/site-settings";
import { calculateCommission } from "@/lib/finance/commission";
import { requireCurrentTenant } from "@/lib/tenant/current";
import type { OrderStatus, PaymentStatus, ReturnStatus } from "@/types/order";
import type { OrderDocumentType } from "@/types/order-document";

export async function updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<void> {
  const decoded = await requireAdmin();
  const col = await tenantCollection("orders");
  await col
    .doc(id)
    .update({
      orderStatus: status,
      statusHistory: FieldValue.arrayUnion({ status, at: Date.now(), note: note ?? null }),
      updatedAt: FieldValue.serverTimestamp(),
    });
  await logOrderActivity(id, "status_changed", decoded.uid, { status });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function updatePaymentStatus(id: string, status: PaymentStatus, note?: string): Promise<void> {
  const decoded = await requireAdmin();
  const col = await tenantCollection("orders");
  await col
    .doc(id)
    .update({
      paymentStatus: status,
      paymentStatusHistory: FieldValue.arrayUnion({ status, at: Date.now(), note: note ?? null }),
      updatedAt: FieldValue.serverTimestamp(),
    });
  await logOrderActivity(id, "payment_status_changed", decoded.uid, { status });

  // Transaction Ledger: a "payment" record is only created when an admin confirms
  // payment as received - this is the one Orders-owned integration point that can
  // capture a payment event without touching Checkout's createGuestOrder.
  if (status === "paid") {
    const order = await getOrderById(id);
    if (order) {
      const tenant = await requireCurrentTenant();
      const commissionSettings = await getCommissionSettings();
      const commissionAmount = calculateCommission(order.total, commissionSettings);
      await logTransaction(tenant.id, id, "payment", order.total, order.paymentMethod, {
        commissionAmount,
        actorUid: decoded.uid,
      });
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function setTrackingNumber(id: string, trackingNumber: string): Promise<void> {
  const decoded = await requireAdmin();
  const col = await tenantCollection("orders");
  await col
    .doc(id)
    .update({ trackingNumber, updatedAt: FieldValue.serverTimestamp() });
  await logOrderActivity(id, "shipment_updated", decoded.uid, { field: "trackingNumber" });
  revalidatePath(`/admin/orders/${id}`);
}

// Shipment Information: courier name + dispatch/delivery dates, additive
// alongside the existing trackingNumber field/action above.
export async function setShipmentDetails(
  id: string,
  details: { courierName?: string; dispatchDate?: number; deliveryDate?: number }
): Promise<void> {
  const decoded = await requireAdmin();
  const col = await tenantCollection("orders");
  await col.doc(id).update({
    ...stripUndefined(details),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await logOrderActivity(id, "shipment_updated", decoded.uid, { field: "shipmentDetails" });
  revalidatePath(`/admin/orders/${id}`);
}

export async function addInternalNote(id: string, text: string): Promise<void> {
  const decoded = await requireAdmin();
  const col = await tenantCollection("orders");
  await col.doc(id).update({
    internalNotes: FieldValue.arrayUnion({ text, authorUid: decoded.uid, at: Date.now() }),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await logOrderActivity(id, "note_added", decoded.uid, { audience: "internal" });
  revalidatePath(`/admin/orders/${id}`);
}

export async function addCustomerNote(id: string, text: string): Promise<void> {
  const decoded = await requireAdmin();
  const col = await tenantCollection("orders");
  await col.doc(id).update({
    customerNotes: FieldValue.arrayUnion({ text, authorUid: decoded.uid, at: Date.now() }),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await logOrderActivity(id, "note_added", decoded.uid, { audience: "customer" });
  revalidatePath(`/admin/orders/${id}`);
}

// Cancellation Workflow - order-side state only. Stock is never restored here:
// the decrement happens inside Checkout's createGuestOrder transaction, and
// symmetrically restoring it would mean this module writes to products/variants
// docs, taking on Inventory's write-responsibility rather than just avoiding its
// files. Adjust stock manually via the Inventory page if a cancellation warrants it.
export async function cancelOrder(id: string, reason: string): Promise<void> {
  const decoded = await requireAdmin();
  const order = await getOrderById(id);
  if (!order) throw new Error("Order not found.");
  if (order.orderStatus === "cancelled") throw new Error("This order is already cancelled.");
  if (order.orderStatus === "delivered") throw new Error("A delivered order cannot be cancelled.");

  const now = Date.now();
  const col = await tenantCollection("orders");
  await col.doc(id).update({
    orderStatus: "cancelled" satisfies OrderStatus,
    cancellationReason: reason,
    cancelledAt: now,
    cancelledBy: decoded.uid,
    statusHistory: FieldValue.arrayUnion({ status: "cancelled", at: now, note: reason }),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await logOrderActivity(id, "cancelled", decoded.uid, { reason });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

// Refund Workflow - order-side state only, same no-stock-touch rationale as
// cancelOrder above. No payment gateway integration exists in this codebase to call.
export async function initiateRefund(id: string, amount: number, reason: string): Promise<void> {
  const decoded = await requireAdmin();
  const order = await getOrderById(id);
  if (!order) throw new Error("Order not found.");
  if (!(amount > 0) || amount > order.total) {
    throw new Error("Refund amount must be greater than 0 and no more than the order total.");
  }

  const now = Date.now();
  const col = await tenantCollection("orders");
  await col.doc(id).update({
    paymentStatus: "refunded" satisfies PaymentStatus,
    refundReason: reason,
    refundAmount: amount,
    refundedAt: now,
    refundedBy: decoded.uid,
    paymentStatusHistory: FieldValue.arrayUnion({ status: "refunded", at: now, note: reason }),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await logOrderActivity(id, "refund_issued", decoded.uid, { amount: String(amount) });

  const tenant = await requireCurrentTenant();
  await logTransaction(tenant.id, id, "refund", amount, order.paymentMethod, {
    note: reason,
    actorUid: decoded.uid,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

// Return Workflow
export async function updateReturnStatus(id: string, status: ReturnStatus, note?: string): Promise<void> {
  const decoded = await requireAdmin();
  const now = Date.now();
  const col = await tenantCollection("orders");
  await col.doc(id).update({
    returnStatus: status,
    returnStatusHistory: FieldValue.arrayUnion({ status, at: now, note: note ?? null }),
    ...(status === "requested" ? { returnRequestedAt: now } : {}),
    ...(status === "rejected" || status === "completed" ? { returnResolvedAt: now, returnResolvedBy: decoded.uid } : {}),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await logOrderActivity(id, "return_updated", decoded.uid, { status });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

// Invoice / Packing Slip / Shipping Label Architecture - queues a record only,
// no PDF rendering engine exists yet (see order-document-service.ts). The
// existing "Print invoice" window.print() button is untouched.
export async function requestOrderDocument(id: string, type: OrderDocumentType, note?: string): Promise<void> {
  const decoded = await requireAdmin();
  if (type === "invoice") await queueInvoice(id, note);
  else if (type === "packing_slip") await queuePackingSlip(id, note);
  else await queueShippingLabel(id, note);
  await logOrderActivity(id, "document_queued", decoded.uid, { type });
  revalidatePath(`/admin/orders/${id}`);
}

// Order Export Architecture - queues a record only, no CSV engine exists yet
// (see order-bulk-service.ts). Store-wide, not tied to a single order, so
// (like the Product module's bulk export) it isn't written to the per-order
// activity log - the OrderBulkOperation record itself is the history.
export async function requestOrderExport(note?: string): Promise<void> {
  await requireAdmin();
  await queueOrderExport(note);
  revalidatePath("/admin/orders/export");
}
