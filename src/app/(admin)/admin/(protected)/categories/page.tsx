import React from "react";
import Link from "next/link";
import { getAllCategoriesForAdmin } from "@/lib/firebase/repositories/categories";
import CategoryRowActions from "./CategoryRowActions";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories ({categories.length})</h1>
        <div className="flex gap-3">
          <Link
            href={trashed ? "/admin/categories" : "/admin/categories?trashed=true"}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${
              trashed ? "bg-red-600 text-white border-red-600" : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {trashed ? "Viewing Trash" : "Trash"}
          </Link>
          <Link
            href={"/admin/categories/new" as any}
            className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium"
          >
            Add category
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
              <th className="p-4">Name</th>
              <th className="p-4">Parent</th>
              <th className="p-4">Order</th>
              <th className="p-4">Active</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-neutral-100 dark:border-neutral-800/60">
                <td className="p-4">
                  <Link href={`/admin/categories/${c.id}/edit` as any} className="font-medium hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="p-4 text-neutral-500">
                  {c.parentId ? byId.get(c.parentId)?.name ?? "—" : "—"}
                </td>
                <td className="p-4">{c.order}</td>
                <td className="p-4">{c.isActive ? "Yes" : "No"}</td>
                <td className="p-4 text-right">
                  <CategoryRowActions id={c.id} slug={c.slug} trashed={trashed} />
                </td>
              </tr>
            ))}
            {!categories.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
