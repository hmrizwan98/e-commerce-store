import React from "react";

const pulse = "animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded";

export function SkeletonBar({ className = "" }: { className?: string }) {
  return <div className={`${pulse} ${className}`} />;
}

/** Generic "list of cards" page skeleton - matches the Products/Orders/Pages/etc. admin list layout. */
export function SkeletonListPage({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBar className="h-8 w-48" />
        <SkeletonBar className="h-10 w-32 rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center gap-4"
          >
            <SkeletonBar className="h-12 w-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBar className="h-4 w-1/3" />
              <SkeletonBar className="h-3 w-1/2" />
            </div>
            <SkeletonBar className="h-8 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Table-shaped page skeleton - matches Products/Orders table layouts. */
export function SkeletonTablePage({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBar className="h-8 w-48" />
        <SkeletonBar className="h-10 w-32 rounded-full" />
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonBar key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboardPage() {
  return (
    <div className="space-y-6">
      <SkeletonBar className="h-8 w-56" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
            <SkeletonBar className="h-3 w-20" />
            <SkeletonBar className="h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
            <SkeletonBar className="h-4 w-32 mb-4" />
            <SkeletonBar className="h-56 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

const detailCard = "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs";

/** Order detail skeleton - same card layout as orders/[id]/page.tsx (header card, then a
 * 7/5 two-column grid: items / address / timeline on the left, verification + manage order
 * on the right) so the page doesn't jump when it loads. */
export function SkeletonOrderDetailPage() {
  return (
    <div className="w-full space-y-6">
      <div className={`${detailCard} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <SkeletonBar className="h-7 w-40 rounded-xl" />
            <SkeletonBar className="h-4 w-28" />
          </div>
          <SkeletonBar className="h-8 w-64" />
        </div>
        <SkeletonBar className="h-7 w-36 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className={detailCard}>
            <div className="flex justify-between mb-5">
              <SkeletonBar className="h-5 w-36" />
              <SkeletonBar className="h-4 w-28" />
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-3.5">
                <div className="space-y-2">
                  <SkeletonBar className="h-4 w-48" />
                  <SkeletonBar className="h-3 w-32" />
                </div>
                <SkeletonBar className="h-4 w-20" />
              </div>
            ))}
            <div className="mt-4 pt-4 space-y-3">
              <SkeletonBar className="h-3 w-full" />
              <SkeletonBar className="h-3 w-full" />
              <SkeletonBar className="h-5 w-full" />
            </div>
          </div>
          <div className={detailCard}>
            <SkeletonBar className="h-5 w-56 mb-4" />
            <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
              <SkeletonBar className="h-4 w-40" />
              <SkeletonBar className="h-3 w-32" />
              <SkeletonBar className="h-3 w-64" />
              <SkeletonBar className="h-3 w-48" />
            </div>
          </div>
          <div className={detailCard}>
            <SkeletonBar className="h-5 w-48 mb-4" />
            <SkeletonBar className="h-11 w-full rounded-xl" />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className={detailCard}>
            <div className="flex justify-between mb-5">
              <SkeletonBar className="h-5 w-40" />
              <SkeletonBar className="h-6 w-28 rounded-lg" />
            </div>
            <SkeletonBar className="h-7 w-32 rounded-full mb-3" />
            <SkeletonBar className="h-4 w-64 mb-4" />
            <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5 mb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBar key={i} className="h-3 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBar key={i} className="h-12 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <SkeletonBar className="h-11 rounded-xl" />
              <SkeletonBar className="h-11 rounded-xl" />
            </div>
          </div>
          <div className={detailCard}>
            <SkeletonBar className="h-5 w-36 mb-5" />
            <div className="space-y-4">
              <SkeletonBar className="h-10 w-full rounded-xl" />
              <SkeletonBar className="h-10 w-full rounded-xl" />
              <SkeletonBar className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
