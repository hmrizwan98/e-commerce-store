import "server-only";
import type {
  PaymentProvider,
  PaymentProviderId,
  PaymentInitiationResult,
  PaymentVerificationResult,
  RefundResult,
} from "./provider";

/** Shared stub factory - every provider below returns the same clearly-labeled
 * not-yet-implemented result shape, avoiding six near-identical class bodies. */
export function createStubProvider(id: PaymentProviderId, displayName: string): PaymentProvider {
  const notImplemented = `${displayName} integration is architecture-only - not yet implemented.`;
  return {
    id,
    displayName,
    async initiatePayment(): Promise<PaymentInitiationResult> {
      return { success: false, message: notImplemented };
    },
    async verifyPayment(): Promise<PaymentVerificationResult> {
      return { verified: false, status: "pending", message: notImplemented };
    },
    async refundPayment(): Promise<RefundResult> {
      return { success: false, message: notImplemented };
    },
  };
}
