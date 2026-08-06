import type { PaymentProvider, PaymentProviderId } from "./provider";
import { stripeProvider } from "./providers/stripe";
import { paypalProvider } from "./providers/paypal";
import { jazzcashProvider } from "./providers/jazzcash";
import { easypaisaProvider } from "./providers/easypaisa";
import { bankTransferProvider } from "./providers/bank-transfer";
import { codProvider } from "./providers/cod";

/** Architecture only - not imported by Checkout or any existing code path. A future
 * phase would use this registry to look up a real provider implementation by id. */
export const PAYMENT_PROVIDERS: Record<PaymentProviderId, PaymentProvider> = {
  stripe: stripeProvider,
  paypal: paypalProvider,
  jazzcash: jazzcashProvider,
  easypaisa: easypaisaProvider,
  bank_transfer: bankTransferProvider,
  cod: codProvider,
};
