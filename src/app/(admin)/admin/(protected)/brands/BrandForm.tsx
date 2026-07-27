"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import { createBrand, updateBrand, type BrandFormInput } from "./actions";
import type { Brand } from "@/types/brand";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const BrandForm: React.FC<{ mode: "create" | "edit"; brand?: Brand }> = ({ mode, brand }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(brand?.name ?? "");
  const [slug, setSlug] = useState(brand?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(brand?.slug));
  const [description, setDescription] = useState(brand?.description ?? "");
  const [logo, setLogo] = useState<string[]>(brand?.logo ? [brand.logo] : []);
  const [banner, setBanner] = useState<string[]>(brand?.banner ? [brand.banner] : []);
  const [order, setOrder] = useState(String(brand?.order ?? 0));
  const [isActive, setIsActive] = useState(brand?.isActive ?? true);
  const [seoTitle, setSeoTitle] = useState(brand?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(brand?.seoDescription ?? "");
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !slug.trim()) {
      setError("Name and slug are required.");
      return;
    }
    const payload: BrandFormInput = {
      name: name.trim(),
      slug: slug.trim(),
      description: description || undefined,
      logo: logo[0] || undefined,
      banner: banner[0] || undefined,
      order: Number(order) || 0,
      isActive,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
    };
    setSubmitting(true);
    try {
      if (mode === "create") {
        const id = await createBrand(payload);
        router.push(`/admin/brands/${id}/edit`);
      } else if (brand) {
        await updateBrand(brand.id, payload);
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
          value={logo}
          onChange={setLogo}
          imageType="brand"
          subfolder={slug || "draft"}
          multiple={false}
          label="Logo"
          onUploadingChange={setLogoUploading}
        />
        <ImageUploader
          value={banner}
          onChange={setBanner}
          imageType="brand"
          subfolder={slug || "draft"}
          multiple={false}
          label="Banner"
          onUploadingChange={setBannerUploading}
        />
        <div>
          <label className={labelClass}>Sort order</label>
          <input type="number" className={inputClass} value={order} onChange={(e) => setOrder(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active (visible on storefront)
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
            placeholder={name || "Defaults to brand name"}
          />
        </div>
        <div>
          <label className={labelClass}>SEO description (optional)</label>
          <textarea
            className={inputClass}
            rows={2}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder={description || "Defaults to brand description"}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || logoUploading || bannerUploading}
        className="px-6 py-3 rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
      >
        {logoUploading || bannerUploading
          ? "Uploading image…"
          : submitting
          ? "Saving…"
          : mode === "create"
          ? "Create brand"
          : "Save changes"}
      </button>
    </form>
  );
};

export default BrandForm;
