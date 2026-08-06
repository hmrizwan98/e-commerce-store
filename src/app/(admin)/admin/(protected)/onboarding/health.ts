import type { GeneralSettings, ShippingSettings, PaymentSettings } from "@/types/site-settings";
import type { ThemeLogos } from "@/types/theme";

export interface StoreHealthCheck {
  label: string;
  healthy: boolean;
}

/** Pure, storage-free snapshot of real configuration completeness - distinct from the
 * wizard's own completedSteps (which tracks "has this step been visited/saved"), this
 * reflects the actual current settings values regardless of how they got there. */
export function computeStoreHealth(
  general: GeneralSettings,
  shipping: ShippingSettings,
  payments: PaymentSettings,
  logos: ThemeLogos
): StoreHealthCheck[] {
  return [
    { label: "Brand name set", healthy: Boolean(general.storeName?.trim()) },
    { label: "Logo uploaded", healthy: Boolean(logos.logoLight || logos.favicon) },
    { label: "Contact info set", healthy: Boolean(general.storeEmail?.trim() && general.storePhone?.trim()) },
    { label: "Currency & timezone set", healthy: Boolean(general.currency?.trim() && general.timezone?.trim()) },
    { label: "Shipping configured", healthy: shipping.flatRate > 0 || Boolean(shipping.freeShippingThreshold) },
    {
      label: "A payment method is enabled",
      healthy: payments.cod.enabled || payments.bankTransfer.enabled || payments.jazzcash.enabled,
    },
  ];
}
