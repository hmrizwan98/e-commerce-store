import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomerAddresses, resolveCustomerForDisplay } from "@/lib/firebase/repositories/customers";
import { getOrdersByUserId, getOrdersByGuestEmail } from "@/lib/firebase/repositories/orders";
import { getReviewsByUserId } from "@/lib/firebase/repositories/reviews";
import { getRecentCustomerActivity } from "@/lib/firebase/repositories/customer-activity-logs";
import { getGdprRequestHistory } from "@/lib/firebase/repositories/gdpr-requests";
import { isNewsletterSubscriber } from "@/lib/firebase/repositories/newsletter-subscribers";
import { computeCustomerAnalytics } from "@/lib/customers/analytics";
import { computeCustomerSegments } from "@/lib/customers/segments";
import { buildCustomerTimeline } from "@/lib/customers/timeline";
import CustomerCrmActions from "../CustomerCrmActions";

export const dynamic = "force-dynamic";

const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6";

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const resolved = await resolveCustomerForDisplay(params.id);
  if (!resolved) notFound();
  const { customer, materialized } = resolved;
  const isGuest = customer.status === "guest";

  const [addresses, orders, reviews, activity, gdprHistory, isSubscribed] = await Promise.all([
    materialized ? getCustomerAddresses(customer.uid) : Promise.resolve([]),
    isGuest ? getOrdersByGuestEmail(customer.email) : getOrdersByUserId(customer.uid),
    isGuest ? Promise.resolve([]) : getReviewsByUserId(customer.uid),
    materialized ? getRecentCustomerActivity(customer.uid) : Promise.resolve([]),
    materialized ? getGdprRequestHistory(customer.uid) : Promise.resolve([]),
    isNewsletterSubscriber(customer.email),
  ]);

  const analytics = computeCustomerAnalytics(orders, reviews.length);
  const segments = computeCustomerSegments(customer, analytics, isSubscribed);
  const timeline = buildCustomerTimeline(customer, orders, reviews, activity);

  const stats: { label: string; value: string }[] = [
    { label: "Total Orders", value: String(analytics.totalOrders) },
    { label: "Total Spend", value: `$${analytics.totalSpend.toFixed(2)}` },
    { label: "Avg Order Value", value: `$${analytics.avgOrderValue.toFixed(2)}` },
    { label: "Lifetime Value", value: `$${analytics.lifetimeValue.toFixed(2)}` },
    { label: "Last Purchase", value: analytics.lastPurchaseAt ? new Date(analytics.lastPurchaseAt).toLocaleDateString() : "—" },
    { label: "Total Reviews", value: String(analytics.totalReviews) },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{customer.displayName || customer.email}</h1>
          <p className="text-sm text-neutral-500">{customer.email}</p>
          {customer.createdAt && (
            <p className="text-xs text-neutral-500 mt-1">
              Registered {new Date(customer.createdAt).toLocaleDateString()} · Last login:{" "}
              {customer.lastLoginAt ? new Date(customer.lastLoginAt).toLocaleDateString() : "Never"}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end">
          {segments.map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400 capitalize"
            >
              {s.replace("_", " ")}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={cardClass}>
            <div className="text-sm text-neutral-500">{s.label}</div>
            <div className="text-xl font-semibold mt-1">{s.value}</div>
          </div>
        ))}
        <div className={cardClass}>
          <div className="text-sm text-neutral-500">Wishlist Count</div>
          <div className="text-xl font-semibold mt-1">
            {analytics.wishlistCount ?? "—"}
          </div>
          {analytics.wishlistCount === null && (
            <p className="text-xs text-neutral-500 mt-1">Not tracked - wishlist is browser-local only.</p>
          )}
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Addresses</h2>
        {addresses.length ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {addresses.map((a: any) => (
              <div key={a.id} className="text-sm border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                <p className="font-medium">{a.fullName}</p>
                <p className="text-neutral-500">
                  {a.line1}, {a.city} {a.postalCode}
                </p>
                <p className="text-neutral-500">{a.phone}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No saved addresses.</p>
        )}
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Order history</h2>
        {orders.length ? (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {orders.map((o) => (
              <div key={o.id} className="flex justify-between py-3 text-sm">
                <Link href={`/admin/orders/${o.id}` as any} className="font-medium hover:underline">
                  {o.orderNumber}
                </Link>
                <span className="capitalize text-neutral-500">{o.orderStatus}</span>
                <span>${o.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No orders yet.</p>
        )}
      </div>

      <div className={cardClass}>
        <h2 className="font-semibold mb-4">Customer Timeline</h2>
        <div className="space-y-2 text-sm max-h-96 overflow-y-auto">
          {timeline.map((e, i) => (
            <div key={i} className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>
                {e.label}
                {e.note ? ` — ${e.note}` : ""}
              </span>
              <span>{new Date(e.at).toLocaleString()}</span>
            </div>
          ))}
          {!timeline.length && <p className="text-neutral-500">No activity recorded yet.</p>}
        </div>
      </div>

      <CustomerCrmActions
        routeId={params.id}
        customer={customer}
        gdprHistory={gdprHistory}
      />
    </div>
  );
}
