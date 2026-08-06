"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
      { href: "/admin/homepage", label: "Homepage", icon: RectangleGroupIcon },
      { href: "/admin/hero-slides", label: "Hero Slides", icon: PhotoIcon },
      { href: "/admin/promo-banners", label: "Promo Banners", icon: GiftIcon },
      { href: "/admin/announcements", label: "Announcements", icon: MegaphoneIcon },
      { href: "/admin/reviews", label: "Reviews", icon: StarIcon },
      { href: "/admin/pages", label: "Pages", icon: DocumentTextIcon },
      { href: "/admin/faqs", label: "FAQs", icon: QuestionMarkCircleIcon },
      { href: "/admin/testimonials", label: "Testimonials", icon: ChatBubbleLeftRightIcon },
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
    title: "",
    items: [{ href: "/admin/theme", label: "Theme", icon: PaintBrushIcon }],
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
      <div className={`h-16 flex items-center border-b border-neutral-200 dark:border-neutral-800 ${collapsed ? "justify-center px-0" : "justify-between px-6"}`}>
        {!collapsed && <span className="font-semibold text-lg">Admin Panel</span>}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronDoubleRightIcon className="w-4 h-4" /> : <ChevronDoubleLeftIcon className="w-4 h-4" />}
        </button>
        <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 text-neutral-400">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_GROUPS.map((group, i) => (
          <div key={i}>
            {group.title && !collapsed && (
              <div className="px-3 mb-1 text-xs font-semibold uppercase text-neutral-400">
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
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      collapsed ? "justify-center" : ""
                    } ${
                      isActive(item.href)
                        ? "bg-primary-6000 text-white"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
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
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950">
      {/* Desktop sidebar */}
      <aside
        className={`flex-shrink-0 hidden md:flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-all duration-200 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 flex flex-col bg-white dark:bg-neutral-900 shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 -ml-1.5 text-neutral-500"
              aria-label="Open menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <Link href={"/" as any} className="text-sm text-neutral-500 hover:underline">
              ← View storefront
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {email && <span className="hidden sm:inline text-sm text-neutral-500">{email}</span>}
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
