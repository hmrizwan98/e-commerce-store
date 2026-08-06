export type ProductStatusValue = "draft" | "active" | "archived";

export type ProductBadge = "new" | "sold_out" | "limited_edition" | "sale" | null;

/** What the storefront should do when trackInventory is on and available stock hits 0 -
 * metadata only in this phase, not enforced by Checkout/Orders (out of scope here). */
export type OutOfStockBehavior = "hide" | "show_disabled" | "allow_backorder";

export type ProductAttributeType = "color" | "text" | "image";

export interface ProductAttributeValue {
  label: string;
  hex?: string;
  image?: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  type: ProductAttributeType;
  values: string[] | ProductAttributeValue[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  barcode?: string;
  brandId?: string;
  categoryIds: string[];
  tags: string[];
  images: string[];
  videoUrl?: string;
  status: ProductStatusValue;
  badge?: ProductBadge;
  stock: number;
  trackInventory: boolean;
  attributes: ProductAttribute[];
  hasVariants: boolean;
  rating?: number;
  numberOfReviews?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  relatedProductIds?: string[];
  crossSellProductIds?: string[];
  upsellProductIds?: string[];
  frequentlyBoughtWithProductIds?: string[];
  order?: number;
  seoTitle?: string;
  seoDescription?: string;
  /** Procurement cost - admin/reporting only, never shown to customers. Profit margin is
   * derived from this + price at read time (see lib/products/profit-margin.ts), not stored. */
  costPrice?: number;
  supplierId?: string;
  collectionIds?: string[];
  /** Stock held against unconfirmed orders/carts. Available stock = stock - reservedStock,
   * computed at read time, not stored. Not yet incremented/decremented by Checkout/Orders
   * (out of scope here) - schema/admin-UI ready for that phase to wire in. */
  reservedStock?: number;
  outOfStockBehavior?: OutOfStockBehavior;
  /** Metadata only - no automatic draft->active flip is performed anywhere yet (would need a
   * scheduled job, out of scope here). */
  scheduledPublishAt?: number | null;
  // Denormalized, server-computed only (never client-submitted) - see products
  // repository / admin Server Actions for where these are derived from `attributes`/`name`.
  colorFacets?: string[];
  sizeFacets?: string[];
  nameLower?: string;
  lowStockThreshold?: number;
  isDeleted?: boolean;
  deletedAt?: number | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  attributeSelections: Record<string, string>;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  image?: string;
  stock: number;
  isDefault?: boolean;
  order: number;
}
