import { createStubProvider } from "../stub-provider";

// Bank Transfer is already a real, working manual/instructions-based flow in Checkout
// (see PaymentSettings.bankTransfer) - this stub exists only so bank_transfer has a
// PaymentProvider entry alongside the other providers in the registry below.
export const bankTransferProvider = createStubProvider("bank_transfer", "Bank Transfer");
