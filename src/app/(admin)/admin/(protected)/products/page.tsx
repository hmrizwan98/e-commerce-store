import React from "react";
import Link from "next/link";
import { searchAdminProducts } from "@/lib/firebase/repositories/products";
import ProductRowActions from "./ProductRowActions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; trashed?: string; page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const trashed = searchParams.trashed === "true";
  const { products, total, totalPages } = await searchAdminProducts({
    q: searchParams.q,
    status: searchParams.status as any,
    trashed,
    page,
  });

  const buildHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q: searchParams.q, status: searchParams.status, trashed: searchParams.trashed, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v));
    const qs = params.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products ({total})</h1>
        <div className="flex gap-3">
          <Link
            href={"/admin/products/bulk" as any}
            className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
          >
            Bulk Import/Export
          </Link>
          <Link
            href={"/admin/products/new" as any}
            className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium"
          >
            Add product
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form action="/admin/products" className="flex items-center gap-2">
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search products…"
            className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
          />
          <button className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700">
            Search
          </button>
        </form>
        {["", "draft", "active", "archived"].map((s) => (
          <Link
            key={s}
            href={buildHref({ status: s || undefined, page: undefined }) as any}
            className={`px-3 py-1.5 text-sm rounded-full border ${
              (searchParams.status ?? "") === s
                ? "bg-primary-6000 text-white border-primary-6000"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {s ? s[0].toUpperCase() + s.slice(1) : "All statuses"}
          </Link>
        ))}
        <Link
          href={buildHref({ trashed: trashed ? undefined : "true", page: undefined }) as any}
          className={`px-3 py-1.5 text-sm rounded-full border ${
            trashed ? "bg-red-600 text-white border-red-600" : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          {trashed ? "Viewing Trash" : "Trash"}
        </Link>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
              <th className="p-4">Name</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 dark:border-neutral-800/60">
                <td className="p-4">
                  <Link href={`/admin/products/${p.id}/edit` as any} className="font-medium hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="p-4 text-neutral-500">{p.sku ?? "—"}</td>
                <td className="p-4">${p.price.toFixed(2)}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 capitalize">
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <ProductRowActions id={p.id} slug={p.slug} trashed={trashed} />
                </td>
              </tr>
            ))}
            {!products.length && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref({ page: String(p) }) as any}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm ${
                p === page ? "bg-primary-6000 text-white" : "border border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
