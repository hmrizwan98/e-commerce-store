"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  createProduct,
  updateProduct,
  generateProductSku,
  type ProductFormInput,
  type ProductVariantInput,
} from "./actions";
import { calculateProfitMargin, calculateAvailableStock } from "@/lib/products/inventory-math";
import { slugify } from "@/lib/utils/slugify";
import type { Product, ProductAttribute, ProductAttributeType, ProductVariant, OutOfStockBehavior } from "@/types/product";
import type { Category } from "@/types/category";
import type { Brand } from "@/types/brand";
import type { Supplier } from "@/types/supplier";
import type { Collection } from "@/types/collection";
import type { ProductActivityLog } from "@/types/product-activity-log";

interface AttributeDraft {
  key: string;
  id: string;
  name: string;
  type: ProductAttributeType;
  valuesText: string; // one value per line; color type is "label|hex"
}

interface VariantDraft {
  key: string;
  attributeSelections: Record<string, string>;
  sku: string;
  price: string;
  compareAtPrice: string;
  image: string;
  stock: string;
  isDefault: boolean;
}

function attributesToDraft(attributes: ProductAttribute[]): AttributeDraft[] {
  return attributes.map((a, i) => ({
    key: `attr-${i}-${a.id}`,
    id: a.id,
    name: a.name,
    type: a.type,
    valuesText: a.values
      .map((v) => (typeof v === "string" ? v : `${v.label}${v.hex ? `|${v.hex}` : ""}`))
      .join("\n"),
  }));
}

function draftToAttribute(d: AttributeDraft): ProductAttribute {
  const lines = d.valuesText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const values =
    d.type === "color"
      ? lines.map((line) => {
          const [label, hex] = line.split("|").map((s) => s.trim());
          return { label, hex: hex || undefined };
        })
      : lines;
  return { id: d.id, name: d.name, type: d.type, values };
}

function variantsToDraft(variants: ProductVariant[]): VariantDraft[] {
  return variants.map((v, i) => ({
    key: `variant-${i}-${v.id}`,
    attributeSelections: v.attributeSelections,
    sku: v.sku ?? "",
    price: v.price != null ? String(v.price) : "",
    compareAtPrice: v.compareAtPrice != null ? String(v.compareAtPrice) : "",
    image: v.image ?? "",
    stock: String(v.stock),
    isDefault: Boolean(v.isDefault),
  }));
}

export interface ProductFormProps {
  mode: "create" | "edit";
  product?: Product;
  variants?: ProductVariant[];
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  collections: Collection[];
  relatedOptions: { id: string; name: string }[];
  activity?: ProductActivityLog[];
}

const ACTIVITY_LABELS: Record<string, string> = {
  created: "Product created",
  updated: "Product updated",
  trashed: "Moved to trash",
  restored: "Restored from trash",
  permanently_deleted: "Permanently deleted",
  stock_adjusted: "Stock adjusted",
  duplicated: "Duplicated",
};

