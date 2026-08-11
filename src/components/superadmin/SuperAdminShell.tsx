"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BuildingStorefrontIcon,
  ChartBarIcon,
  BanknotesIcon,
  PlusCircleIcon,
  ArrowTopRightOnSquareIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "PLATFORM OVERVIEW",
    items: [
      { href: "/superadmin", label: "Dashboard", icon: ChartBarIcon, exact: true },
      { href: "/superadmin/stores", label: "Store Management", icon: BuildingStorefrontIcon },
      { href: "/superadmin/new", label: "Create New Store", icon: PlusCircleIcon },
    ],
  },
  {
    title: "FINANCIALS",
    items: [{ href: "/superadmin/finance", label: "Finance & Payouts", icon: BanknotesIcon }],
  },
  {
    title: "PUBLIC PLATFORM",
    items: [{ href: "/platform", label: "Platform Marketing", icon: ArrowTopRightOnSquareIcon }],
  },
];

export default function SuperAdminShell({
  email,
  children,
}: {
  email?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/superadmin/login" as any);
    router.refresh();
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans antialiased">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between">
            <Link href={"/superadmin" as any} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-6000 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-primary-6000/20 group-hover:scale-105 transition-transform">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
                  Super Admin
                </span>
                <span className="text-[11px] font-mono text-neutral-400 block">SaaS Control Center</span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="space-y-2">
                <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider font-mono text-neutral-300">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href, item.exact);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href as any}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          active
                            ? "bg-gradient-to-r from-primary-6000/20 to-indigo-600/20 text-white border border-primary-500/30 font-semibold"
                            : "text-neutral-300 hover:text-white hover:bg-neutral-900"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${active ? "text-primary-400" : "text-neutral-400"}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-neutral-900 bg-neutral-950/50 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-white truncate">{email || "Super Admin"}</span>
            <span className="block text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Authenticated
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-900 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f0f4fa] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
        {/* Top Header Bar matching input_file_1.png */}
        <header className="sticky top-0 z-30 h-16 bg-gradient-to-r from-indigo-500 via-sky-400 to-cyan-400 text-white shadow-md px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
              <span className="bg-white/15 px-2.5 py-1 rounded-md">Super Admin</span>
              <span>/</span>
              <span className="capitalize font-bold text-white">
                {pathname.split("/").pop() || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
            <div className="hidden lg:flex items-center gap-2 text-xs text-white/95 font-medium bg-white/15 px-3 py-1.5 rounded-full">
              <span>⚠️ Your SMS Credit is 0</span>
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors">
                + Add SMS Credits
              </button>
            </div>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold tracking-wider bg-emerald-600 text-white shadow-xs uppercase">
              ACCEPTING ORDERS
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs">
              🎀 Premium Plus Package
            </span>

            {email && <span className="hidden md:inline text-xs font-semibold text-white/90 bg-white/15 px-3 py-1.5 rounded-lg">{email}</span>}
          </div>
        </header>

        {/* Canvas Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative">{children}</main>
      </div>
    </div>
  );
}


