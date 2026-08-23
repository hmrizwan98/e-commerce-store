import React from "react";
import Link from "next/link";
import { getAllPagesForAdmin } from "@/lib/firebase/repositories/pages";
import PageRowActions from "./PageRowActions";
import type { CmsPageStatus } from "@/types/page";
import { PlusIcon, DocumentTextIcon, PencilSquareIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<CmsPageStatus, string> = {
  published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60",
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60",
  archived: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60",
};

const STATUS_LABEL: Record<CmsPageStatus, string> = {
  published: "🟢 Published",
  draft: "🟡 Draft",
  archived: "⚪ Archived",
};

export default async function AdminPagesPage() {
  const pages = await getAllPagesForAdmin();

  return (
    <div className="space-y-6">
      {/* Executive Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
            <span>CONTENT</span>
            <span>/</span>
            <span className="text-indigo-600 dark:text-indigo-400">PAGES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-3">
            <span>CMS Pages</span>
            <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              {pages.length} Total
            </span>
          </h1>
        </div>

        <Link
          href={"/admin/pages/new" as any}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create Page</span>
        </Link>
      </div>

      {/* Pages List Cards */}
      <div className="space-y-3">
        {pages.map((p) => {
          const status: CmsPageStatus = p.status ?? (p.isActive ? "published" : "draft");
          return (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100 dark:border-indigo-900/60">
                  <DocumentTextIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Link
                      href={`/admin/pages/${p.id}/edit` as any}
                      className="font-bold text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
                    >
                      {p.title}
                    </Link>
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${STATUS_STYLES[status]}`}>
                      {STATUS_LABEL[status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>/{p.slug}</span>
                    {p.updatedAt && (
                      <span suppressHydrationWarning>
                        · Updated {new Date(p.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                <Link
                  href={`/admin/pages/${p.id}/edit` as any}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <PencilSquareIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </Link>

                {status === "published" && (
                  <a
                    href={`/pages/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors"
                  >
                    <span>Preview</span>
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                  </a>
                )}

                <PageRowActions id={p.id} slug={p.slug} />
              </div>
            </div>
          );
        })}

        {!pages.length && (
          <div className="text-center py-14 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 p-8">
            <DocumentTextIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">No Pages Created Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Add privacy policy, terms of service or any custom storefront content page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
