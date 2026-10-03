/** COD Order Verification (Phase 1) - advisory only. The engine never confirms or
 * rejects an order by itself; the Store Admin always makes the final decision.
 *
 * Tenant-scoped and admin-only: stores/{storeId}/orderVerifications/{orderId} (doc id ==
 * order id). Kept OFF the order doc so risk reasons never travel with order data, and
 * removed with the store by deleteStore()'s recursiveDelete of stores/{id}. */

export type OrderVerificationStatus = "pending" | "admin_approved" | "rejected";
export type OrderRiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type OrderVerificationRecommendation = "RECOMMEND_CONFIRM" | "CALL_CUSTOMER" | "MANUAL_REVIEW";

export type VerificationReasonSeverity = "positive" | "info" | "warning" | "critical";

export interface OrderVerificationReason {
  code: string;
  severity: VerificationReasonSeverity;
  message: string;
}

/** Summary of this store's previous orders for the same phone number. */
export interface CustomerHistorySummary {
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  /** Cancelled after being shipped - treated as failed delivery / return-to-origin. */
  rtoOrders: number;
  returnedOrders: number;
  /** Orders still in progress (pending → shipped). */
  openOrders: number;
  ordersLast24h: number;
  lastOrderAt?: number;
  /** Average total of previously delivered orders, when there are any. */
  averageOrderValue?: number;
  /** True when the history lookup hit its cap, so counts are a lower bound. */
  truncated: boolean;
}

export type OrderRejectionReasonCode =
  | "customer_cancelled"
  | "unreachable"
  | "wrong_phone"
  | "invalid_address"
  | "denied_order"
  | "duplicate"
  | "repeated_rto"
  | "suspicious"
  | "customer_requested_cancellation"
  | "other";

export interface OrderVerificationDecision {
  decision: "approved" | "rejected";
  reasonCode?: OrderRejectionReasonCode;
  /** Human-readable reason (preset label, "Other" text, or optional confirm note). */
  reason?: string;
  /** "verification_card" for the Verification card, "order_status" when the admin
   * confirmed/cancelled through the existing status controls instead. */
  source: "verification_card" | "order_status";
  decisionBy: string;
  decisionAt: number;
}

export interface OrderVerification {
  id: string;
  orderId: string;
  status: OrderVerificationStatus;
  riskLevel: OrderRiskLevel;
  recommendation: OrderVerificationRecommendation;
  reasons: OrderVerificationReason[];
  history: CustomerHistorySummary;
  /** Normalized phone (+92...) used for the history lookup; empty when invalid. */
  normalizedPhone: string;
  codAmount: number;
  engineVersion: number;
  evaluatedAt: number;
  decision?: OrderVerificationDecision;
}
