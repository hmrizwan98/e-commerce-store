import React from "react";
import Link from "next/link";
import { searchAdminOrders, type AdminOrdersCursor } from "@/lib/firebase/repositories/orders";
import type { OrderStatus, PaymentStatus } from "@/types/order";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  EyeIcon,
  CalendarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import OrdersTableClient from "./OrdersTableClient";

export const dynamic = "force-dynamic";

const STATUSES: { value: OrderStatus | "all"; label: string; dot: string }[] = [
  { value: "all", label: "All Orders", dot: "bg-slate-400" },
  { value: "pending", label: "Pending", dot: "bg-amber-500" },
  { value: "confirmed", label: "Confirmed", dot: "bg-blue-500" },
  { value: "processing", label: "Processing", dot: "bg-purple-500" },
  { value: "packed", label: "Packed", dot: "bg-indigo-500" },
  { value: "shipped", label: "Shipped", dot: "bg-cyan-500" },
  { value: "delivered", label: "Delivered", dot: "bg-emerald-500" },
  { value: "cancelled", label: "Cancelled", dot: "bg-rose-500" },
  { value: "refunded", label: "Refunded", dot: "bg-pink-500" },
];

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

function renderStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending
        </span>
      );
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Confirmed
        </span>
      );
    case "processing":
    case "packed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          {status === "processing" ? "Processing" : "Packed"}
        </span>
      );
    case "shipped":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          Shipped
        </span>
      );
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Delivered
        </span>
      );
    case "cancelled":
    case "refunded":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {status}
        </span>
      );
  }
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Orders Management
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              {total} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track, filter, and process customer orders in real-time.
          </p>
        </div>

        <Link
          href={"/admin/orders/export" as any}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 shadow-sm transition-all shrink-0"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          <span>Export CSV</span>
        </Link>
      </div>

      {/* Status Tabs Filter */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {STATUSES.map((st) => {
            const isSelected =
              (st.value === "all" && !searchParams.status) || searchParams.status === st.value;
            const href = buildHref({
              status: st.value === "all" ? undefined : st.value,
              cursor: undefined,
            });

            return (
              <Link
                key={st.value}
                href={href as any}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${st.dot} ${isSelected ? "bg-white" : ""}`} />
                <span>{st.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <form
        action="/admin/orders"
        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3"
      >
        {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
        {searchParams.paymentStatus && <input type="hidden" name="paymentStatus" value={searchParams.paymentStatus} />}

        <div className="relative flex-1 min-w-[220px]">
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="search"
            defaultValue={searchParams.search}
            placeholder="Search Order #, customer name, phone..."
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="date"
              name="dateFrom"
              defaultValue={searchParams.dateFrom}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100"
            />
          </div>
          <span className="text-xs text-slate-400 font-bold">to</span>
          <div className="relative">
            <input
              type="date"
              name="dateTo"
              defaultValue={searchParams.dateTo}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200/60 dark:border-indigo-800/60 transition-all cursor-pointer"
        >
          <FunnelIcon className="w-3.5 h-3.5" />
          <span>Filter</span>
        </button>
      </form>

      {/* Orders Table Client Component */}
      <OrdersTableClient orders={orders} />

      {/* Pagination */}
      {(nextHref || prevHref) && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-medium text-slate-500">
            Showing recent page entries
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={(prevHref ?? "#") as any}
              aria-disabled={!prevHref}
              className={`px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all ${
                !prevHref
                  ? "pointer-events-none opacity-40 bg-slate-50 dark:bg-slate-900"
                  : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              }`}
            >
              ← Previous Page
            </Link>
            <Link
              href={(nextHref ?? "#") as any}
              aria-disabled={!nextHref}
              className={`px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all ${
                !nextHref
                  ? "pointer-events-none opacity-40 bg-slate-50 dark:bg-slate-900"
                  : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              }`}
            >
              Next Page →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

