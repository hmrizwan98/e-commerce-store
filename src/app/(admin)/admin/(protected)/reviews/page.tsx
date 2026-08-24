import React from "react";
import Link from "next/link";
import { getAllReviewsForAdmin } from "@/lib/firebase/repositories/reviews";
import ReviewRowActions from "./ReviewRowActions";
import type { ReviewStatus } from "@/types/review";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = (searchParams.status as ReviewStatus) || undefined;
  const reviews = await getAllReviewsForAdmin(status);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-wider mb-2">
          ⭐ Moderation
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Customer Reviews
        </h1>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {["", "pending", "approved", "rejected"].map((s) => {
          const isActive = (searchParams.status ?? "") === s;
          return (
            <Link
              key={s}
              href={s ? `/admin/reviews?status=${s}` : "/admin/reviews"}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                isActive
                  ? "bg-primary-6000 text-white border-primary-6000 shadow-md shadow-primary-500/20"
                  : "bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {s ? s[0].toUpperCase() + s.slice(1) : "All Reviews"}
            </Link>
          );
        })}
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-900/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                <th className="p-4 pl-6">Reviewer</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Comment</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors align-top">
                  <td className="p-4 pl-6 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                        {r.userName?.slice(0, 1).toUpperCase() || "U"}
                      </div>
                      <span>{r.userName}</span>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 text-xs font-bold">
                      {r.rating} ★
                    </span>
                  </td>
                  <td className="p-4 max-w-md">
                    <p className="line-clamp-2 text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{r.comment}</p>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                        r.status === "approved"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                          : r.status === "rejected"
                          ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right whitespace-nowrap">
                    <ReviewRowActions id={r.id} productId={r.productId} status={r.status} />
                  </td>
                </tr>
              ))}
              {!reviews.length && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="text-3xl mb-2">⭐</div>
                    <p className="font-medium">No reviews found.</p>
                    <p className="text-xs text-slate-400 mt-1">Customer reviews matching your filter will appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
