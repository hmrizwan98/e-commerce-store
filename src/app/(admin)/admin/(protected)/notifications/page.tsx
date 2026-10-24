import React from "react";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { listStoreNotifications } from "@/lib/firebase/repositories/store-notifications";
import StoreNotificationsClient from "./StoreNotificationsClient";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage({ searchParams }: { searchParams?: { filter?: string } }) {
  const { tenantId } = await requireAdmin();
  const unreadOnly = searchParams?.filter === "unread";
  const notifications = await listStoreNotifications(tenantId, { unreadOnly });
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Notifications</h1>
        <p className="text-xs text-slate-500">Decisions from the Webriiz platform team on your commission and backup requests.</p>
      </div>
      <StoreNotificationsClient notifications={notifications} unreadOnly={unreadOnly} />
    </div>
  );
}
