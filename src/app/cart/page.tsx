import { getShippingSettings, getGeneralSettings } from "@/lib/firebase/repositories/site-settings";
import CartClient from "./CartClient";

export const dynamic = "force-dynamic";

const CartPage = async () => {
  const [shipping, general] = await Promise.all([getShippingSettings(), getGeneralSettings()]);

  return (
    <CartClient
      shippingFlatRate={shipping.flatRate}
      freeShippingThreshold={shipping.freeShippingThreshold}
      taxRatePercent={general.taxRatePercent}
      taxInclusive={general.taxInclusive}
    />
  );
};

export default CartPage;
