"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/firebase/require-admin";
import {
  decideOrderVerification,
  getVerificationRefs,
  type VerificationDecisionInput,
} from "@/lib/firebase/repositories/order-verifications";

/** Returned rather than thrown: Next.js replaces a thrown Server Action error's message
 * with a generic one in production, so the admin would never see why it failed. */
export type VerificationActionResult = { ok: true } | { ok: false; error: string };

async function decide(orderId: string, input: VerificationDecisionInput): Promise<VerificationActionResult> {
  const decoded = await requireAdmin();
  try {
    const result = await decideOrderVerification(await getVerificationRefs(), orderId, decoded.uid, input);
    if (!result.ok) return result;

    // Same post-confirmation notification updateOrderStatus() sends for "confirmed".
    if (result.statusChangedTo === "confirmed") {
      try {
        const { sendWhatsAppNotification } = await import("@/lib/notifications/whatsapp-service");
        await sendWhatsAppNotification("ORDER_CONFIRMED", result.order);
      } catch (err) {
        console.error("[WhatsApp Status Update Trigger Error]:", err);
      }
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: true };
  } catch (err) {
    console.error(`[order-verification] ${input.decision} failed for ${orderId}`, err);
    return { ok: false, error: "Could not save the verification decision. Please try again." };
  }
}

/** Admin approves a COD order - a pending order moves to "confirmed" atomically. */
export async function approveOrderVerification(orderId: string, note?: string): Promise<VerificationActionResult> {
  return decide(orderId, { decision: "approved", note });
}

/** Admin rejects a COD order - a reason is mandatory (preset, or text for "Other"); the
 * order is cancelled atomically with the same fields cancelOrder() writes. */
export async function rejectOrderVerification(
  orderId: string,
  reasonCode: string,
  otherText?: string
): Promise<VerificationActionResult> {
  return decide(orderId, { decision: "rejected", reasonCode, otherText });
}
