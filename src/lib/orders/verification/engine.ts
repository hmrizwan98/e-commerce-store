/** COD Order Verification Engine (Phase 1) - pure, local, explainable rules. No network,
 * no AI/paid service. It only ADVISES (risk level + recommendation + reasons); it never
 * confirms or rejects an order. A risk level is a prompt to check, not proof of fraud. */

import type { OrderAddress, OrderItem, OrderStatus, OrderStatusHistoryEntry, PaymentMethod, ReturnStatus } from "@/types/order";
import type {
  CustomerHistorySummary,
  OrderRejectionReasonCode,
  OrderRiskLevel,
  OrderVerificationReason,
  OrderVerificationRecommendation,
} from "@/types/order-verification";
import { normalizePhone } from "./phone";

export const VERIFICATION_ENGINE_VERSION = 1;

/** Only cash-on-delivery orders go through verification - prepaid methods
 * (bank transfer / JazzCash) already have their own payment-proof review. */
export function requiresCodVerification(paymentMethod: PaymentMethod): boolean {
  return paymentMethod === "cod";
}

export const REJECTION_REASONS: { code: OrderRejectionReasonCode; label: string }[] = [
  { code: "customer_cancelled", label: "Customer cancelled" },
  { code: "unreachable", label: "Customer could not be reached" },
  { code: "wrong_phone", label: "Wrong phone number" },
  { code: "invalid_address", label: "Invalid/incomplete address" },
  { code: "denied_order", label: "Customer denied placing the order" },
  { code: "duplicate", label: "Duplicate order" },
  { code: "repeated_rto", label: "Previous repeated RTO" },
  { code: "suspicious", label: "Suspicious order" },
  { code: "customer_requested_cancellation", label: "Customer requested cancellation" },
  { code: "other", label: "Other" },
];

/** Validates a reject request - returns the final human-readable reason, or an error. */
export function resolveRejectionReason(
  code: string | undefined,
  otherText: string | undefined
): { ok: true; code: OrderRejectionReasonCode; reason: string } | { ok: false; error: string } {
  const preset = REJECTION_REASONS.find((r) => r.code === code);
  if (!preset) return { ok: false, error: "Please select a rejection reason." };
  if (preset.code === "other") {
    const text = (otherText ?? "").trim();
    if (text.length < 3) return { ok: false, error: "Please describe the reason for rejecting this order." };
    return { ok: true, code: preset.code, reason: text.slice(0, 500) };
  }
  return { ok: true, code: preset.code, reason: preset.label };
}

/** The few fields of a previous order the engine needs (see order-verifications.ts's
 * `.select()` - keeps the history read small). */
export interface HistoryOrder {
  id: string;
  orderStatus: OrderStatus;
  statusHistory?: OrderStatusHistoryEntry[];
  returnStatus?: ReturnStatus;
  total?: number;
  createdAt?: number;
}

const OPEN_STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "packed", "shipped"];
const DAY_MS = 24 * 60 * 60 * 1000;

export function summarizeHistory(
  orders: HistoryOrder[],
  opts: { excludeOrderId: string; now: number; truncated: boolean }
): CustomerHistorySummary {
  const previous = orders.filter((o) => o.id !== opts.excludeOrderId);
  let delivered = 0;
  let cancelled = 0;
  let rto = 0;
  let returned = 0;
  let open = 0;
  let last24h = 0;
  let lastOrderAt: number | undefined;
  let deliveredTotal = 0;

  for (const o of previous) {
    if (o.orderStatus === "delivered") {
      delivered++;
      deliveredTotal += o.total ?? 0;
    }
    if (o.orderStatus === "cancelled") {
      // No dedicated RTO status exists in the order lifecycle - a cancellation that
      // happens after the order was shipped is the reliable signal of a failed delivery.
      const wasShipped = o.statusHistory?.some((h) => h.status === "shipped");
      if (wasShipped) rto++;
      else cancelled++;
    }
    if (o.returnStatus === "received" || o.returnStatus === "completed") returned++;
    if (OPEN_STATUSES.includes(o.orderStatus)) open++;
    if (o.createdAt) {
      if (opts.now - o.createdAt <= DAY_MS) last24h++;
      if (!lastOrderAt || o.createdAt > lastOrderAt) lastOrderAt = o.createdAt;
    }
  }

  return {
    totalOrders: previous.length,
    deliveredOrders: delivered,
    cancelledOrders: cancelled,
    rtoOrders: rto,
    returnedOrders: returned,
    openOrders: open,
    ordersLast24h: last24h,
    lastOrderAt,
    averageOrderValue: delivered > 0 ? Math.round((deliveredTotal / delivered) * 100) / 100 : undefined,
    truncated: opts.truncated,
  };
}

export interface VerificationInput {
  total: number;
  items: Pick<OrderItem, "quantity">[];
  shippingAddress: Partial<OrderAddress>;
  guestName?: string;
  history: CustomerHistorySummary;
}

