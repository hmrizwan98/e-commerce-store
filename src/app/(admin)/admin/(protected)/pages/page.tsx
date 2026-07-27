import React from "react";
import Link from "next/link";
import { getAllPagesForAdmin } from "@/lib/firebase/repositories/pages";
import PageRowActions from "./PageRowActions";
import type { CmsPageStatus } from "@/types/page";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<CmsPageStatus, string> = {
  published: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  draft: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  archived: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};

const STATUS_LABEL: Record<CmsPageStatus, string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

export default async function AdminPagesPage() {
  const pages = await getAllPagesForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pages ({pages.length})</h1>
        <Link
          href={"/admin/pages/new" as any}
          className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium"
        >
          Create page
        </Link>
      </div>

      <div className="space-y-3">
        {pages.map((p) => {
          const status: CmsPageStatus = p.status ?? (p.isActive ? "published" : "draft");
          return (
            <div
              key={p.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/admin/pages/${p.id}/edit` as any} className="font-semibold hover:underline">
                    {p.title}
                  </Link>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[status]}`}>
                    {STATUS_LABEL[status]}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  /{p.slug}
                  {p.updatedAt && ` · Updated ${new Date(p.updatedAt).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <Link href={`/admin/pages/${p.id}/edit` as any} className="text-sm font-medium hover:underline">
                  Edit
                </Link>
                {status === "published" && (
                  <a
                    href={`/pages/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium hover:underline"
                  >
                    Preview
                  </a>
                )}
                <PageRowActions id={p.id} slug={p.slug} />
              </div>
            </div>
          );
        })}
        {!pages.length && (
          <div className="text-center py-12 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl">
            <p className="text-sm text-neutral-500">
              No pages yet. Add &quot;privacy&quot; and &quot;terms&quot; pages to publish them at /privacy and /terms,
              or create any custom page - it publishes at /pages/&lt;slug&gt;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
