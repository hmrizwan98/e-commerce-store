import React from "react";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { adminDb } from "@/lib/firebase/admin";
import { listContactSubmissions, INBOX_LIMIT } from "@/lib/firebase/repositories/contact-submissions";
import { getGeneralSettings } from "@/lib/firebase/repositories/site-settings";
import MessagesClient from "./MessagesClient";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage({ searchParams }: { searchParams?: { filter?: string } }) {
  const { tenantId } = await requireAdmin();
  const [messages, general] = await Promise.all([listContactSubmissions(adminDb(), tenantId), getGeneralSettings()]);
  const unreadOnly = searchParams?.filter === "unread";
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Messages</h1>
        <p className="text-xs text-slate-500">Messages customers sent through your store&apos;s Contact page.</p>
      </div>
      <MessagesClient
        messages={JSON.parse(JSON.stringify(unreadOnly ? messages.filter((m) => m.read !== true) : messages))}
        unreadCount={messages.filter((m) => m.read !== true).length}
        unreadOnly={unreadOnly}
        storeName={general.storeName || "our store"}
        capped={messages.length >= INBOX_LIMIT}
      />
    </div>
  );
}
