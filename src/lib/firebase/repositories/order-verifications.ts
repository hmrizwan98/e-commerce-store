import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData, stripUndefined } from "./utils";
import {
  VERIFICATION_ENGINE_VERSION,
  evaluateOrderVerification,
  requiresCodVerification,
  resolveRejectionReason,
  summarizeHistory,
  type HistoryOrder,
} from "@/lib/orders/verification/engine";
import { phoneQueryVariants } from "@/lib/orders/verification/phone";
import type { Order, OrderStatus } from "@/types/order";
import type { OrderActivityAction } from "@/types/order-activity-log";
import type { OrderVerification, OrderVerificationDecision } from "@/types/order-verification";

const COLLECTION = "orderVerifications";
/** Hard cap on how many previous orders one verification reads. */
const HISTORY_LIMIT = 50;

type CollectionRef = FirebaseFirestore.CollectionReference;

/** All three are under stores/{storeId}/ - tenant isolation comes from the path, so a
 * verification can never read another store's orders. Resolved up front so the work can
 * also run after the checkout response (waitUntil), outside the request scope. */
export interface VerificationRefs {
  ordersCol: CollectionRef;
  verificationsCol: CollectionRef;
  activityCol: CollectionRef;
}

export async function getVerificationRefs(): Promise<VerificationRefs> {
  const [ordersCol, verificationsCol, activityCol] = await Promise.all([
    tenantCollection("orders"),
    tenantCollection(COLLECTION),
    tenantCollection("orderActivityLogs"),
  ]);
  return { ordersCol, verificationsCol, activityCol };
}

export const COD_VERIFICATION_REQUIRED_MESSAGE = "COD verification required. Please approve this order before continuing.";

/** Thrown when a transaction finds the order/verification no longer in the state the
 * caller validated against - e.g. another admin decided or changed it first. */
export class OrderStateConflictError extends Error {}

/** One indexed `in` query on shippingAddress.phone (single-field index, no composite
 * needed), capped at HISTORY_LIMIT docs and only the fields the engine reads - never a
 * scan of the orders collection. Firestore bills `in` by matched docs, not by variants. */
async function fetchPhoneHistory(ordersCol: CollectionRef, phone: string) {
  const variants = phoneQueryVariants(phone);
  if (!variants.length) return { orders: [] as HistoryOrder[], truncated: false };
  const snap = await ordersCol
    .where("shippingAddress.phone", "in", variants)
    .select("orderStatus", "statusHistory", "returnStatus", "total", "createdAt")
    .limit(HISTORY_LIMIT)
    .get();
  const orders = snap.docs
    .map((d) => docData<HistoryOrder>(d))
    .filter((o): o is HistoryOrder & { id: string } => o !== null);
  return { orders, truncated: snap.size >= HISTORY_LIMIT };
}

/**
 * Evaluates a COD order once and persists it. The create happens in a transaction that
 * re-reads the order: it's skipped if the order is no longer "pending" (e.g. cancelled
 * before a delayed background run), and an existing verification - including an admin
 * decision on it - is never overwritten. Returns null for non-COD orders.
 */
export async function runOrderVerification(
  order: Order,
  refs: Pick<VerificationRefs, "ordersCol" | "verificationsCol">
): Promise<OrderVerification | null> {
  if (!requiresCodVerification(order.paymentMethod)) return null;

  const { orders, truncated } = await fetchPhoneHistory(refs.ordersCol, order.shippingAddress?.phone ?? "");
  const now = Date.now();
  const history = summarizeHistory(orders, { excludeOrderId: order.id, now, truncated });
  const result = evaluateOrderVerification({
    total: order.total,
    items: order.items ?? [],
    shippingAddress: order.shippingAddress ?? {},
    guestName: order.guestName,
    history,
  });

  const verification: Omit<OrderVerification, "id"> = {
    orderId: order.id,
    status: "pending",
    riskLevel: result.riskLevel,
    recommendation: result.recommendation,
    reasons: result.reasons,
    history: stripUndefined(history) as OrderVerification["history"],
    normalizedPhone: result.normalizedPhone,
    codAmount: order.total,
    engineVersion: VERIFICATION_ENGINE_VERSION,
    evaluatedAt: now,
  };

  const orderRef = refs.ordersCol.doc(order.id);
  const verificationRef = refs.verificationsCol.doc(order.id);
  return orderRef.firestore.runTransaction(async (tx) => {
    const [orderSnap, verificationSnap] = await tx.getAll(orderRef, verificationRef);
    if (verificationSnap.exists) return docData<OrderVerification>(verificationSnap);
    if (orderSnap.data()?.orderStatus !== "pending") return null;
    tx.create(verificationRef, verification);
    return { id: order.id, ...verification };
  });
}

/** Stored verification, or a fresh evaluation when it's missing for a still-pending COD
 * order (orders placed before this feature, or a failed background run). Throws on
 * Firestore errors - callers decide whether to fail open or closed. */
