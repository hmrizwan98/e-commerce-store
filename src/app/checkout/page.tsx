import {
  getShippingSettings,
  getGeneralSettings,
  getPaymentSettings,
} from "@/lib/firebase/repositories/site-settings";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

const CheckoutPage = async () => {
  const [shipping, general, paymentSettings] = await Promise.all([
    getShippingSettings(),
    getGeneralSettings(),
    getPaymentSettings(),
  ]);

  return (
    <CheckoutClient
      shippingFlatRate={shipping.flatRate}
      freeShippingThreshold={shipping.freeShippingThreshold}
      taxRatePercent={general.taxRatePercent}
      taxInclusive={general.taxInclusive}
      paymentSettings={paymentSettings}
    />
  );
};

export default CheckoutPage;
