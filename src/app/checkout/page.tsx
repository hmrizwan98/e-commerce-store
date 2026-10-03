import {
  getShippingSettings,
  getGeneralSettings,
  getPaymentSettings,
  getWhatsAppSettings,
} from "@/lib/firebase/repositories/site-settings";
import { formatPhoneNumber } from "@/lib/notifications/whatsapp-service";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";
// Headroom for the placeGuestOrder Server Action (it runs under this route) - the
// platform default is 10s, and a cut-off response breaks the "Thank you" screen.
export const maxDuration = 60;

const CheckoutPage = async () => {
  const [shipping, general, paymentSettings, whatsappSettings] = await Promise.all([
    getShippingSettings(),
    getGeneralSettings(),
    getPaymentSettings(),
    getWhatsAppSettings(),
  ]);

  const rawNum = whatsappSettings.phoneNumber || general.storePhone || "";
  const storeWhatsappNumber = rawNum ? formatPhoneNumber(rawNum) : "";

  return (
    <CheckoutClient
      shippingFlatRate={shipping.flatRate}
      freeShippingThreshold={shipping.freeShippingThreshold}
      taxRatePercent={general.taxRatePercent}
      taxInclusive={general.taxInclusive}
      paymentSettings={paymentSettings}
      storeWhatsappNumber={storeWhatsappNumber}
    />
  );
};

export default CheckoutPage;
