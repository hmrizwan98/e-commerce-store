/** Multi-payment Provider Architecture - interfaces only, no live integrations.
 * Deliberately isolated from Checkout/createGuestOrder and the existing
 * PaymentMethod/PaymentSettings types - this is forward-looking scaffolding for a
 * future phase, not wired into any current code path. */

export type PaymentProviderId = "stripe" | "paypal" | "jazzcash" | "easypaisa" | "bank_transfer" | "cod";

export interface PaymentInitiationResult {
  success: boolean;
  providerReference?: string;
  message: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  status: "pending" | "paid" | "failed";
  message: string;
}

export interface RefundResult {
  success: boolean;
  providerReference?: string;
  message: string;
}

export interface PaymentProvider {
  readonly id: PaymentProviderId;
  readonly displayName: string;
  initiatePayment(amount: number, orderId: string): Promise<PaymentInitiationResult>;
  verifyPayment(providerReference: string): Promise<PaymentVerificationResult>;
  refundPayment(providerReference: string, amount: number): Promise<RefundResult>;
}
