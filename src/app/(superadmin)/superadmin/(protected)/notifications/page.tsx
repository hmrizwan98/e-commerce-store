import React from "react";
import { listSuperAdminNotifications } from "@/lib/firebase/repositories/superadmin-notifications";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

const FILTERS = ["all", "unread", "pending", "approved", "rejected", "completed"] as const;
type Filter = (typeof FILTERS)[number];

export default async function SuperAdminNotificationsPage({ searchParams }: { searchParams: { filter?: string } }) {
  const filter: Filter = (FILTERS as readonly string[]).includes(searchParams.filter ?? "") ? (searchParams.filter as Filter) : "all";
  const notifications = await listSuperAdminNotifications({ filter });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Notifications</h1>
        <p className="text-xs text-neutral-500">Backup requests and commission change requests from stores.</p>
      </div>
      <NotificationsClient notifications={notifications} filter={filter} filters={[...FILTERS]} />
    </div>
  );
}
