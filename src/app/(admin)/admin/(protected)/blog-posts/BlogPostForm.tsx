"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";
import { createBlogPost, updateBlogPost, type BlogPostFormInput } from "./actions";
import type { BlogPost } from "@/types/blog-post";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toDateInputValue(ms?: number | null): string {
  if (!ms) return "";
  return new Date(ms).toISOString().slice(0, 10);
}

function fromDateInputValue(value: string): number | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).getTime();
}

const BlogPostForm: React.FC<{ mode: "create" | "edit"; post?: BlogPost }> = ({ mode, post }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState<string[]>(post?.coverImage ? [post.coverImage] : []);
  const [publishedAt, setPublishedAt] = useState(toDateInputValue(post?.publishedAt ?? Date.now()));
  const [order, setOrder] = useState(String(post?.order ?? 0));
  const [isActive, setIsActive] = useState(post?.isActive ?? true);
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription ?? "");
  const [imageUploading, setImageUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !slug.trim() || !excerpt.trim() || !coverImage[0]) {
      setError("Title, slug, excerpt and cover image are required.");
      return;
    }
    const publishedAtMs = fromDateInputValue(publishedAt);
    if (!publishedAtMs) {
      setError("Published date is required.");
      return;
    }
    const payload: BlogPostFormInput = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim() || undefined,
      coverImage: coverImage[0],
      publishedAt: publishedAtMs,
      isActive,
      order: Number(order) || 0,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
    };
    setSubmitting(true);
    try {
      if (mode === "create") {
        await createBlogPost(payload);
        toast.success("Blog post created");
        router.push("/admin/blog-posts" as any);
      } else if (post) {
        await updateBlogPost(post.id, payload);
        toast.success("Changes saved");
        router.refresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
  const labelClass = "block text-sm font-medium mb-1";
  const cardClass =
    "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";
  const sectionTitleClass = "text-sm font-semibold text-neutral-500 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Post</h2>
        <ImageUploader
          value={coverImage}
          onChange={setCoverImage}
          imageType="blogPost"
          multiple={false}
          subfolder={slug || "draft"}
          label="Cover image"
          onUploadingChange={setImageUploading}
        />
        <div>
          <label className={labelClass}>Title</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
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
          <label className={labelClass}>Excerpt</label>
          <textarea className={inputClass} rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Content</label>
          <textarea className={inputClass} rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
      </div>

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>SEO</h2>
        <div>
          <label className={labelClass}>SEO title</label>
          <input className={inputClass} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>SEO description</label>
          <textarea className={inputClass} rows={2} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
        </div>
      </div>

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Display</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Published date</label>
            <input
              type="date"
              className={inputClass}
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Sort order</label>
            <input type="number" className={inputClass} value={order} onChange={(e) => setOrder(e.target.value)} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Visible on storefront
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting || imageUploading}
        className="px-6 py-3 rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
      >
        {imageUploading ? "Uploading image…" : submitting ? "Saving…" : mode === "create" ? "Create post" : "Save changes"}
      </button>
    </form>
  );
};

export default BlogPostForm;
