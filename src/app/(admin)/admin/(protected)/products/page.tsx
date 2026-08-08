import React from "react";
import Link from "next/link";
import { searchAdminProducts, type AdminProductsCursor } from "@/lib/firebase/repositories/products";
import ProductRowActions from "./ProductRowActions";

export const dynamic = "force-dynamic";

/** Stack of {value,id} cursors, one per page already visited - Next pushes the current
 * page's last product onto it, Previous pops the last entry off. Plain, URL-safe values,
 * not a serialized DocumentSnapshot. Cursor `value` may be a number (updatedAt millis) or
 * a string (nameLower, when searching) - a leading "n:"/"s:" tag disambiguates. */
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
            href={buildHref({ status: s || undefined, cursor: undefined }) as any}
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
          href={buildHref({ trashed: trashed ? undefined : "true", cursor: undefined }) as any}
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

      {(nextHref || prevHref) && (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={(prevHref ?? "#") as any}
            aria-disabled={!prevHref}
            className={`px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm font-medium ${
              !prevHref ? "pointer-events-none opacity-40" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            Previous
          </Link>
          <Link
            href={(nextHref ?? "#") as any}
            aria-disabled={!nextHref}
            className={`px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm font-medium ${
              !nextHref ? "pointer-events-none opacity-40" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
