import React from "react";
import Link from "next/link";
import { getAllAnnouncementBarsForAdmin } from "@/lib/firebase/repositories/announcement-bars";
import AnnouncementRowActions from "./AnnouncementRowActions";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const bars = await getAllAnnouncementBarsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Announcement bars ({bars.length})</h1>
        <Link
          href={"/admin/announcements/new" as any}
          className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium"
        >
          Add announcement bar
        </Link>
      </div>

      <p className="text-sm text-neutral-500">
        When more than one bar is active at the same time, the highest-priority one wins.
      </p>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
              <th className="p-4">Title</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Schedule</th>
              <th className="p-4">Active</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {bars.map((bar) => (
              <tr key={bar.id} className="border-b border-neutral-100 dark:border-neutral-800/60">
                <td className="p-4">
                  <Link href={`/admin/announcements/${bar.id}/edit` as any} className="font-medium hover:underline">
                    {bar.title}
                  </Link>
                </td>
                <td className="p-4">{bar.priority}</td>
                <td className="p-4 text-neutral-500">
                  {bar.startDate ? new Date(bar.startDate).toLocaleDateString() : "Always"}
                  {" – "}
                  {bar.endDate ? new Date(bar.endDate).toLocaleDateString() : "No end"}
                </td>
                <td className="p-4">{bar.isActive ? "Yes" : "No"}</td>
                <td className="p-4 text-right">
                  <AnnouncementRowActions id={bar.id} />
                </td>
              </tr>
            ))}
            {!bars.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  No announcement bars yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
