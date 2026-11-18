"use server";

import { requireAdmin } from "@/lib/firebase/require-admin";
import { requireCurrentTenant } from "@/lib/tenant/current";
import { getOrderById } from "@/lib/firebase/repositories/orders";
import { proofBelongsTo } from "@/lib/payments/payment-proof";
import { privateImageUrl } from "@/lib/cloudinary/private-assets";

/**
 * A 10-minute signed link to one of the order's payment screenshots. The order is read from
 * THIS store only (tenant-scoped), and the asset must sit in this store's folder under this
 * order - so an admin can never open another store's (or another order's) proof.
 */
export async function getPaymentProofLinkAction(orderId: string, index: number): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireAdmin();
  const tenant = await requireCurrentTenant();
  const order = await getOrderById(String(orderId));
  const proof = order?.paymentProofs?.[Number(index)];
  if (!order || !proof || !proofBelongsTo(proof, tenant.cloudinaryFolder, order.id)) {
    return { ok: false, error: "Payment screenshot not found." };
  }
  return { ok: true, url: privateImageUrl(proof.publicId, proof.format) };
}
