"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined, docData } from "@/lib/firebase/repositories/utils";
import { deleteImagesByUrls, diffRemovedImages } from "@/lib/images/cleanup";
import type { Product, ProductAttribute, ProductBadge, ProductStatusValue, ProductVariant } from "@/types/product";

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
  seoTitle?: string;
  seoDescription?: string;
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

function revalidateStorefront(slug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/collection");
  revalidatePath("/collection-2");
  revalidatePath("/search");
  if (slug) revalidatePath(`/product/${slug}`);
}

async function writeVariants(productId: string, variants: ProductVariantInput[]) {
  const ref = adminDb().collection("products").doc(productId);
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
  await requireAdmin();
  const { variants, ...rest } = input;
  const facets = computeFacets(input.attributes, input.name);
  const ref = adminDb().collection("products").doc();

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
  return ref.id;
}

export async function updateProduct(id: string, input: ProductFormInput): Promise<void> {
  await requireAdmin();
  const { variants, ...rest } = input;
  const facets = computeFacets(input.attributes, input.name);
  const ref = adminDb().collection("products").doc(id);

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

  const newVariantImages = input.hasVariants ? variants.map((v) => v.image) : [];
  await deleteImagesByUrls([
    ...diffRemovedImages(before?.images ?? [], input.images),
    ...diffRemovedImages(beforeVariantImages, newVariantImages),
  ]);
}

export async function softDeleteProduct(id: string, slug?: string): Promise<void> {
  await requireAdmin();
  await adminDb()
    .collection("products")
    .doc(id)
    .update({ isDeleted: true, deletedAt: Date.now(), updatedAt: FieldValue.serverTimestamp() });
  revalidateStorefront(slug);
}

export async function restoreProduct(id: string, slug?: string): Promise<void> {
  await requireAdmin();
  await adminDb()
    .collection("products")
    .doc(id)
    .update({ isDeleted: false, deletedAt: null, updatedAt: FieldValue.serverTimestamp() });
  revalidateStorefront(slug);
}

/**
 * Distinct from softDeleteProduct/restoreProduct, which keep the doc (and
 * its images) around for the trash/restore flow. This hard-deletes the
 * product doc and its variants, and cleans up every associated Storage
 * image - meant for a "Delete permanently" action on an already-trashed
 * product.
 */
export async function permanentlyDeleteProduct(id: string): Promise<void> {
  await requireAdmin();
  const ref = adminDb().collection("products").doc(id);
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
}

export async function adjustProductStock(id: string, stock: number): Promise<void> {
  await requireAdmin();
  await adminDb()
    .collection("products")
    .doc(id)
    .update({ stock, updatedAt: FieldValue.serverTimestamp() });
  revalidatePath("/admin/inventory");
  revalidateStorefront();
}
