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
      <h1 className="text-2xl font-semibold">Reviews</h1>

      <div className="flex gap-2">
        {["", "pending", "approved", "rejected"].map((s) => (
          <Link
            key={s}
            href={s ? `/admin/reviews?status=${s}` : "/admin/reviews"}
            className={`px-3 py-1.5 text-sm rounded-full border ${
              (searchParams.status ?? "") === s
                ? "bg-primary-6000 text-white border-primary-6000"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {s ? s[0].toUpperCase() + s.slice(1) : "All"}
          </Link>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
              <th className="p-4">Reviewer</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Comment</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 dark:border-neutral-800/60 align-top">
                <td className="p-4 whitespace-nowrap">{r.userName}</td>
                <td className="p-4">{r.rating} ★</td>
                <td className="p-4 max-w-md">
                  <p className="line-clamp-2 text-neutral-600 dark:text-neutral-400">{r.comment}</p>
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 capitalize">
                    {r.status}
                  </span>
                </td>
                <td className="p-4">
                  <ReviewRowActions id={r.id} productId={r.productId} status={r.status} />
                </td>
              </tr>
            ))}
            {!reviews.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
