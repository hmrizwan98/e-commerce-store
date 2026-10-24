"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { markAllNotificationsReadAction, resolveBackupRequestAction, setNotificationReadAction } from "./actions";
import type { SuperAdminNotification } from "@/types/superadmin-notification";

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  approved: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  rejected: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
};

const TYPE_LABEL: Record<string, string> = { backup_request: "Backup request", commission_change_request: "Commission change" };

export default function NotificationsClient({
  notifications,
  filter,
  filters,
}: {
  notifications: SuperAdminNotification[];
  filter: string;
  filters: string[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<{ ok: boolean; error?: string }>, success?: string) => {
    setBusy(key);
    try {
      const res = await fn();
      if (!res.ok) toast.error(res.error ?? "Something went wrong.");
      else {
        if (success) toast.success(success);
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  };

  const decide = (n: SuperAdminNotification, decision: "approved" | "rejected" | "completed") => {
    if (decision === "completed" && !window.confirm("Mark as completed only if the backup has actually been produced and delivered. Continue?")) return;
    const note = decision === "rejected" ? window.prompt("Reason for rejecting (shown to the store):") ?? undefined : undefined;
    run(`${n.id}:${decision}`, () => resolveBackupRequestAction(n.id, decision, note), `Request ${decision}.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f}
              href={(f === "all" ? "/notifications" : `/notifications?filter=${f}`) as any}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize border ${
                f === filter ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300"
              }`}
            >
              {f}
            </Link>
          ))}
        </div>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => run("all", () => markAllNotificationsReadAction(), "All marked as read.")}
          className="text-xs font-bold text-indigo-600 hover:underline disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500">
          No notifications here.
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`p-5 rounded-2xl border bg-white dark:bg-neutral-900 ${n.read ? "border-neutral-200 dark:border-neutral-800" : "border-indigo-300 dark:border-indigo-700 shadow-sm"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500" aria-label="Unread" />}
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{TYPE_LABEL[n.type] ?? n.type}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold capitalize ${STATUS_CLASS[n.status] ?? ""}`}>{n.status}</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-neutral-900 dark:text-white">{n.title}</p>
                  {n.detail && <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{n.detail}</p>}
                  <p className="text-[11px] text-neutral-400 mt-1" suppressHydrationWarning>
                    {n.storeName} · {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {n.type === "backup_request" && n.status === "pending" && (
                    <>
                      <button type="button" disabled={busy !== null} onClick={() => decide(n, "approved")} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold disabled:opacity-50">
                        Approve
                      </button>
                      <button type="button" disabled={busy !== null} onClick={() => decide(n, "rejected")} className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 text-xs font-bold disabled:opacity-50">
                        Reject
                      </button>
                    </>
                  )}
                  {n.type === "backup_request" && n.status === "approved" && (
                    <>
                      <button type="button" disabled={busy !== null} onClick={() => decide(n, "completed")} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-50">
                        Mark completed
                      </button>
                      <button type="button" disabled={busy !== null} onClick={() => decide(n, "rejected")} className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 text-xs font-bold disabled:opacity-50">
                        Reject
                      </button>
                    </>
                  )}
                  {n.type === "commission_change_request" && (
                    <Link href={`/${n.storeId}/edit?tab=Commission` as any} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold">
                      Review
                    </Link>
                  )}
                  <Link href={`/${n.storeId}/edit` as any} className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200">
                    Open store
                  </Link>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => run(`${n.id}:read`, () => setNotificationReadAction(n.id, !n.read))}
                    className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-50"
                  >
                    {n.read ? "Mark unread" : "Mark read"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-neutral-400">
        Backups are not produced automatically yet - approve a request, produce the backup, then mark it completed.
      </p>
    </div>
  );
}
