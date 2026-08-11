import { getShippingSettings, getGeneralSettings } from "@/lib/firebase/repositories/site-settings";
import { getActiveThemeConfig } from "@/lib/theme/theme-repository";
import ThemeCartAdapter from "@/components/theme/ThemeCartAdapter";

export const dynamic = "force-dynamic";

const CartPage = async () => {
  const [shipping, general, theme] = await Promise.all([getShippingSettings(), getGeneralSettings(), getActiveThemeConfig()]);

  return (
    <ThemeCartAdapter
      shippingFlatRate={shipping.flatRate}
      freeShippingThreshold={shipping.freeShippingThreshold}
      taxRatePercent={general.taxRatePercent}
      taxInclusive={general.taxInclusive}
      cartSettings={theme.cart}
    />
  );
};

export default CartPage;
