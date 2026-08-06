import React from "react";
import Link from "next/link";
import { getAllSuppliersForAdmin } from "@/lib/firebase/repositories/suppliers";
import SupplierRowActions from "./SupplierRowActions";

export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage({
  searchParams,
}: {
  searchParams: { trashed?: string };
}) {
  const trashed = searchParams.trashed === "true";
  const all = await getAllSuppliersForAdmin(true);
  const suppliers = all.filter((s) => Boolean(s.isDeleted) === trashed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Suppliers ({suppliers.length})</h1>
        <div className="flex gap-3">
          <Link
            href={trashed ? "/admin/suppliers" : "/admin/suppliers?trashed=true"}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${
              trashed ? "bg-red-600 text-white border-red-600" : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {trashed ? "Viewing Trash" : "Trash"}
          </Link>
          <Link
            href={"/admin/suppliers/new" as any}
            className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium"
          >
            Add supplier
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
              <th className="p-4">Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Email</th>
              <th className="p-4">Active</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-b border-neutral-100 dark:border-neutral-800/60">
                <td className="p-4">
                  <Link href={`/admin/suppliers/${s.id}/edit` as any} className="font-medium hover:underline">
                    {s.name}
                  </Link>
                </td>
                <td className="p-4 text-neutral-500">{s.contactName || "—"}</td>
                <td className="p-4 text-neutral-500">{s.email || "—"}</td>
                <td className="p-4">{s.isActive ? "Yes" : "No"}</td>
                <td className="p-4 text-right">
                  <SupplierRowActions id={s.id} trashed={trashed} />
                </td>
              </tr>
            ))}
            {!suppliers.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  No suppliers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
