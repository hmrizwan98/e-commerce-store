"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { markAllMessagesReadAction, setMessageReadAction } from "./actions";
import { contactReplyHref } from "@/lib/contact/contact-message";
import type { ContactSubmission } from "@/types/contact-submission";

export default function MessagesClient({
  messages,
  unreadCount,
  unreadOnly,
  storeName,
  capped,
}: {
  messages: ContactSubmission[];
  unreadCount: number;
  unreadOnly: boolean;
  storeName: string;
  capped: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusy(true);
    try {
      const res = await fn();
      if (!res.ok) toast.error(res.error ?? "Something went wrong.");
      else router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const open = (m: ContactSubmission) => {
    setOpenId(openId === m.id ? null : m.id);
    if (openId !== m.id && m.read !== true) void run(() => setMessageReadAction(m.id, true));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(
            [
              ["All", "/admin/messages", !unreadOnly],
              [`Unread (${unreadCount})`, "/admin/messages?filter=unread", unreadOnly],
            ] as const
          ).map(([label, href, active]) => (
            <Link
              key={href}
              href={href as any}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                active ? "bg-primary-600 text-white border-primary-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
        <button
          type="button"
          disabled={busy || unreadCount === 0}
          onClick={() => run(() => markAllMessagesReadAction())}
          className="text-xs font-bold text-primary-600 hover:underline disabled:opacity-40"
        >
          Mark all as read
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
          {unreadOnly ? "You're all caught up." : "No messages yet. When a customer uses your Contact page, the message shows up here."}
        </div>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => {
            const isOpen = openId === m.id;
            const unread = m.read !== true;
            const reply = contactReplyHref(m.email, storeName);
            return (
              <li key={m.id} className={`rounded-2xl border bg-white dark:bg-slate-900 ${unread ? "border-primary-300 dark:border-primary-800" : "border-slate-200 dark:border-slate-800"}`}>
                <button type="button" onClick={() => open(m)} className="w-full text-left p-4 flex items-start gap-3" aria-expanded={isOpen}>
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${unread ? "bg-primary-500" : "bg-transparent"}`} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className={`text-sm truncate ${unread ? "font-extrabold" : "font-semibold"} text-slate-900 dark:text-slate-100`}>{m.name}</span>
                      <span className="text-[11px] text-slate-500" suppressHydrationWarning>
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                      </span>
                    </span>
                    <span className="block text-xs text-slate-500 truncate">{m.email}</span>
                    {!isOpen && <span className="block text-xs text-slate-600 dark:text-slate-300 truncate mt-1">{m.message}</span>}
                    {unread && <span className="sr-only">Unread</span>}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pl-9 space-y-3">
                    {/* Plain text only - React escapes it; line breaks kept. */}
                    <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">{m.message}</p>
                    <div className="flex flex-wrap gap-4 text-xs font-bold">
                      {reply && (
                        <a href={reply} className="text-primary-600 hover:underline">
                          Reply by email
                        </a>
                      )}
                      <button type="button" disabled={busy} onClick={() => run(() => setMessageReadAction(m.id, !(m.read === true)))} className="text-slate-600 dark:text-slate-300 hover:underline">
                        {m.read === true ? "Mark as unread" : "Mark as read"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {capped && <p className="text-[11px] text-slate-400">Showing 500 messages - the inbox limit. Some older messages may not be listed.</p>}
    </div>
  );
}
