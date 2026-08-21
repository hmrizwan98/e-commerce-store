"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  BuildingStorefrontIcon,
  ArchiveBoxIcon,
  TruckIcon,
  RectangleStackIcon,
  Bars3BottomLeftIcon,
  RectangleGroupIcon,
  PhotoIcon,
  GiftIcon,
  MegaphoneIcon,
  StarIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  NewspaperIcon,
  ShoppingCartIcon,
  UsersIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PaintBrushIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";

const NAV_GROUPS: { title: string; items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] }[] = [
  {
    title: "",
    items: [{ href: "/admin", label: "Dashboard", icon: HomeIcon }],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: ShoppingBagIcon },
      { href: "/admin/categories", label: "Categories", icon: TagIcon },
      { href: "/admin/brands", label: "Brands", icon: BuildingStorefrontIcon },
      { href: "/admin/suppliers", label: "Suppliers", icon: TruckIcon },
      { href: "/admin/collections", label: "Collections", icon: RectangleStackIcon },
      { href: "/admin/inventory", label: "Inventory", icon: ArchiveBoxIcon },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/menus", label: "Menus", icon: Bars3BottomLeftIcon },
      { href: "/admin/pages", label: "Pages", icon: DocumentTextIcon },
      { href: "/admin/faqs", label: "FAQs", icon: QuestionMarkCircleIcon },
      { href: "/admin/reviews", label: "Reviews", icon: StarIcon },
      { href: "/admin/blog-posts", label: "Blog Posts", icon: NewspaperIcon },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCartIcon },
      { href: "/admin/customers", label: "Customers", icon: UsersIcon },
      { href: "/admin/finance", label: "Finance", icon: BanknotesIcon },
    ],
  },
  {
    title: "",
    items: [{ href: "/admin/analytics", label: "Analytics", icon: ChartBarIcon }],
  },
  {
    title: "Appearance",
    items: [
      { href: "/admin/appearance/themes", label: "Theme Catalog", icon: BuildingStorefrontIcon },
      { href: "/admin/appearance/customize", label: "Customize Storefront", icon: PaintBrushIcon },
      { href: "/admin/appearance/popups", label: "Popups & Modals", icon: MegaphoneIcon },
    ],
  },
  {
    title: "",
    items: [{ href: "/admin/settings", label: "Settings", icon: Cog6ToothIcon }],
  },
];

const COLLAPSE_STORAGE_KEY = "admin:sidebarCollapsed";

export default function AdminShell({
  email,
  children,
}: {
  email?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1");
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);

  const handleLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  const sidebarContent = (
    <>
      <div className={`py-5 flex flex-col border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 ${collapsed ? "items-center px-2" : "px-6 space-y-3"}`}>
        <div className="flex items-center justify-between w-full">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">Store Admin</span>
            </div>
          )}
          <button
            onClick={toggleCollapsed}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronDoubleRightIcon className="w-4 h-4" /> : <ChevronDoubleLeftIcon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 text-slate-400">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 bg-white dark:bg-slate-900">
        {NAV_GROUPS.map((group, i) => (
          <div key={i}>
            {group.title && !collapsed && (
              <div className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider font-mono text-slate-400">
                {group.title}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href as any}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      collapsed ? "justify-center" : ""
                    } ${
                      isActive(item.href)
                        ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.href) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#f0f4fa] dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Desktop sidebar */}
      <aside
        className={`flex-shrink-0 hidden md:flex flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 flex flex-col bg-white dark:bg-slate-900 shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar with Blue Gradient matching input_file_1.png */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-gradient-to-r from-indigo-500 via-sky-400 to-cyan-400 text-white shadow-md z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 -ml-1.5 text-white hover:bg-white/10 rounded-lg"
              aria-label="Open menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleCollapsed}
                className="hidden md:flex p-1.5 rounded-lg text-white hover:bg-white/10"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
              {(() => {
                const tenantSlugMatch = pathname?.match(/\/store\/([^\/]+)/);
                const storefrontUrl = tenantSlugMatch ? `/store/${tenantSlugMatch[1]}` : "/";
                return (
                  <Link href={storefrontUrl as any} className="text-xs font-semibold text-white/90 hover:text-white bg-white/15 px-3 py-1.5 rounded-lg transition-colors">
                    ← Storefront
                  </Link>
                );
              })()}
            </div>
          </div>

          {/* User Controls & Logout in Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {email ? email[0].toUpperCase() : "A"}
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-white/80 hover:text-white hover:underline ml-1"
            >
              Log out
            </button>
          </div>
        </header>

        {/* Dashboard Main View Area */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden relative">{children}</main>

        {/* Floating Chat/Support Action Button matching input_file_1.png */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Open Live Assistant"
          >
            <ChatBubbleLeftRightIcon className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}

