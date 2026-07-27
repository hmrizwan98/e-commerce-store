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
