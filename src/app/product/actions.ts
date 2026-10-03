"use server";

import { getProductVariants } from "@/lib/firebase/repositories/products";
import type { ProductVariant } from "@/types/product";

/** For the quick-view modal - product cards don't carry variants, but adding a variant
 * product to the cart needs the matching variant (id/price/stock), exactly as the product
 * page does. Tenant-scoped (getProductVariants reads stores/{current}/products/...). */
export async function getQuickViewVariants(productId: string): Promise<ProductVariant[]> {
  if (typeof productId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(productId)) return [];
  try {
    return await getProductVariants(productId);
  } catch (err) {
    console.error("[quick-view] failed to load variants", err);
    return [];
  }
}
