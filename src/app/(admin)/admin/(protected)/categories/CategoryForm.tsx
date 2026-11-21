"use client";

import NativeSelect from "@/components/ui/NativeSelect";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import { createCategory, updateCategory, type CategoryFormInput } from "./actions";
import { slugify } from "@/lib/utils/slugify";
import type { Category } from "@/types/category";

export interface CategoryProductOption {
  id: string;
  name: string;
  categoryIds?: string[];
  price?: number;
  images?: string[];
}

const CategoryForm: React.FC<{
  mode: "create" | "edit";
  category?: Category;
  allCategories: Category[];
  products?: CategoryProductOption[];
}> = ({
  mode,
  category,
  allCategories,
  products = [],
}) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category?.slug));
  const [description, setDescription] = useState(category?.description ?? "");
  const [images, setImages] = useState<string[]>(category?.image ? [category.image] : []);
  const [icon, setIcon] = useState(category?.icon ?? "");
  const [parentId, setParentId] = useState(category?.parentId ?? "");
  const [order, setOrder] = useState(String(category?.order ?? 0));
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [showInNav, setShowInNav] = useState(category?.showInNav ?? true);
  const [showOnHomepage, setShowOnHomepage] = useState(category?.showOnHomepage ?? true);
  const [seoTitle, setSeoTitle] = useState(category?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(category?.seoDescription ?? "");
  const [imageUploading, setImageUploading] = useState(false);

  // Product assignment
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() => {
    if (!category?.id) return [];
    return products.filter((p) => p.categoryIds?.includes(category.id)).map((p) => p.id);
  });
  const [productSearch, setProductSearch] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase().trim())
  );

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const idsToAdd = filteredProducts.map((p) => p.id);
    setSelectedProductIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const deselectAllFiltered = () => {
    const idsToRemove = new Set(filteredProducts.map((p) => p.id));
    setSelectedProductIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !slug.trim()) {
      setError("Name and slug are required.");
      return;
    }
    const payload: CategoryFormInput = {
      name: name.trim(),
      slug: slug.trim(),
      description: description || undefined,
      image: images[0] || undefined,
      icon: icon || undefined,
      parentId: parentId || null,
      order: Number(order) || 0,
      isActive,
      showInNav,
      showOnHomepage,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      productIds: selectedProductIds,
    };
    setSubmitting(true);
    try {
      if (mode === "create") {
        const id = await createCategory(payload);
        router.push(`/admin/categories/${id}/edit`);
      } else if (category) {
        await updateCategory(category.id, payload);
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
      )}
      <div className={cardClass}>
        <div>
          <label className={labelClass}>Name</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
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
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <ImageUploader
          value={images}
          onChange={setImages}
          imageType="category"
          subfolder={slug || "draft"}
          multiple={false}
          label="Category image"
          onUploadingChange={setImageUploading}
        />
        <div>
          <label className={labelClass}>Icon (inline SVG markup, optional)</label>
          <textarea className={inputClass} rows={2} value={icon} onChange={(e) => setIcon(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Parent category</label>
          <NativeSelect className={inputClass} value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">None (top-level)</option>
            {allCategories
              .filter((c) => c.id !== category?.id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </NativeSelect>
        </div>
        <div>
          <label className={labelClass}>Sort order</label>
          <input type="number" className={inputClass} value={order} onChange={(e) => setOrder(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active (visible on storefront)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showInNav} onChange={(e) => setShowInNav(e.target.checked)} />
          Show in navigation
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showOnHomepage} onChange={(e) => setShowOnHomepage(e.target.checked)} />
          Show on homepage
        </label>
      </div>

      <div className={cardClass}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Assign Products</h3>
            <p className="text-xs text-neutral-500">
              Select products to include in this category ({selectedProductIds.length} selected).
            </p>
          </div>
          {products.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllFiltered}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Select all
              </button>
              <span className="text-neutral-300 dark:text-neutral-700">|</span>
              <button
                type="button"
                onClick={deselectAllFiltered}
                className="text-xs font-semibold text-neutral-500 hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {products.length > 0 ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search products to assign..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className={inputClass}
            />
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredProducts.map((p) => {
                const isChecked = selectedProductIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 pt-2 pb-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                      isChecked ? "bg-indigo-50/60 dark:bg-indigo-950/30" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleProduct(p.id)}
                      className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    {p.images?.[0] ? (
                      <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center text-xs text-slate-400">
                        📦
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                      {p.price !== undefined && (
                        <p className="text-xs text-neutral-400">Rs. {p.price.toLocaleString()}</p>
                      )}
                    </div>
                  </label>
                );
              })}
              {filteredProducts.length === 0 && (
                <p className="text-xs text-neutral-400 py-4 text-center">No products match your search.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-400 py-2">No products available in the store yet.</p>
        )}
      </div>

      <div className={cardClass}>
        <h3 className="font-medium">SEO</h3>
        <div>
          <label className={labelClass}>SEO title (optional)</label>
          <input
            className={inputClass}
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder={name || "Defaults to category name"}
          />
        </div>
        <div>
          <label className={labelClass}>SEO description (optional)</label>
          <textarea
            className={inputClass}
            rows={2}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder={description || "Defaults to category description"}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || imageUploading}
        className="px-6 py-3 rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
      >
        {imageUploading ? "Uploading image…" : submitting ? "Saving…" : mode === "create" ? "Create category" : "Save changes"}
      </button>
    </form>
  );
};

export default CategoryForm;
