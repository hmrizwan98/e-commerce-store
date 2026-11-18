import "server-only";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { proofUploadEligibility } from "@/lib/payments/payment-proof";
import type { Order, PaymentProof } from "@/types/order";

/**
 * Adds an uploaded payment proof to stores/{storeId}/orders/{orderId} in a transaction: the
 * eligibility rules (prepaid, unsettled, max per order) are re-checked against the CURRENT
 * order, so two uploads at once can't exceed the limit. An unpaid order moves to
 * "proof_submitted"; any other payment status is left as it is.
 */
export async function attachPaymentProof(
  db: Firestore,
  storeId: string,
  orderId: string,
  proof: PaymentProof
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ref = db.collection("stores").doc(storeId).collection("orders").doc(orderId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { ok: false as const, error: "Order not found." };
    const order = snap.data() as Order;
    const check = proofUploadEligibility(order);
    if (!check.ok) return check;
    const now = Date.now();
    const update: FirebaseFirestore.UpdateData<Order> = { paymentProofs: [...(order.paymentProofs ?? []), proof], updatedAt: FieldValue.serverTimestamp() };
    if (order.paymentStatus === "unpaid") {
      update.paymentStatus = "proof_submitted";
      update.paymentStatusHistory = [...(order.paymentStatusHistory ?? []), { status: "proof_submitted", at: now }];
    }
    tx.update(ref, update);
    return { ok: true as const };
  });
}