async function loadOrCreateVerification(
  order: Order,
  refs: Pick<VerificationRefs, "ordersCol" | "verificationsCol">
): Promise<OrderVerification | null> {
  if (!requiresCodVerification(order.paymentMethod)) return null;
  const snap = await refs.verificationsCol.doc(order.id).get();
  if (snap.exists) return docData<OrderVerification>(snap);
  if (order.orderStatus !== "pending") return null;
  return runOrderVerification(order, refs);
}

/** For the order detail page - never throws (the card is simply hidden on error and the
 * evaluation is retried on the next view). */
export async function ensureOrderVerification(order: Order): Promise<OrderVerification | null> {
  try {
    return await loadOrCreateVerification(order, await getVerificationRefs());
  } catch (err) {
    console.error(`[order-verification] evaluation failed for order ${order.id}`, err);
    return null;
  }
}

/**
 * Server-side guard for every fulfillment step (status beyond "pending" other than
 * cancellation, shipment/courier details, packing slip/shipping label): returns a reason
 * string when a COD order hasn't been approved by an admin yet, or null when allowed.
 * Fails CLOSED - if the verification can't be loaded, fulfillment is blocked, not skipped.
 * Prepaid orders and older COD orders already past "pending" with no verification are
 * unaffected.
 */
export async function getCodFulfillmentBlock(
  order: Order,
  refs?: Pick<VerificationRefs, "ordersCol" | "verificationsCol">
): Promise<string | null> {
  if (!requiresCodVerification(order.paymentMethod)) return null;
  let verification: OrderVerification | null;
  try {
    verification = await loadOrCreateVerification(order, refs ?? (await getVerificationRefs()));
  } catch (err) {
    console.error(`[order-verification] could not load verification for ${order.id}`, err);
    return "COD verification could not be loaded. Please refresh and try again.";
  }
  if (!verification || verification.status === "admin_approved") return null;
  if (verification.status === "rejected") return "This COD order was rejected during verification.";
  return COD_VERIFICATION_REQUIRED_MESSAGE;
}

/** True while a COD order still awaits an admin verification decision - cancelling it
 * then must carry an explicit reason. Fails closed (true) if it can't be determined.
 * Always false for prepaid orders, without any read. */
export async function isCodVerificationPending(order: Order): Promise<boolean> {
  if (!requiresCodVerification(order.paymentMethod)) return false;
  try {
    const verification = await loadOrCreateVerification(order, await getVerificationRefs());
    return verification?.status === "pending";
  } catch (err) {
    console.error(`[order-verification] could not load verification for ${order.id}`, err);
    return true;
  }
}

/**
 * Applies an order status write atomically with the matching verification decision:
 * - `expectedStatus`: the order status the caller validated against; if another write
 *   changed it in between, nothing is written (OrderStateConflictError).
 * - `decision`: recorded only if the verification is still "pending" - first decision
 *   wins. With `requirePendingVerification`, a missing/decided verification aborts the
 *   whole write; otherwise the order write proceeds alone (prepaid/legacy orders).
 */
export async function commitOrderStatusChange(
  refs: Pick<VerificationRefs, "ordersCol" | "verificationsCol">,
  orderId: string,
  opts: {
    expectedStatus: OrderStatus;
    orderUpdate?: FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData>;
    decision?: OrderVerificationDecision;
    requirePendingVerification?: boolean;
  }
): Promise<{ verificationDecided: boolean }> {
  const orderRef = refs.ordersCol.doc(orderId);
  const verificationRef = refs.verificationsCol.doc(orderId);
  return orderRef.firestore.runTransaction(async (tx) => {
    const [orderSnap, verificationSnap] = await tx.getAll(orderRef, verificationRef);
    if (!orderSnap.exists) throw new OrderStateConflictError("Order not found.");
    if (orderSnap.data()?.orderStatus !== opts.expectedStatus) {
      throw new OrderStateConflictError("This order was just updated by someone else. Refresh and try again.");
    }
    const verificationPending = verificationSnap.exists && verificationSnap.data()?.status === "pending";
    if (opts.requirePendingVerification && !verificationPending) {
      throw new OrderStateConflictError("A verification decision has already been recorded for this order.");
    }
    if (opts.orderUpdate) tx.update(orderRef, opts.orderUpdate);
    const decide = !!opts.decision && verificationPending;
    if (decide) {
      tx.update(verificationRef, {
        status: opts.decision!.decision === "approved" ? "admin_approved" : "rejected",
        decision: stripUndefined(opts.decision!),
      });
    }
    return { verificationDecided: decide };
  });
}

