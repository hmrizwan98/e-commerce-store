"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import { createCollection, updateCollection, type CollectionFormInput } from "./actions";
import { slugify } from "@/lib/utils/slugify";
import type { Collection } from "@/types/collection";

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
const labelClass = "block text-sm font-medium mb-1";
const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";

const CollectionForm: React.FC<{ mode: "create" | "edit"; collection?: Collection }> = ({ mode, collection }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(collection?.name ?? "");
  const [slug, setSlug] = useState(collection?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(collection?.slug));
  const [description, setDescription] = useState(collection?.description ?? "");
  const [image, setImage] = useState<string[]>(collection?.image ? [collection.image] : []);
  const [order, setOrder] = useState(String(collection?.order ?? 0));
  const [isActive, setIsActive] = useState(collection?.isActive ?? true);
  const [imageUploading, setImageUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !slug.trim()) {
      setError("Name and slug are required.");
      return;
    }
    const payload: CollectionFormInput = {
      name: name.trim(),
      slug: slug.trim(),
      description: description || undefined,
      image: image[0] || undefined,
      order: Number(order) || 0,
      isActive,
    };
    setSubmitting(true);
    try {
      if (mode === "create") {
        const id = await createCollection(payload);
        router.push(`/admin/collections/${id}/edit` as any);
      } else if (collection) {
        await updateCollection(collection.id, payload);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}
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
          value={image}
          onChange={setImage}
          imageType="collection"
          subfolder={slug || "draft"}
          multiple={false}
          label="Image"
          onUploadingChange={setImageUploading}
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

      <button
        type="submit"
        disabled={submitting || imageUploading}
        className="px-6 py-3 rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
      >
        {imageUploading ? "Uploading image…" : submitting ? "Saving…" : mode === "create" ? "Create collection" : "Save changes"}
      </button>
    </form>
  );
};

export default CollectionForm;
