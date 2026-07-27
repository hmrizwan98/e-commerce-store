import React from "react";
import Link from "next/link";
import { getAllFaqsForAdmin } from "@/lib/firebase/repositories/faqs";
import FaqRowActions from "./FaqRowActions";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const faqs = await getAllFaqsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">FAQs ({faqs.length})</h1>
        <Link
          href={"/admin/faqs/new" as any}
          className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium"
        >
          Add FAQ
        </Link>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
              <th className="p-4">Question</th>
              <th className="p-4">Order</th>
              <th className="p-4">Visible</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((f) => (
              <tr key={f.id} className="border-b border-neutral-100 dark:border-neutral-800/60">
                <td className="p-4">
                  <Link href={`/admin/faqs/${f.id}/edit` as any} className="font-medium hover:underline">
                    {f.question}
                  </Link>
                </td>
                <td className="p-4">{f.order}</td>
                <td className="p-4">{f.isActive ? "Yes" : "No"}</td>
                <td className="p-4 text-right">
                  <FaqRowActions id={f.id} />
                </td>
              </tr>
            ))}
            {!faqs.length && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-neutral-500">
                  No FAQs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
