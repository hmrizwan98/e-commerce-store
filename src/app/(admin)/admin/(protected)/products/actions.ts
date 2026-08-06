"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined, docData } from "@/lib/firebase/repositories/utils";
import { deleteImagesByUrls, diffRemovedImages } from "@/lib/images/cleanup";
import { getProductById } from "@/lib/firebase/repositories/products";
import { logProductActivity } from "@/lib/firebase/repositories/product-activity-logs";
import { generateSku } from "@/lib/firebase/services/sku-generator";
import { queueProductExport, queueProductImport } from "@/lib/firebase/services/product-bulk-service";
import type {
  Product,
  ProductAttribute,
  ProductBadge,
  ProductStatusValue,
  ProductVariant,
  OutOfStockBehavior,
} from "@/types/product";

export interface ProductVariantInput {
  attributeSelections: Record<string, string>;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  image?: string;
  stock: number;
  isDefault?: boolean;
}

export interface ProductFormInput {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku?: string;
  barcode?: string;
  brandId?: string;
  categoryIds: string[];
  tags: string[];
  images: string[];
  videoUrl?: string;
  status: ProductStatusValue;
  badge?: ProductBadge;
  price: number;
  compareAtPrice?: number;
  stock: number;
  trackInventory: boolean;
  lowStockThreshold?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  relatedProductIds?: string[];
  crossSellProductIds?: string[];
  upsellProductIds?: string[];
  frequentlyBoughtWithProductIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
  costPrice?: number;
  supplierId?: string;
  collectionIds?: string[];
  reservedStock?: number;
  outOfStockBehavior?: OutOfStockBehavior;
  scheduledPublishAt?: number | null;
  attributes: ProductAttribute[];
  hasVariants: boolean;
  variants: ProductVariantInput[];
}

function computeFacets(attributes: ProductAttribute[], name: string) {
  const colorFacets: string[] = [];
  const sizeFacets: string[] = [];
  for (const attr of attributes) {
    const values = attr.values.map((v) => (typeof v === "string" ? v : v.label).toLowerCase());
    if (attr.type === "color") colorFacets.push(...values);
    if (attr.name.trim().toLowerCase() === "size") sizeFacets.push(...values);
  }
  return { colorFacets, sizeFacets, nameLower: name.trim().toLowerCase() };
}

/** Server-side range guard - the admin form already prevents negative input, but a
 * direct Server Action call (or a client bug) shouldn't be able to persist a negative
 * price/stock, since checkout trusts these fields as authoritative. */
function validateProductNumbers(input: {
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  reservedStock?: number;
  lowStockThreshold?: number;
}) {
  const checks: [string, number | undefined][] = [
    ["Price", input.price],
    ["Compare-at price", input.compareAtPrice],
    ["Cost price", input.costPrice],
    ["Stock", input.stock],
    ["Reserved stock", input.reservedStock],
    ["Low stock threshold", input.lowStockThreshold],
  ];
  for (const [label, value] of checks) {
    if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
      throw new Error(`${label} cannot be negative.`);
    }
  }
}

function revalidateStorefront(slug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/collection");
  revalidatePath("/collection-2");
  revalidatePath("/search");
  if (slug) revalidatePath(`/product/${slug}`);
}

async function writeVariants(productId: string, variants: ProductVariantInput[]) {
  const col = await tenantCollection("products");
  const ref = col.doc(productId);
  const existing = await ref.collection("variants").get();
  const batch = adminDb().batch();
  existing.docs.forEach((d) => batch.delete(d.ref));
  variants.forEach((v, i) => {
    const vRef = ref.collection("variants").doc();
    batch.set(vRef, stripUndefined({ ...v, productId, order: i }));
  });
  await batch.commit();
}

