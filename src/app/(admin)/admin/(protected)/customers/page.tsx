import React from "react";
import Link from "next/link";
import {
  getCustomersPage,
  getGuestCustomers,
  getCustomerCount,
  type CustomersPageCursor,
  type GuestCustomer,
} from "@/lib/firebase/repositories/customers";

export const dynamic = "force-dynamic";

const STATUS_BADGE_CLASS: Record<string, string> = {
  active: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
  blocked: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
  deleted: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60",
  guest: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
};

/** Stack of {createdAt,id} cursors, one per page already visited - Next pushes the current
 * page's last customer onto it, Previous pops the last entry off. Plain, URL-safe values,
 * not a serialized DocumentSnapshot. */
function parseCursorStack(raw?: string): CustomersPageCursor[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => {
      const [createdAtStr, id] = entry.split("_");
      return { createdAt: Number(createdAtStr), id };
    })
    .filter((c): c is CustomersPageCursor => Number.isFinite(c.createdAt) && !!c.id);
}

function serializeCursorStack(stack: CustomersPageCursor[]): string {
  return stack.map((c) => `${c.createdAt}_${c.id}`).join(",");
}

function customersHref(cursorStack: CustomersPageCursor[]) {
  return cursorStack.length
    ? ({ pathname: "/admin/customers", query: { cursor: serializeCursorStack(cursorStack) } } as any)
    : ("/admin/customers" as any);
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { cursor?: string };
}) {
  const cursorStack = parseCursorStack(searchParams.cursor);
  const startAfter = cursorStack.length ? cursorStack[cursorStack.length - 1] : undefined;
  const isFirstPage = cursorStack.length === 0;

  // Guest rows are derived from recent orders, not themselves cursor-paginated - showing
  // them again on every page would duplicate every guest across the whole list, so they
  // only appear alongside page 1 (identical to today's behavior, which always showed them
  // since there was only ever one page).
  const [{ customers, hasMore }, guests, totalCount] = await Promise.all([
    getCustomersPage({ startAfter }),
    isFirstPage ? getGuestCustomers() : Promise.resolve([] as GuestCustomer[]),
    getCustomerCount(),
  ]);

  const lastCustomer = customers.length ? customers[customers.length - 1] : undefined;
  const nextHref =
    hasMore && lastCustomer?.createdAt != null
      ? customersHref([...cursorStack, { createdAt: lastCustomer.createdAt, id: lastCustomer.uid }])
      : undefined;
  const prevHref = cursorStack.length ? customersHref(cursorStack.slice(0, -1)) : undefined;

  const rows = [
    ...customers.map((c) => ({
      id: c.uid,
      displayName: c.displayName,
      email: c.email,
      orderCount: c.orderCount ?? 0,
      totalSpend: c.totalSpend ?? 0,
      createdAt: c.createdAt,
      status: c.status ?? "active",
    })),
    ...guests.map((g) => ({
      id: g.uid,
      displayName: g.displayName,
      email: g.email,
      orderCount: g.orderCount,
      totalSpend: g.totalSpend,
      createdAt: g.createdAt,
      status: "guest" as const,
    })),
  ].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-wider mb-2">
            👥 CRM & Audience
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
            <span>Customers</span>
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
              ({customers.length} of {totalCount})
            </span>
            {isFirstPage && guests.length > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 font-medium">
                +{guests.length} guest checkout{guests.length === 1 ? "" : "s"}
              </span>
            )}
          </h1>
        </div>
        <Link
          href={"/admin/customers/export" as any}
          className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold shadow-sm transition-all"
        >
          📥 Export CSV
        </Link>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-900/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                <th className="p-4 pl-6">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Total Spend</th>
                <th className="p-4 pr-6">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 pl-6 font-medium text-slate-900 dark:text-slate-100">
                    <Link href={`/admin/customers/${r.id}` as any} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      {r.displayName || "—"}
                    </Link>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{r.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_BADGE_CLASS[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{r.orderCount}</td>
                  <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">${r.totalSpend.toFixed(2)}</td>
                  <td className="p-4 pr-6 text-slate-500 dark:text-slate-400 text-xs">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="text-3xl mb-2">👥</div>
                    <p className="font-medium">No customers found.</p>
                    <p className="text-xs text-slate-400 mt-1">Registered accounts and guest checkouts will appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(nextHref || prevHref) && (
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg text-xs font-medium">
          <Link
            href={prevHref ?? "#"}
            aria-disabled={!prevHref}
            className={`px-4 py-2 rounded-full border border-slate-200/80 dark:border-slate-700/80 font-semibold transition-all ${
              !prevHref ? "pointer-events-none opacity-40" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            }`}
          >
            ← Previous
          </Link>
          <Link
            href={nextHref ?? "#"}
            aria-disabled={!nextHref}
            className={`px-4 py-2 rounded-full border border-slate-200/80 dark:border-slate-700/80 font-semibold transition-all ${
              !nextHref ? "pointer-events-none opacity-40" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            }`}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}
