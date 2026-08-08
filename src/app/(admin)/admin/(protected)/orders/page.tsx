import React from "react";
import Link from "next/link";
import { searchAdminOrders, type AdminOrdersCursor } from "@/lib/firebase/repositories/orders";
import type { OrderStatus, PaymentStatus } from "@/types/order";

export const dynamic = "force-dynamic";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "proof_submitted", "paid", "failed", "refunded"];

/** Stack of {value,id} cursors, one per page already visited - Next pushes the current
 * page's last order onto it, Previous pops the last entry off. Plain, URL-safe values,
 * not a serialized DocumentSnapshot. Cursor `value` may be a number (createdAt millis)
 * or a string (orderNumber, when searching) - a leading "s:"/"n:" tag disambiguates. */
function parseCursorStack(raw?: string): AdminOrdersCursor[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => {
      const [tag, ...rest] = entry.split(":");
      const [value, id] = rest.join(":").split("_");
      if (!id) return null;
      return { value: tag === "n" ? Number(value) : value, id };
    })
    .filter((c): c is AdminOrdersCursor => c !== null && (typeof c.value === "string" || Number.isFinite(c.value)));
}

function serializeCursorStack(stack: AdminOrdersCursor[]): string {
  return stack.map((c) => `${typeof c.value === "number" ? "n" : "s"}:${c.value}_${c.id}`).join(",");
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    cursor?: string;
  };
}) {
  const cursorStack = parseCursorStack(searchParams.cursor);
  const startAfter = cursorStack.length ? cursorStack[cursorStack.length - 1] : undefined;

  const { orders, total, hasMore } = await searchAdminOrders({
    status: searchParams.status as OrderStatus | undefined,
    paymentStatus: searchParams.paymentStatus as PaymentStatus | undefined,
    search: searchParams.search,
    dateFrom: searchParams.dateFrom ? new Date(searchParams.dateFrom).getTime() : undefined,
    dateTo: searchParams.dateTo ? new Date(searchParams.dateTo).getTime() : undefined,
    startAfter,
  });

  const lastOrder = orders.length ? orders[orders.length - 1] : undefined;
  const lastCursorValue: string | number | undefined = searchParams.search
    ? lastOrder?.orderNumber
    : lastOrder?.createdAt;

  // Advanced Filters - preserves every active filter when building a new link
  // (status pill, payment pill, or pagination), same pattern as the Products
  // list page's buildHref helper.
  const buildHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = {
      status: searchParams.status,
      paymentStatus: searchParams.paymentStatus,
      search: searchParams.search,
      dateFrom: searchParams.dateFrom,
      dateTo: searchParams.dateTo,
      ...patch,
    };
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v));
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  const nextHref =
    hasMore && lastOrder && lastCursorValue != null
      ? buildHref({ cursor: serializeCursorStack([...cursorStack, { value: lastCursorValue, id: lastOrder.id }]) })
      : undefined;
  const prevHref = cursorStack.length
    ? buildHref({ cursor: cursorStack.length > 1 ? serializeCursorStack(cursorStack.slice(0, -1)) : undefined })
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders ({total})</h1>
        <Link
          href={"/admin/orders/export" as any}
          className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
        >
          Export
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={buildHref({ status: undefined, cursor: undefined }) as any}
          className={`px-3 py-1.5 text-sm rounded-full border ${
            !searchParams.status ? "bg-primary-6000 text-white border-primary-6000" : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={buildHref({ status: s, cursor: undefined }) as any}
            className={`px-3 py-1.5 text-sm rounded-full border capitalize ${
              searchParams.status === s
                ? "bg-primary-6000 text-white border-primary-6000"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={buildHref({ paymentStatus: undefined, cursor: undefined }) as any}
          className={`px-3 py-1.5 text-sm rounded-full border ${
            !searchParams.paymentStatus ? "bg-primary-6000 text-white border-primary-6000" : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          All payments
        </Link>
        {PAYMENT_STATUSES.map((s) => (
          <Link
            key={s}
            href={buildHref({ paymentStatus: s, cursor: undefined }) as any}
            className={`px-3 py-1.5 text-sm rounded-full border capitalize ${
              searchParams.paymentStatus === s
                ? "bg-primary-6000 text-white border-primary-6000"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>

      <form action="/admin/orders" className="flex flex-wrap items-center gap-2">
        {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
        {searchParams.paymentStatus && <input type="hidden" name="paymentStatus" value={searchParams.paymentStatus} />}
        <input
          type="text"
          name="search"
          defaultValue={searchParams.search}
          placeholder="Search order #…"
          className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
        />
        <input
          type="date"
          name="dateFrom"
          defaultValue={searchParams.dateFrom}
          className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
        />
        <input
          type="date"
          name="dateTo"
          defaultValue={searchParams.dateTo}
          className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
        />
        <button className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700">
          Filter
        </button>
      </form>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
              <th className="p-4">Order #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-neutral-100 dark:border-neutral-800/60">
                <td className="p-4">
                  <Link href={`/admin/orders/${o.id}` as any} className="font-medium hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="p-4 text-neutral-500">{o.guestName || o.guestEmail || o.userId || "—"}</td>
                <td className="p-4">${o.total.toFixed(2)}</td>
                <td className="p-4 capitalize">
                  {o.paymentMethod.replace("_", " ")} · {o.paymentStatus.replace("_", " ")}
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 capitalize">
                    {o.orderStatus}
                  </span>
                </td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  No orders yet. Orders will appear here once checkout is live.
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