export async function createProduct(input: ProductFormInput): Promise<string> {
  const decoded = await requireAdmin();
  validateProductNumbers(input);
  const { variants, ...rest } = input;
  const facets = computeFacets(input.attributes, input.name);
  const col = await tenantCollection("products");
  const ref = col.doc();

  await ref.set({
    ...stripUndefined({ ...rest, ...facets }),
    rating: 0,
    numberOfReviews: 0,
    isDeleted: false,
    deletedAt: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (input.hasVariants && variants.length) {
    await writeVariants(ref.id, variants);
  }

  revalidateStorefront(input.slug);
  await logProductActivity(ref.id, "created", decoded.uid);
  return ref.id;
}

export async function updateProduct(id: string, input: ProductFormInput): Promise<void> {
  const decoded = await requireAdmin();
  validateProductNumbers(input);
  const { variants, ...rest } = input;
  const facets = computeFacets(input.attributes, input.name);
  const col = await tenantCollection("products");
  const ref = col.doc(id);

  const before = docData<Product>(await ref.get());
  const beforeVariantImages = (await ref.collection("variants").get()).docs.map(
    (d) => d.data().image as string | undefined
  );

  await ref.update({
    ...stripUndefined({ ...rest, ...facets }),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeVariants(id, input.hasVariants ? variants : []);
  revalidateStorefront(input.slug);
  await logProductActivity(id, "updated", decoded.uid);

  const newVariantImages = input.hasVariants ? variants.map((v) => v.image) : [];
  await deleteImagesByUrls([
    ...diffRemovedImages(before?.images ?? [], input.images),
    ...diffRemovedImages(beforeVariantImages, newVariantImages),
  ]);
}

export async function softDeleteProduct(id: string, slug?: string): Promise<void> {
  const decoded = await requireAdmin();
  const col = await tenantCollection("products");
  await col
    .doc(id)
    .update({ isDeleted: true, deletedAt: Date.now(), updatedAt: FieldValue.serverTimestamp() });
  revalidateStorefront(slug);
  await logProductActivity(id, "trashed", decoded.uid);
}

export async function restoreProduct(id: string, slug?: string): Promise<void> {
  const decoded = await requireAdmin();
  const col = await tenantCollection("products");
  await col
    .doc(id)
    .update({ isDeleted: false, deletedAt: null, updatedAt: FieldValue.serverTimestamp() });
  revalidateStorefront(slug);
  await logProductActivity(id, "restored", decoded.uid);
}

/**
 * Distinct from softDeleteProduct/restoreProduct, which keep the doc (and
 * its images) around for the trash/restore flow. This hard-deletes the
 * product doc and its variants, and cleans up every associated Storage
 * image - meant for a "Delete permanently" action on an already-trashed
 * product.
 */
export async function permanentlyDeleteProduct(id: string): Promise<void> {
  const decoded = await requireAdmin();
  const col = await tenantCollection("products");
  const ref = col.doc(id);
  const product = docData<Product>(await ref.get());
  const variantsSnap = await ref.collection("variants").get();
  const variantImages = variantsSnap.docs
    .map((d) => docData<ProductVariant>(d))
    .map((v) => v?.image);

  const batch = adminDb().batch();
  variantsSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(ref);
  await batch.commit();

  await deleteImagesByUrls([...(product?.images ?? []), ...variantImages]);
  revalidateStorefront(product?.slug);
  await logProductActivity(id, "permanently_deleted", decoded.uid);
}

export async function adjustProductStock(id: string, stock: number): Promise<void> {
  const decoded = await requireAdmin();
  if (!Number.isFinite(stock) || stock < 0) {
    throw new Error("Stock cannot be negative.");
  }
  const col = await tenantCollection("products");
  await col
    .doc(id)
    .update({ stock, updatedAt: FieldValue.serverTimestamp() });
  revalidatePath("/admin/inventory");
  revalidateStorefront();
  await logProductActivity(id, "stock_adjusted", decoded.uid, { newStock: String(stock) });
}

/** Suggests a SKU - admin can still type their own; nothing forces auto-generation. */
export async function generateProductSku(productName: string, excludeProductId?: string): Promise<string> {
  await requireAdmin();
  return generateSku(productName, excludeProductId);
}

/**
 * Duplicates a product (and its variants subcollection) as a new draft - same field-by-field
 * copy shape as the existing duplicateBanner()/duplicateTestimonial() patterns. sku/barcode
 * are cleared (never copied) so the duplicate never collides with the original.
 */
export async function duplicateProduct(id: string): Promise<string> {
  const decoded = await requireAdmin();
  const product = await getProductById(id);
  if (!product) throw new Error("Product not found");

  const col = await tenantCollection("products");
  const ref = col.doc();
  const slug = `${product.slug}-copy-${Date.now().toString(36)}`;

  await ref.set({
    ...stripUndefined({
      name: `${product.name} (copy)`,
      slug,
      description: product.description,
      shortDescription: product.shortDescription,
      barcode: undefined,
      sku: undefined,
      brandId: product.brandId,
      categoryIds: product.categoryIds,
      collectionIds: product.collectionIds,
      supplierId: product.supplierId,
      tags: product.tags,
      images: product.images,
      videoUrl: product.videoUrl,
      badge: product.badge,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      costPrice: product.costPrice,
      stock: product.stock,
      trackInventory: product.trackInventory,
      lowStockThreshold: product.lowStockThreshold,
      outOfStockBehavior: product.outOfStockBehavior,
      attributes: product.attributes,
      hasVariants: product.hasVariants,
      relatedProductIds: product.relatedProductIds,
      crossSellProductIds: product.crossSellProductIds,
      upsellProductIds: product.upsellProductIds,
      frequentlyBoughtWithProductIds: product.frequentlyBoughtWithProductIds,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      colorFacets: product.colorFacets,
      sizeFacets: product.sizeFacets,
      nameLower: `${product.name} (copy)`.trim().toLowerCase(),
    }),
    status: "draft" satisfies ProductStatusValue,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isOnSale: false,
    rating: 0,
    numberOfReviews: 0,
    isDeleted: false,
    deletedAt: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (product.hasVariants) {
    const variantsSnap = await col.doc(id).collection("variants").get();
    if (!variantsSnap.empty) {
      const batch = adminDb().batch();
      variantsSnap.docs.forEach((doc) => {
        const data = doc.data() as ProductVariant;
        batch.set(ref.collection("variants").doc(), {
          ...stripUndefined({ ...data, sku: undefined }),
          productId: ref.id,
        });
      });
      await batch.commit();
    }
  }

  revalidateStorefront();
  await logProductActivity(ref.id, "duplicated", decoded.uid, { sourceProductId: id });
  return ref.id;
}

// --- Bulk import/export (architecture only - see product-bulk-service.ts) ---

export async function requestProductExport(): Promise<void> {
  await requireAdmin();
  await queueProductExport();
  revalidatePath("/admin/products/bulk");
}

export async function requestProductImport(fileName?: string): Promise<void> {
  await requireAdmin();
  await queueProductImport(fileName);
  revalidatePath("/admin/products/bulk");
}
