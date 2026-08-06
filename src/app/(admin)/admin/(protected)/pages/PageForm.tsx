"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createPage, updatePage, type PageFormInput } from "./actions";
import { slugify } from "@/lib/utils/slugify";
import type { CmsPage, CmsPageStatus } from "@/types/page";

const PageForm: React.FC<{ mode: "create" | "edit"; page?: CmsPage }> = ({ mode, page }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(page?.slug));
  const [content, setContent] = useState(page?.content ?? "");
  const [seoTitle, setSeoTitle] = useState(page?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(page?.seoDescription ?? "");
  const [status, setStatus] = useState<CmsPageStatus>(page?.status ?? (mode === "create" ? "draft" : page?.isActive ? "published" : "draft"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }
    const payload: PageFormInput = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      status,
    };
    setSubmitting(true);
    try {
      if (mode === "create") {
        const id = await createPage(payload);
        router.push(`/admin/pages/${id}/edit`);
      } else if (page) {
        await updatePage(page.id, payload);
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
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}
      <div className={cardClass}>
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
          <label className={labelClass}>Slug (used as the URL, e.g. &quot;privacy&quot; → /privacy)</label>
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
          <label className={labelClass}>Content (HTML allowed)</label>
          <textarea className={inputClass} rows={16} value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as CmsPageStatus)}>
            <option value="draft">Draft (not visible on storefront)</option>
            <option value="published">Published (visible on storefront)</option>
            <option value="archived">Archived (not visible on storefront)</option>
          </select>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="font-medium">SEO</h3>
        <div>
          <label className={labelClass}>SEO title (optional)</label>
          <input className={inputClass} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title} />
        </div>
        <div>
          <label className={labelClass}>SEO description (optional)</label>
          <textarea
            className={inputClass}
            rows={2}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
      >
        {submitting ? "Saving…" : mode === "create" ? "Create page" : "Save changes"}
      </button>
    </form>
  );
};

export default PageForm;