async function logActivity(
  refs: VerificationRefs,
  orderId: string,
  action: OrderActivityAction,
  actorUid: string,
  meta?: Record<string, string>
) {
  // Same doc shape as order-activity-logs.ts's logOrderActivity(), on explicit refs.
  // Best-effort AFTER the transaction committed: a failed log write must not report the
  // (already applied, consistent) decision as failed.
  try {
    await refs.activityCol.add({ ...stripUndefined({ orderId, action, actorUid, meta }), createdAt: FieldValue.serverTimestamp() });
  } catch (err) {
    console.error(`[order-verification] failed to write activity log ${action} for ${orderId}`, err);
  }
}

export type VerificationDecisionInput =
  | { decision: "approved"; note?: string }
  | { decision: "rejected"; reasonCode: string; otherText?: string };

export type VerificationDecisionResult =
  | { ok: true; order: Order; statusChangedTo: "confirmed" | "cancelled" | null }
  | { ok: false; error: string };

/**
 * The Verification card's Confirm/Reject. Order status and verification decision
 * (decisionBy/decisionAt/reason) are written in ONE transaction, so they can never
 * disagree; concurrent decisions on the same order are resolved first-wins.
 * - Approve: a pending order moves to "confirmed" (same write shape as updateOrderStatus).
 * - Reject: mandatory reason; the order is cancelled (same fields as cancelOrder).
 */
export async function decideOrderVerification(
  refs: VerificationRefs,
  orderId: string,
  adminUid: string,
  input: VerificationDecisionInput
): Promise<VerificationDecisionResult> {
  let rejection: { code: NonNullable<OrderVerificationDecision["reasonCode"]>; reason: string } | null = null;
  if (input.decision === "rejected") {
    const resolved = resolveRejectionReason(input.reasonCode, input.otherText);
    if (!resolved.ok) return { ok: false, error: resolved.error };
    rejection = { code: resolved.code, reason: resolved.reason };
  }

  const order = docData<Order>(await refs.ordersCol.doc(orderId).get());
  if (!order) return { ok: false, error: "Order not found." };
  if (!requiresCodVerification(order.paymentMethod)) {
    return { ok: false, error: "Only cash-on-delivery orders go through verification." };
  }
  if (order.orderStatus === "cancelled" || order.orderStatus === "delivered" || order.orderStatus === "refunded") {
    return { ok: false, error: `This order is already ${order.orderStatus}.` };
  }
  const verification = await loadOrCreateVerification(order, refs);
  if (!verification) return { ok: false, error: "No verification is available for this order." };
  if (verification.status !== "pending") {
    return { ok: false, error: "A verification decision has already been recorded for this order." };
  }

  const now = Date.now();
  let decision: OrderVerificationDecision;
  let orderUpdate: FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData> | undefined;
  let statusChangedTo: "confirmed" | "cancelled" | null = null;

  if (input.decision === "approved") {
    const note = input.note?.trim().slice(0, 500) || undefined;
    decision = { decision: "approved", reason: note, source: "verification_card", decisionBy: adminUid, decisionAt: now };
    if (order.orderStatus === "pending") {
      statusChangedTo = "confirmed";
      orderUpdate = {
        orderStatus: "confirmed",
        statusHistory: FieldValue.arrayUnion({ status: "confirmed", at: now, note: note ? `COD verified: ${note}` : "COD verified by admin" }),
        updatedAt: FieldValue.serverTimestamp(),
      };
    }
  } else {
    const cancellationReason = `COD verification rejected: ${rejection!.reason}`;
    decision = {
      decision: "rejected",
      reasonCode: rejection!.code,
      reason: rejection!.reason,
      source: "verification_card",
      decisionBy: adminUid,
      decisionAt: now,
    };
    statusChangedTo = "cancelled";
    orderUpdate = {
      orderStatus: "cancelled",
      cancellationReason,
      cancelledAt: now,
      cancelledBy: adminUid,
      statusHistory: FieldValue.arrayUnion({ status: "cancelled", at: now, note: cancellationReason }),
      updatedAt: FieldValue.serverTimestamp(),
    };
  }

  try {
    await commitOrderStatusChange(refs, orderId, {
      expectedStatus: order.orderStatus,
      orderUpdate,
      decision,
      requirePendingVerification: true,
    });
  } catch (err) {
    if (err instanceof OrderStateConflictError) return { ok: false, error: err.message };
    throw err;
  }

  if (statusChangedTo === "confirmed") {
    await logActivity(refs, orderId, "status_changed", adminUid, { status: "confirmed" });
  } else if (statusChangedTo === "cancelled") {
    await logActivity(refs, orderId, "cancelled", adminUid, { reason: decision.reason ?? "" });
  }
  await logActivity(
    refs,
    orderId,
    input.decision === "approved" ? "verification_approved" : "verification_rejected",
    adminUid,
    {
      riskLevel: verification.riskLevel,
      recommendation: verification.recommendation,
      ...(decision.reason ? { reason: decision.reason } : {}),
    }
  );

  return { ok: true, order, statusChangedTo };
}
