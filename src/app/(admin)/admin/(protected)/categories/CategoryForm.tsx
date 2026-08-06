"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import { createCategory, updateCategory, type CategoryFormInput } from "./actions";
import { slugify } from "@/lib/utils/slugify";
import type { Category } from "@/types/category";

const CategoryForm: React.FC<{ mode: "create" | "edit"; category?: Category; allCategories: Category[] }> = ({
  mode,
  category,
  allCategories,
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
          <select className={inputClass} value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">None (top-level)</option>
            {allCategories
              .filter((c) => c.id !== category?.id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
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