export interface VerificationResult {
  riskLevel: OrderRiskLevel;
  recommendation: OrderVerificationRecommendation;
  reasons: OrderVerificationReason[];
  normalizedPhone: string;
}

const RECOMMENDATION_BY_RISK: Record<OrderRiskLevel, OrderVerificationRecommendation> = {
  LOW: "RECOMMEND_CONFIRM",
  MEDIUM: "CALL_CUSTOMER",
  HIGH: "MANUAL_REVIEW",
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * Risk level rules (every rule that fires adds a human-readable reason):
 * - HIGH: any "critical" reason (repeated RTO/cancellations, invalid phone, seriously
 *   incomplete address, burst of orders) or 3+ warnings.
 * - MEDIUM: any "warning" or "info" reason without positive history to offset it
 *   (e.g. first order, incomplete address, unusual amount/quantity).
 * - LOW: proven delivery history and nothing above.
 */
export function evaluateOrderVerification(input: VerificationInput): VerificationResult {
  const reasons: OrderVerificationReason[] = [];
  const add = (code: string, severity: OrderVerificationReason["severity"], message: string) =>
    reasons.push({ code, severity, message });
  const h = input.history;
  const addr = input.shippingAddress;

  // Phone
  const phone = normalizePhone(addr.phone);
  if (!phone.isValid) {
    add("phone_invalid", "critical", "Phone number is missing or not in a valid format.");
  } else if (!phone.isPakistaniMobile) {
    add("phone_not_mobile", "info", "Phone number is not a Pakistani mobile number - WhatsApp/SMS may not reach it.");
  }

  // Customer history (same phone, this store only)
  if (h.rtoOrders >= 2) {
    add("repeated_rto", "critical", `${plural(h.rtoOrders, "previous order")} failed after dispatch (RTO).`);
  } else if (h.rtoOrders === 1) {
    add("previous_rto", "warning", "1 previous order failed after dispatch (RTO).");
  }
  if (h.cancelledOrders >= 3) {
    add("repeated_cancellations", "critical", `${plural(h.cancelledOrders, "previous order")} were cancelled before dispatch.`);
  } else if (h.cancelledOrders > 0) {
    add("previous_cancellations", "warning", `${plural(h.cancelledOrders, "previous order")} cancelled before dispatch.`);
  }
  if (h.ordersLast24h >= 3) {
    add("order_burst", "critical", `${plural(h.ordersLast24h, "other order")} from this phone in the last 24 hours.`);
  } else if (h.ordersLast24h >= 1) {
    add("recent_orders", "warning", `${plural(h.ordersLast24h, "other order")} from this phone in the last 24 hours - check for duplicates.`);
  }
  if (h.totalOrders === 0) {
    add("new_customer", "info", "First order from this phone number - no delivery history yet.");
  } else if (h.deliveredOrders > 0) {
    add("delivered_history", "positive", `Returning customer with ${plural(h.deliveredOrders, "delivered order")}.`);
  } else {
    add("no_delivered_history", "info", `${plural(h.totalOrders, "previous order")}, none delivered yet.`);
  }

  // Address
  const line1 = (addr.line1 ?? "").trim();
  const city = (addr.city ?? "").trim();
  if (!city && line1.length < 10) {
    add("address_missing", "critical", "Delivery address and city are missing or too short to deliver.");
  } else if (!city) {
    add("city_missing", "critical", "City is missing from the delivery address.");
  } else if (line1.length < 10) {
    add("address_short", "warning", "Street address is very short - confirm the full address with the customer.");
  }
  const name = (addr.fullName || input.guestName || "").trim();
  if (name.length < 3) add("name_missing", "warning", "Customer name is missing or very short.");

  // Order
  const totalQuantity = input.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const maxLineQuantity = input.items.reduce((max, i) => Math.max(max, i.quantity || 0), 0);
  if (totalQuantity >= 10 || maxLineQuantity >= 6) {
    add("large_quantity", "warning", `Unusually large quantity (${totalQuantity} items in total).`);
  }
  if (h.averageOrderValue && h.averageOrderValue > 0 && input.total > h.averageOrderValue * 3) {
    add(
      "high_value_vs_history",
      "warning",
      `Order value is more than 3x this customer's average delivered order (${h.averageOrderValue.toFixed(2)}).`
    );
  }

  const criticalCount = reasons.filter((r) => r.severity === "critical").length;
  const warningCount = reasons.filter((r) => r.severity === "warning").length;
  const infoCount = reasons.filter((r) => r.severity === "info").length;
  const hasPositive = reasons.some((r) => r.severity === "positive");

  let riskLevel: OrderRiskLevel;
  if (criticalCount > 0 || warningCount >= 3) riskLevel = "HIGH";
  else if (warningCount > 0 || (infoCount > 0 && !hasPositive)) riskLevel = "MEDIUM";
  else riskLevel = "LOW";

  return {
    riskLevel,
    recommendation: RECOMMENDATION_BY_RISK[riskLevel],
    reasons,
    normalizedPhone: phone.international,
  };
}
