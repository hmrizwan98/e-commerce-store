"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SoundToggle from "@/components/notifications/SoundToggle";
import { markAllStoreNotificationsReadAction, setStoreNotificationReadAction } from "./actions";
import type { StoreNotification } from "@/types/store-notification";

const DECISION_CLASS: Record<string, string> = {
  approved: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  rejected: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
};
const KIND_LABEL: Record<string, string> = {
  commission_request_decision: "Commission request",
  backup_request_decision: "Backup request",
};

export default function StoreNotificationsClient({ notifications, unreadOnly }: { notifications: StoreNotification[]; unreadOnly: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusy(true);
    try {
      const res = await fn();
      if (!res.ok) toast.error(res.error ?? "Something went wrong.");
      else {
        router.refresh();
        // Lets the header bell / sidebar badge refresh right away.
        window.dispatchEvent(new Event("webriiz:notifications-changed"));
      }
    } finally {
      setBusy(false);
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {[
            ["All", "/admin/notifications", !unreadOnly],
            ["Unread", "/admin/notifications?filter=unread", unreadOnly],
          ].map(([label, href, active]) => (
            <Link
              key={String(label)}
              href={href as any}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                active ? "bg-primary-600 text-white border-primary-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <SoundToggle />
          <button
            type="button"
            disabled={busy || !hasUnread}
            onClick={() => run(() => markAllStoreNotificationsReadAction())}
            className="text-xs font-bold text-primary-600 hover:underline disabled:opacity-40"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
          {unreadOnly ? "You're all caught up." : "No notifications yet. When the platform team decides on one of your requests, it shows up here."}
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 ${n.read ? "border-slate-200 dark:border-slate-800" : "border-primary-300 dark:border-primary-700 shadow-sm"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500" aria-label="Unread" />}
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{KIND_LABEL[n.kind] ?? "Update"}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold capitalize ${DECISION_CLASS[n.decision] ?? ""}`}>{n.decision}</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{n.title}</p>
                  {n.detail && <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{n.detail}</p>}
                  {n.note && <p className="text-xs text-slate-500 mt-1">Note from the platform: “{n.note}”</p>}
                  <p className="text-[11px] text-slate-400 mt-1" suppressHydrationWarning>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href={n.href as any} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
                    View
                  </Link>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => setStoreNotificationReadAction(n.id, !n.read))}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-50"
                  >
                    {n.read ? "Mark unread" : "Mark read"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
