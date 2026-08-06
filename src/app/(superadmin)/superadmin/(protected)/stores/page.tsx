import React from "react";
import Link from "next/link";
import { getStores, searchStores } from "@/lib/firebase/repositories/stores";
import { DEFAULT_THEME } from "@/lib/firebase/repositories/themes";
import { STATUS_BADGE_CLASS } from "@/lib/superadmin/status-badge";
import StoreRowActions from "../StoreRowActions";
import type { StoreStatus } from "@/types/store";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
type StatusFilter = StoreStatus | "all";

export default async function SuperAdminStoresPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const statusFilter = (["active", "suspended", "archived", "all"] as const).includes(
    searchParams.status as StatusFilter
  )
    ? (searchParams.status as StatusFilter)
    : undefined;
  const page = Math.max(1, Number(searchParams.page) || 1);

  // Single read either way - status filtering/pagination below are in-memory, not extra queries.
  const allStores = q ? await searchStores(q) : await getStores({ includeArchived: true });
  const stores = allStores.filter((s) => {
    if (statusFilter === "all") return true;
    if (statusFilter) return s.status === statusFilter;
    return s.status !== "archived"; // default view: active + suspended only
  });

  const totalPages = Math.max(1, Math.ceil(stores.length / PAGE_SIZE));
  const pageStores = stores.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Stores ({stores.length})</h1>
        <Link
          href={"/superadmin/new" as any}
          className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium"
        >
          Create store
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" action="/superadmin/stores">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search stores by name…"
          className="w-full max-w-sm px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
        />
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
        >
          <option value="">Active + Suspended</option>
          <option value="all">All statuses</option>
          <option value="active">Active only</option>
          <option value="suspended">Suspended only</option>
          <option value="archived">Archived only</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
        >
          Apply
        </button>
      </form>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
              <th className="p-4">Name</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Theme</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
              <th className="p-4">Last Activity</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {pageStores.map((store) => (
              <tr key={store.id} className="border-b border-neutral-100 dark:border-neutral-800/60">
                <td className="p-4">
                  <Link href={`/superadmin/${store.id}/edit` as any} className="font-medium hover:underline">
                    {store.name}
                  </Link>
                </td>
                <td className="p-4 text-neutral-500">{store.slug}</td>
                <td className="p-4 text-neutral-500">{store.ownerName || "—"}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {store.themeId === DEFAULT_THEME.id ? "Default" : store.themeId || "Default"}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[store.status]}`}>
                    {store.status}
                  </span>
                </td>
                <td className="p-4 text-neutral-500">
                  {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="p-4 text-neutral-500">
                  {store.updatedAt ? new Date(store.updatedAt).toLocaleDateString() : "—"}
                </td>
                <td className="p-4 text-right">
                  <StoreRowActions id={store.id} status={store.status} />
                </td>
              </tr>
            ))}
            {!pageStores.length && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-neutral-500">
                  {q ? "No stores match your search." : "No stores yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm">
          <Link
            href={{ pathname: "/superadmin/stores", query: { q, status: statusFilter, page: page - 1 } } as any}
            aria-disabled={page <= 1}
            className={`hover:underline ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            Previous
          </Link>
          <span className="text-neutral-500">
            Page {page} of {totalPages}
          </span>
          <Link
            href={{ pathname: "/superadmin/stores", query: { q, status: statusFilter, page: page + 1 } } as any}
            aria-disabled={page >= totalPages}
            className={`hover:underline ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
