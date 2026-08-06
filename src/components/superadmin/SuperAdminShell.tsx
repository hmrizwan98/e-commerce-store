"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";

export default function SuperAdminShell({
  email,
  children,
}: {
  email?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/superadmin/login" as any);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-6">
          <Link href={"/superadmin" as any} className="flex items-center gap-2 font-semibold">
            <BuildingStorefrontIcon className="w-5 h-5" />
            Super Admin
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link href={"/superadmin" as any} className="hover:underline">
              Dashboard
            </Link>
            <Link href={"/superadmin/stores" as any} className="hover:underline">
              Stores
            </Link>
            <Link href={"/superadmin/finance" as any} className="hover:underline">
              Finance
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {email && <span className="hidden sm:inline text-sm text-neutral-500">{email}</span>}
          <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:underline">
            Log out
          </button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto">{children}</main>
    </div>
  );
}
