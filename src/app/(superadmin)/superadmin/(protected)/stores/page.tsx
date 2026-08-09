import React from "react";
import Link from "next/link";
import { searchAdminStores, type AdminStoresCursor } from "@/lib/firebase/repositories/stores";
import { DEFAULT_THEME } from "@/lib/firebase/repositories/themes";
import { STATUS_BADGE_CLASS } from "@/lib/superadmin/status-badge";
import StoreRowActions from "../StoreRowActions";
import type { StoreStatus } from "@/types/store";
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
type StatusFilter = StoreStatus | "all";

function parseCursorStack(raw?: string): AdminStoresCursor[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => {
      const [tag, ...rest] = entry.split(":");
      const [value, id] = rest.join(":").split("_");
      if (!id) return null;
      return { value: tag === "n" ? Number(value) : value, id };
    })
    .filter((c): c is AdminStoresCursor => c !== null && (typeof c.value === "string" || Number.isFinite(c.value)));
}

function serializeCursorStack(stack: AdminStoresCursor[]): string {
  return stack.map((c) => `${typeof c.value === "number" ? "n" : "s"}:${c.value}_${c.id}`).join(",");
}

export default async function SuperAdminStoresPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; cursor?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const statusFilter = (["active", "suspended", "archived", "all"] as const).includes(
    searchParams.status as StatusFilter
  )
    ? (searchParams.status as StatusFilter)
    : undefined;

  const cursorStack = parseCursorStack(searchParams.cursor);
  const startAfter = cursorStack.length ? cursorStack[cursorStack.length - 1] : undefined;

  const { stores, total, hasMore } = await searchAdminStores({
    q,
    status: statusFilter,
    startAfter,
    pageSize: PAGE_SIZE,
  });

  const lastStore = stores.length ? stores[stores.length - 1] : undefined;
  const lastCursorValue: string | number | undefined = q ? lastStore?.nameLower : lastStore?.createdAt;

  const buildHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q: searchParams.q, status: searchParams.status, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v));
    const qs = params.toString();
    return qs ? `/superadmin/stores?${qs}` : "/superadmin/stores";
  };

  const nextHref =
    hasMore && lastStore && lastCursorValue != null
      ? buildHref({ cursor: serializeCursorStack([...cursorStack, { value: lastCursorValue, id: lastStore.id }]) })
      : undefined;

  const prevHref = cursorStack.length
    ? buildHref({ cursor: serializeCursorStack(cursorStack.slice(0, -1)) || undefined })
    : undefined;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Store Directory <span className="text-sm font-mono text-neutral-500 font-normal">({total})</span>
          </h1>
          <p className="text-xs text-neutral-500">Manage tenant storefronts, access levels, and domain settings</p>
        </div>
        <Link
          href={"/superadmin/new" as any}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-6000 to-indigo-600 text-white font-bold text-sm shadow-md shadow-primary-6000/25 hover:shadow-lg hover:-translate-y-0.5 transition-all self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create Store</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">
        <form className="flex flex-wrap items-center gap-3" action="/superadmin/stores">
          <div className="relative flex-1 min-w-[240px]">
            <MagnifyingGlassIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search stores by name or slug..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-6000/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-neutral-400 hidden sm:block" />
            <select
              name="status"
              defaultValue={statusFilter ?? ""}
              className="px-3.5 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-6000/50 transition-all"
            >
              <option value="">Active + Suspended</option>
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="suspended">Suspended only</option>
              <option value="archived">Archived only</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Stores Data Table */}
      <div className="p-1 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-neutral-200/80 dark:border-neutral-800/80 text-[11px] font-bold uppercase tracking-wider font-mono text-neutral-500 bg-neutral-50/50 dark:bg-neutral-950/50">
                <th className="p-4 pl-6">Store Name</th>
                <th className="p-4">Tenant Slug</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Theme</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/60 transition-colors">
                  <td className="p-4 pl-6">
                    <Link
                      href={`/superadmin/${store.id}/edit` as any}
                      className="font-bold text-neutral-900 dark:text-white hover:text-primary-6000 dark:hover:text-primary-400 transition-colors"
                    >
                      {store.name}
                    </Link>
                  </td>
                  <td className="p-4 font-mono text-xs text-neutral-500">{store.slug}</td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-300 font-medium">{store.ownerName || "—"}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      {store.themeId === DEFAULT_THEME.id ? "Default" : store.themeId || "Default"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[store.status]}`}>
                      {store.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono text-neutral-500">
                    {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-4 text-xs font-mono text-neutral-500">
                    {store.updatedAt ? new Date(store.updatedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-4 text-right pr-6">
                    <StoreRowActions id={store.id} status={store.status} />
                  </td>
                </tr>
              ))}
              {!stores.length && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-neutral-500 space-y-2">
                    <p className="font-semibold text-base text-neutral-700 dark:text-neutral-300">No stores found</p>
                    <p className="text-xs">
                      {q ? "No stores match your search parameters." : "No stores have been created yet."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {(hasMore || cursorStack.length > 0) && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 text-xs font-mono">
          <span className="text-neutral-500">
            Page {cursorStack.length + 1} ({total} total)
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={(prevHref ?? "#") as any}
              aria-disabled={!prevHref}
              className={`px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-medium ${
                !prevHref ? "pointer-events-none opacity-40" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              Previous
            </Link>
            <Link
              href={(nextHref ?? "#") as any}
              aria-disabled={!nextHref}
              className={`px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-medium ${
                !nextHref ? "pointer-events-none opacity-40" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}


