import React from "react";
import Link from "next/link";
import Image from "next/image";
import { searchAdminProducts, type AdminProductsCursor } from "@/lib/firebase/repositories/products";
import ProductRowActions from "./ProductRowActions";
import {
  PlusIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

/** Stack of {value,id} cursors, one per page already visited. */
function parseCursorStack(raw?: string): AdminProductsCursor[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => {
      const [tag, ...rest] = entry.split(":");
      const [value, id] = rest.join(":").split("_");
      if (!id) return null;
      return { value: tag === "n" ? Number(value) : value, id };
    })
    .filter((c): c is AdminProductsCursor => c !== null && (typeof c.value === "string" || Number.isFinite(c.value)));
}

function serializeCursorStack(stack: AdminProductsCursor[]): string {
  return stack.map((c) => `${typeof c.value === "number" ? "n" : "s"}:${c.value}_${c.id}`).join(",");
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; trashed?: string; cursor?: string };
}) {
  const trashed = searchParams.trashed === "true";
  const cursorStack = parseCursorStack(searchParams.cursor);
  const startAfter = cursorStack.length ? cursorStack[cursorStack.length - 1] : undefined;

  const { products, total, hasMore } = await searchAdminProducts({
    q: searchParams.q,
    status: searchParams.status as any,
    trashed,
    startAfter,
  });

  const lastProduct = products.length ? products[products.length - 1] : undefined;
  const lastCursorValue: string | number | undefined = searchParams.q ? lastProduct?.nameLower : lastProduct?.updatedAt;

  const buildHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q: searchParams.q, status: searchParams.status, trashed: searchParams.trashed, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v));
    const qs = params.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };

  const nextHref =
    hasMore && lastProduct && lastCursorValue != null
      ? buildHref({ cursor: serializeCursorStack([...cursorStack, { value: lastCursorValue, id: lastProduct.id }]) })
      : undefined;
  const prevHref = cursorStack.length
    ? buildHref({ cursor: cursorStack.length > 1 ? serializeCursorStack(cursorStack.slice(0, -1)) : undefined })
    : undefined;

  return (
    <div className="space-y-6">
      {/* 1. Executive Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
            <span>CATALOG</span>
            <span>/</span>
            <span className="text-indigo-600 dark:text-indigo-400">PRODUCTS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-3">
            <span>Products</span>
            <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              {total} Total
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={"/admin/products/bulk" as any}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs"
          >
            <ArrowUpTrayIcon className="w-4 h-4 text-slate-500" />
            <span>Bulk Import/Export</span>
          </Link>

          <Link
            href={"/admin/products/new" as any}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input Form */}
        <form action="/admin/products" className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search by product name or SKU…"
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </form>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { key: "", label: "All Statuses" },
            { key: "active", label: "🟢 Active" },
            { key: "draft", label: "🟡 Draft" },
            { key: "archived", label: "⚪ Archived" },
          ].map((item) => {
            const isActive = (searchParams.status ?? "") === item.key;
            return (
              <Link
                key={item.key}
                href={buildHref({ status: item.key || undefined, cursor: undefined }) as any}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <Link
            href={buildHref({ trashed: trashed ? undefined : "true", cursor: undefined }) as any}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              trashed
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            }`}
          >
            {trashed ? "🔴 Viewing Trash" : "🗑️ Trash"}
          </Link>
        </div>
      </div>

      {/* 3. Products Master Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-mono uppercase text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-bold">Product</th>
                <th className="py-3.5 px-4 font-bold">SKU</th>
                <th className="py-3.5 px-4 font-bold">Price</th>
                <th className="py-3.5 px-4 font-bold">Inventory</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {products.map((p) => {
                const imageUrl = p.images?.[0];
                const lowStockThreshold = p.lowStockThreshold ?? 5;
                const isOutOfStock = p.stock === 0;
                const isLowStock = p.stock > 0 && p.stock <= lowStockThreshold;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                    {/* Product Thumbnail & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700/60 relative">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={p.name}
                              width={44}
                              height={44}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <CubeIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 truncate">
                          <Link
                            href={`/admin/products/${p.id}/edit` as any}
                            className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate block"
                          >
                            {p.name}
                          </Link>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ID: {p.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 font-semibold">
                      {p.sku || "—"}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                      ${p.price.toFixed(2)}
                      {p.compareAtPrice ? (
                        <span className="block text-[11px] text-slate-400 line-through font-normal">
                          ${p.compareAtPrice.toFixed(2)}
                        </span>
                      ) : null}
                    </td>

                    {/* Inventory Level */}
                    <td className="py-3.5 px-4">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
                          🔴 Out of stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                          <ExclamationTriangleIcon className="w-3 h-3 text-amber-600" />
                          Low stock ({p.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {p.stock} in stock
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          p.status === "active"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60"
                            : p.status === "draft"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <ProductRowActions id={p.id} slug={p.slug} trashed={trashed} />
                    </td>
                  </tr>
                );
              })}

              {!products.length && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic text-xs">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {(prevHref || nextHref) && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              {prevHref && (
                <Link
                  href={prevHref as any}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 transition-colors"
                >
                  ← Previous Page
                </Link>
              )}
            </div>
            <div>
              {nextHref && (
                <Link
                  href={nextHref as any}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 transition-colors"
                >
                  Next Page →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
