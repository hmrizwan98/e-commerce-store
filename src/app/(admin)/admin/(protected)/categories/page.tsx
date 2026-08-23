import React from "react";
import Link from "next/link";
import { getAllCategoriesForAdmin } from "@/lib/firebase/repositories/categories";
import CategoryRowActions from "./CategoryRowActions";
import { PlusIcon, TagIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: { trashed?: string };
}) {
  const trashed = searchParams.trashed === "true";
  const all = await getAllCategoriesForAdmin(true);
  const categories = all.filter((c) => Boolean(c.isDeleted) === trashed);
  const byId = new Map(all.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      {/* Executive Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
            <span>CATALOG</span>
            <span>/</span>
            <span className="text-indigo-600 dark:text-indigo-400">CATEGORIES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-3">
            <span>Categories</span>
            <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              {categories.length} Total
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={trashed ? "/admin/categories" : "/admin/categories?trashed=true"}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              trashed
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
            }`}
          >
            {trashed ? "🔴 Viewing Trash" : "🗑️ Trash"}
          </Link>

          <Link
            href={"/admin/categories/new" as any}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Category</span>
          </Link>
        </div>
      </div>

      {/* Master Categories Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-mono uppercase text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-bold">Category Name</th>
                <th className="py-3.5 px-4 font-bold">Parent Category</th>
                <th className="py-3.5 px-4 font-bold">Sort Order</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100 dark:border-indigo-900/60">
                        <TagIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <Link
                          href={`/admin/categories/${c.id}/edit` as any}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block"
                        >
                          {c.name}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-mono">
                          /{c.slug}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                    {c.parentId ? byId.get(c.parentId)?.name ?? "—" : "—"}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {c.order}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        c.isActive
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60"
                      }`}
                    >
                      {c.isActive ? "🟢 Active" : "⚪ Inactive"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <CategoryRowActions id={c.id} slug={c.slug} trashed={trashed} />
                  </td>
                </tr>
              ))}
              {!categories.length && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 italic text-xs">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
