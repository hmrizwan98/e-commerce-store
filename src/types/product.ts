export type ProductStatusValue = "draft" | "active" | "archived";

export type ProductBadge = "new" | "sold_out" | "limited_edition" | "sale" | null;

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
  order?: number;
  seoTitle?: string;
  seoDescription?: string;
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
