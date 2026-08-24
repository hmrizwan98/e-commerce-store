import React from "react";
import Link from "next/link";
import { getAllFaqsForAdmin } from "@/lib/firebase/repositories/faqs";
import FaqRowActions from "./FaqRowActions";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const faqs = await getAllFaqsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-wider mb-2">
            ❓ Content Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            FAQs <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({faqs.length})</span>
          </h1>
        </div>
        <Link
          href={"/admin/faqs/new" as any}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-primary-6000 hover:bg-primary-700 text-white text-sm font-semibold shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02]"
        >
          + Add FAQ
        </Link>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-900/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                <th className="p-4 pl-6">Question</th>
                <th className="p-4">Order</th>
                <th className="p-4">Visibility</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {faqs.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 pl-6 font-medium text-slate-900 dark:text-slate-100">
                    <Link href={`/admin/faqs/${f.id}/edit` as any} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      {f.question}
                    </Link>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 font-mono text-xs">
                      {f.order}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        f.isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60"
                      }`}
                    >
                      {f.isActive ? "● Visible" : "○ Hidden"}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <FaqRowActions id={f.id} />
                  </td>
                </tr>
              ))}
              {!faqs.length && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="text-3xl mb-2">❓</div>
                    <p className="font-medium">No FAQs found.</p>
                    <p className="text-xs text-slate-400 mt-1">Get started by creating your first storefront FAQ.</p>
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