const ProductForm: React.FC<ProductFormProps> = ({
  mode,
  product,
  variants: initialVariants = [],
  categories,
  brands,
  suppliers,
  collections,
  relatedOptions,
  activity = [],
}) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug));
  const [description, setDescription] = useState(product?.description ?? "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [barcode, setBarcode] = useState(product?.barcode ?? "");
  const [brandId, setBrandId] = useState(product?.brandId ?? "");
  const [categoryIds, setCategoryIds] = useState<string[]>(product?.categoryIds ?? []);
  const [tagsText, setTagsText] = useState((product?.tags ?? []).join(", "));
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [videoUrl, setVideoUrl] = useState(product?.videoUrl ?? "");
  const [status, setStatus] = useState(product?.status ?? "draft");
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice != null ? String(product.compareAtPrice) : ""
  );
  const [stock, setStock] = useState(product ? String(product.stock) : "0");
  const [trackInventory, setTrackInventory] = useState(product?.trackInventory ?? true);
  const [lowStockThreshold, setLowStockThreshold] = useState(
    product?.lowStockThreshold != null ? String(product.lowStockThreshold) : "5"
  );
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(product?.isNewArrival ?? false);
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller ?? false);
  const [isOnSale, setIsOnSale] = useState(product?.isOnSale ?? false);
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(
    product?.relatedProductIds ?? []
  );
  const [crossSellProductIds, setCrossSellProductIds] = useState<string[]>(
    product?.crossSellProductIds ?? []
  );
  const [upsellProductIds, setUpsellProductIds] = useState<string[]>(
    product?.upsellProductIds ?? []
  );
  const [seoTitle, setSeoTitle] = useState(product?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(product?.seoDescription ?? "");

  const [costPrice, setCostPrice] = useState(product?.costPrice != null ? String(product.costPrice) : "");
  const [supplierId, setSupplierId] = useState(product?.supplierId ?? "");
  const [collectionIds, setCollectionIds] = useState<string[]>(product?.collectionIds ?? []);
  const [reservedStock, setReservedStock] = useState(
    product?.reservedStock != null ? String(product.reservedStock) : "0"
  );
  const [outOfStockBehavior, setOutOfStockBehavior] = useState<OutOfStockBehavior>(
    product?.outOfStockBehavior ?? "hide"
  );
  const [scheduledPublishAt, setScheduledPublishAt] = useState(
    product?.scheduledPublishAt ? new Date(product.scheduledPublishAt).toISOString().slice(0, 16) : ""
  );
  const [frequentlyBoughtWithProductIds, setFrequentlyBoughtWithProductIds] = useState<string[]>(
    product?.frequentlyBoughtWithProductIds ?? []
  );
  const [generatingSku, setGeneratingSku] = useState(false);

  const [hasVariants, setHasVariants] = useState(product?.hasVariants ?? false);
  const [attributes, setAttributes] = useState<AttributeDraft[]>(
    attributesToDraft(product?.attributes ?? [])
  );
  const [variantDrafts, setVariantDrafts] = useState<VariantDraft[]>(
    variantsToDraft(initialVariants)
  );

  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set());
  const setUploadingKey = (key: string, isUploading: boolean) => {
    setUploadingKeys((prev) => {
      const next = new Set(prev);
      if (isUploading) next.add(key);
      else next.delete(key);
      return next;
    });
  };
  const isUploadingImages = uploadingKeys.size > 0;

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const toggleRelated = (id: string) => {
    setRelatedProductIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleCrossSell = (id: string) => {
    setCrossSellProductIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleUpsell = (id: string) => {
    setUpsellProductIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleFrequentlyBoughtWith = (id: string) => {
    setFrequentlyBoughtWithProductIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleCollection = (id: string) => {
    setCollectionIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const handleGenerateSku = async () => {
    if (!name.trim()) {
      setError("Enter a product name first.");
      return;
    }
    setGeneratingSku(true);
    try {
      setSku(await generateProductSku(name.trim(), product?.id));
    } finally {
      setGeneratingSku(false);
    }
  };

  const addAttribute = () => {
    setAttributes((prev) => [
      ...prev,
      { key: `attr-new-${Date.now()}`, id: `attr_${Date.now()}`, name: "", type: "text", valuesText: "" },
    ]);
  };

  const updateAttribute = (key: string, patch: Partial<AttributeDraft>) => {
    setAttributes((prev) => prev.map((a) => (a.key === key ? { ...a, ...patch } : a)));
  };

  const removeAttribute = (key: string) => {
    setAttributes((prev) => prev.filter((a) => a.key !== key));
  };

  const addVariant = () => {
    setVariantDrafts((prev) => [
      ...prev,
      {
        key: `variant-new-${Date.now()}`,
        attributeSelections: {},
        sku: "",
        price: "",
        compareAtPrice: "",
        image: "",
        stock: "0",
        isDefault: prev.length === 0,
      },
    ]);
  };

  const updateVariant = (key: string, patch: Partial<VariantDraft>) => {
    setVariantDrafts((prev) => prev.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  };

  const removeVariant = (key: string) => {
    setVariantDrafts((prev) => prev.filter((v) => v.key !== key));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !slug.trim()) {
      setError("Name and slug are required.");
      return;
    }

    const parsedAttributes = attributes
      .filter((a) => a.name.trim())
      .map(draftToAttribute);

    const parsedVariants: ProductVariantInput[] = variantDrafts.map((v) => ({
      attributeSelections: v.attributeSelections,
      sku: v.sku || undefined,
      price: v.price ? Number(v.price) : undefined,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
      image: v.image || undefined,
      stock: Number(v.stock) || 0,
      isDefault: v.isDefault,
    }));

    const payload: ProductFormInput = {
      name: name.trim(),
      slug: slug.trim(),
      description,
      shortDescription: shortDescription || undefined,
      sku: sku || undefined,
      barcode: barcode || undefined,
      brandId: brandId || undefined,
      categoryIds,
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      images,
      videoUrl: videoUrl || undefined,
      status: status as Product["status"],
      badge: (badge || null) as Product["badge"],
      price: Number(price) || 0,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      stock: Number(stock) || 0,
      trackInventory,
      lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : undefined,
      isFeatured,
      isNewArrival,
      isBestSeller,
      isOnSale,
      relatedProductIds,
      crossSellProductIds,
      upsellProductIds,
      frequentlyBoughtWithProductIds,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      costPrice: costPrice ? Number(costPrice) : undefined,
      supplierId: supplierId || undefined,
      collectionIds,
      reservedStock: reservedStock ? Number(reservedStock) : undefined,
      outOfStockBehavior,
      scheduledPublishAt: scheduledPublishAt ? new Date(scheduledPublishAt).getTime() : null,
      attributes: parsedAttributes,
      hasVariants,
      variants: parsedVariants,
    };

    setSubmitting(true);
    try {
      if (mode === "create") {
        const id = await createProduct(payload);
        router.push(`/admin/products/${id}/edit`);
      } else if (product) {
        await updateProduct(product.id, payload);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
  const labelClass = "block text-sm font-medium mb-1";
  const cardClass =
    "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={cardClass}>
            <h2 className="font-semibold">Basic information</h2>
            <div>
              <label className={labelClass}>Product name</label>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input
                className={inputClass}
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugTouched(true);
                }}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Short description</label>
              <input
                className={inputClass}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                className={inputClass}
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="font-semibold">Media</h2>
            <ImageUploader
              value={images}
              onChange={setImages}
              imageType="product"
              subfolder={slug || "draft"}
              onUploadingChange={(u) => setUploadingKey("gallery", u)}
            />
            <div>
              <label className={labelClass}>Video URL (optional)</label>
              <input className={inputClass} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="font-semibold">Pricing &amp; inventory</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Price</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Compare-at price</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>SKU</label>
                <div className="flex gap-2">
                  <input className={inputClass} value={sku} onChange={(e) => setSku(e.target.value)} />
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    disabled={generatingSku}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 whitespace-nowrap disabled:opacity-50"
                  >
                    {generatingSku ? "…" : "Generate"}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Barcode</label>
                <input className={inputClass} value={barcode} onChange={(e) => setBarcode(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Stock</label>
                <input
                  type="number"
                  className={inputClass}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  disabled={hasVariants}
                />
                {hasVariants && (
                  <p className="text-xs text-neutral-500 mt-1">Stock is tracked per-variant below.</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Low stock threshold</label>
                <input
                  type="number"
                  className={inputClass}
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Cost price</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Profit margin</label>
                <div className={`${inputClass} bg-neutral-50 dark:bg-neutral-800/50`}>
                  {(() => {
                    const margin = calculateProfitMargin(costPrice ? Number(costPrice) : undefined, Number(price) || 0);
                    return margin ? `${margin.profit.toFixed(2)} (${margin.marginPercent.toFixed(1)}%)` : "—";
                  })()}
                </div>
              </div>
              <div>
                <label className={labelClass}>Reserved stock</label>
                <input
                  type="number"
                  className={inputClass}
                  value={reservedStock}
                  onChange={(e) => setReservedStock(e.target.value)}
                  disabled={hasVariants}
                />
              </div>
              <div>
                <label className={labelClass}>Available stock</label>
                <div className={`${inputClass} bg-neutral-50 dark:bg-neutral-800/50`}>
                  {calculateAvailableStock(Number(stock) || 0, reservedStock ? Number(reservedStock) : undefined)}
                </div>
              </div>
              <div>
                <label className={labelClass}>Out-of-stock behavior</label>
                <select
                  className={inputClass}
                  value={outOfStockBehavior}
                  onChange={(e) => setOutOfStockBehavior(e.target.value as OutOfStockBehavior)}
                >
                  <option value="hide">Hide from storefront</option>
                  <option value="show_disabled">Show with disabled buy button</option>
                  <option value="allow_backorder">Allow backorder</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={trackInventory}
                onChange={(e) => setTrackInventory(e.target.checked)}
              />
              Track inventory for this product
            </label>
            <p className="text-xs text-neutral-500">
              Reserved/available stock and out-of-stock behavior are architecture-ready fields -
              Checkout/Orders don&apos;t enforce them yet in this phase.
            </p>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Attributes</h2>
              <button type="button" onClick={addAttribute} className="text-sm text-primary-6000 font-medium">
                + Add attribute
              </button>
            </div>
            <p className="text-xs text-neutral-500">
              Define unlimited attribute types (Color, Size, Material, …). For &quot;color&quot; type, one value per
              line as <code>Label|#hex</code>; other types are one value per line.
            </p>
            {attributes.map((attr) => (
              <div key={attr.key} className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <input
                    className={inputClass}
                    placeholder="Name (e.g. Color)"
                    value={attr.name}
                    onChange={(e) => updateAttribute(attr.key, { name: e.target.value })}
                  />
                  <select
                    className={inputClass}
                    value={attr.type}
                    onChange={(e) => updateAttribute(attr.key, { type: e.target.value as ProductAttributeType })}
                  >
                    <option value="text">Text</option>
                    <option value="color">Color</option>
                    <option value="image">Image/Style</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeAttribute(attr.key)}
                    className="text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  className={inputClass}
                  rows={3}
                  placeholder={attr.type === "color" ? "Black|#000000\nWhite|#ffffff" : "S\nM\nL"}
                  value={attr.valuesText}
                  onChange={(e) => updateAttribute(attr.key, { valuesText: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div className={cardClass}>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
              />
              This product has variants
            </label>
            {hasVariants && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-neutral-500">
                    Variants (each row is one purchasable combination)
                  </h3>
                  <button type="button" onClick={addVariant} className="text-sm text-primary-6000 font-medium">
                    + Add variant
                  </button>
                </div>
                {variantDrafts.map((v) => (
                  <div key={v.key} className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {attributes.map((attr) => (
                        <div key={attr.key}>
                          <label className="text-xs text-neutral-500">{attr.name || "Attribute"}</label>
                          <input
                            className={inputClass}
                            placeholder={attr.name}
                            value={v.attributeSelections[attr.name] ?? ""}
                            onChange={(e) =>
                              updateVariant(v.key, {
                                attributeSelections: { ...v.attributeSelections, [attr.name]: e.target.value },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <input
                        className={inputClass}
                        placeholder="SKU"
                        value={v.sku}
                        onChange={(e) => updateVariant(v.key, { sku: e.target.value })}
                      />
                      <input
                        type="number"
                        className={inputClass}
                        placeholder="Price override"
                        value={v.price}
                        onChange={(e) => updateVariant(v.key, { price: e.target.value })}
                      />
                      <input
                        type="number"
                        className={inputClass}
                        placeholder="Stock"
                        value={v.stock}
                        onChange={(e) => updateVariant(v.key, { stock: e.target.value })}
                      />
                    </div>
                    <ImageUploader
                      value={v.image ? [v.image] : []}
                      onChange={(urls) => updateVariant(v.key, { image: urls[0] || "" })}
                      imageType="product"
                      subfolder={`${slug || "draft"}/variants`}
                      multiple={false}
                      label="Variant image (optional)"
                      onUploadingChange={(u) => setUploadingKey(v.key, u)}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={v.isDefault}
                          onChange={(e) => updateVariant(v.key, { isDefault: e.target.checked })}
                        />
                        Default variant
                      </label>
                      <button type="button" onClick={() => removeVariant(v.key)} className="text-xs text-red-600">
                        Remove variant
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className={cardClass}>
            <h2 className="font-semibold">Search engine listing</h2>
            <div>
              <label className={labelClass}>SEO title</label>
              <input className={inputClass} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>SEO description</label>
              <textarea
                className={inputClass}
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
              />
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="font-semibold">Related products</h2>
            <p className="text-xs text-neutral-500">
              Manually pick related products; leave empty to auto-suggest from the same category on the
              storefront.
            </p>
            <div className="max-h-56 overflow-y-auto space-y-1.5">
              {relatedOptions
                .filter((p) => p.id !== product?.id)
                .map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={relatedProductIds.includes(p.id)}
                      onChange={() => toggleRelated(p.id)}
                    />
                    {p.name}
                  </label>
                ))}
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="font-semibold">Cross-sell products</h2>
            <p className="text-xs text-neutral-500">
              Shown as &quot;Frequently bought together&quot; add-ons alongside this product.
            </p>
            <div className="max-h-56 overflow-y-auto space-y-1.5">
              {relatedOptions
                .filter((p) => p.id !== product?.id)
                .map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={crossSellProductIds.includes(p.id)}
                      onChange={() => toggleCrossSell(p.id)}
                    />
                    {p.name}
                  </label>
                ))}
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="font-semibold">Upsell products</h2>
            <p className="text-xs text-neutral-500">
              Shown as &quot;You may also like&quot; premium alternatives on this product&apos;s page.
            </p>
            <div className="max-h-56 overflow-y-auto space-y-1.5">
              {relatedOptions
                .filter((p) => p.id !== product?.id)
                .map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={upsellProductIds.includes(p.id)}
                      onChange={() => toggleUpsell(p.id)}
                    />
                    {p.name}
                  </label>
                ))}
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="font-semibold">Frequently bought together</h2>
            <p className="text-xs text-neutral-500">
              Manually curated bundle suggestions shown alongside this product.
            </p>
            <div className="max-h-56 overflow-y-auto space-y-1.5">
              {relatedOptions
                .filter((p) => p.id !== product?.id)
                .map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={frequentlyBoughtWithProductIds.includes(p.id)}
                      onChange={() => toggleFrequentlyBoughtWith(p.id)}
                    />
                    {p.name}
                  </label>
                ))}
            </div>
          </div>

          {mode === "edit" && (
            <div className={cardClass}>
              <h2 className="font-semibold">Activity log</h2>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {activity.map((log) => (
                  <div key={log.id} className="py-2 text-sm flex items-center justify-between">
                    <span>{ACTIVITY_LABELS[log.action] ?? log.action}</span>
                    <span className="text-xs text-neutral-500">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                    </span>
                  </div>
                ))}
                {!activity.length && <p className="text-sm text-neutral-500 py-2">No activity recorded yet.</p>}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className={cardClass}>
            <h2 className="font-semibold">Status</h2>
            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as Product["status"])}>
              <option value="draft">Draft</option>
              <option value="active">Active (published)</option>
              <option value="archived">Archived</option>
            </select>
            <div>
              <label className={labelClass}>Badge</label>
              <select className={inputClass} value={badge ?? ""} onChange={(e) => setBadge(e.target.value)}>
                <option value="">None</option>
                <option value="new">New</option>
                <option value="sale">Sale</option>
                <option value="sold_out">Sold out</option>
                <option value="limited_edition">Limited edition</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Scheduled publish (optional)</label>
              <input
                type="datetime-local"
                className={inputClass}
                value={scheduledPublishAt}
                onChange={(e) => setScheduledPublishAt(e.target.value)}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Metadata only for now - doesn&apos;t automatically flip status to Active yet.
              </p>
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="font-semibold">Merchandising</h2>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              Featured product
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} />
              New arrival
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} />
              Best seller
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isOnSale} onChange={(e) => setIsOnSale(e.target.checked)} />
              On sale
            </label>
          </div>

          <div className={cardClass}>
            <h2 className="font-semibold">Organization</h2>
            <div>
              <label className={labelClass}>Brand</label>
              <select className={inputClass} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                <option value="">No brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Categories</label>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(c.id)}
                      onChange={() => toggleCategory(c.id)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Tags (comma separated)</label>
              <input className={inputClass} value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Supplier</label>
              <select className={inputClass} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">No supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Collections</label>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {collections.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={collectionIds.includes(c.id)}
                      onChange={() => toggleCollection(c.id)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || isUploadingImages}
            className="w-full py-3 rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
          >
            {isUploadingImages
              ? "Uploading images…"
              : submitting
              ? "Saving…"
              : mode === "create"
              ? "Create product"
              : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
