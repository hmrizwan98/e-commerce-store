import { createStubProvider } from "../stub-provider";

// Cash on Delivery is already a real, working flow in Checkout (see PaymentSettings.cod)
// - this stub exists only so cod has a PaymentProvider entry alongside the other
// providers in the registry below.
export const codProvider = createStubProvider("cod", "Cash on Delivery");
