"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
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

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ label: "Dashboard", href: "/admin", icon: HomeIcon }],
  },
  {
    title: "Catalog",
    items: [
      { label: "Products", href: "/admin/products", icon: ShoppingBagIcon },
      { label: "Categories", href: "/admin/categories", icon: TagIcon },
      { label: "Brands", href: "/admin/brands", icon: BuildingStorefrontIcon },
      { label: "Inventory", href: "/admin/inventory", icon: ArchiveBoxIcon },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Menus", href: "/admin/menus", icon: Bars3BottomLeftIcon },
      { label: "Pages", href: "/admin/pages", icon: DocumentTextIcon },
      { label: "FAQs", href: "/admin/faqs", icon: QuestionMarkCircleIcon },
      { label: "Reviews", href: "/admin/reviews", icon: StarIcon },
      { label: "Blog Posts", href: "/admin/blog-posts", icon: NewspaperIcon },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingCartIcon },
      { label: "Customers", href: "/admin/customers", icon: UsersIcon },
      { label: "Finance", href: "/admin/finance", icon: BanknotesIcon },
    ],
  },
  {
    title: "",
    items: [{ label: "Analytics", href: "/admin/analytics", icon: ChartBarIcon }],
  },
  {
    title: "Appearance",
    items: [
      { label: "Theme Catalog", href: "/admin/appearance/themes", icon: BuildingStorefrontIcon },
      { label: "Customize Storefront", href: "/admin/appearance/customize", icon: PaintBrushIcon },
      { label: "Popups & Modals", href: "/admin/appearance/popups", icon: MegaphoneIcon },
    ],
  },
  {
    title: "",
    items: [{ label: "Settings", href: "/admin/settings", icon: Cog6ToothIcon }],
  },
];

import { getAdminThemePreset } from "@/lib/theme/admin-theme-presets";

const COLLAPSE_STORAGE_KEY = "admin_sidebar_collapsed";

export default function AdminShell({
  email,
  adminTheme = "indigo",
  children,
}: {
  email?: string;
  adminTheme?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const preset = getAdminThemePreset(adminTheme);

  useEffect(() => {
    try {
      window.localStorage.removeItem("admin_sidebar_collapsed");
      window.localStorage.removeItem("admin:sidebarCollapsed");
    } catch { }
    setCollapsed(false);
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

  const normalizedPathname = (pathname || "").replace(/^\/store\/[^\/]+/, "") || "/admin";

  const isActive = (href: string) => {
    if (href === "/admin") {
      return normalizedPathname === "/admin";
    }
    return normalizedPathname.startsWith(href);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  const sidebarContent = (
    <>
      {/* Sidebar Top Brand Box - h-16 aligned with Header Bar */}
      <div className={`h-16 flex items-center border-b border-white/10 ${preset.sidebarBg} shrink-0 ${collapsed ? "px-2 justify-center" : "px-5 justify-between"}`}>
        {!collapsed ? (
          <div className="flex items-center">
            <span className="font-extrabold text-sm tracking-tight text-white block leading-none truncate">Store Admin</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span className="font-extrabold text-xs text-white">SA</span>
          </div>
        )}

        <button
          onClick={toggleCollapsed}
          className="hidden md:flex p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronDoubleRightIcon className="w-4 h-4" /> : <ChevronDoubleLeftIcon className="w-4 h-4" />}
        </button>
        <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 text-white/70 hover:text-white shrink-0">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Group Items with Curved Notch Cutout */}
      <nav className={`flex-1 overflow-y-auto py-4 pl-3 pr-0 space-y-5 ${preset.sidebarBg}`}>
        {NAV_GROUPS.map((group, i) => (
          <div key={i}>
            {group.title && !collapsed && (
              <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest font-mono text-slate-400 opacity-80">
                {group.title}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href as any}
                    title={collapsed ? item.label : undefined}
                    className={`relative flex items-center h-11 transition-colors group cursor-pointer ${collapsed ? "justify-center px-0" : "justify-between pl-4 pr-3"
                      }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="curvedActiveTab"
                        className="absolute inset-0 bg-[#f0f4fa] dark:bg-slate-950 rounded-l-2xl shadow-xs z-0"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      >
                        {/* Top Concave Curve Notch - Inward Curve */}
                        <div className="absolute -top-4 right-0 w-4 h-4 overflow-hidden pointer-events-none">
                          <svg viewBox="0 0 16 16" className="w-4 h-4 fill-[#f0f4fa] dark:fill-slate-950">
                            <path d="M 16 16 L 16 0 A 16 16 0 0 1 0 16 Z" />
                          </svg>
                        </div>

                        {/* Bottom Concave Curve Notch - Inward Curve */}
                        <div className="absolute -bottom-4 right-0 w-4 h-4 overflow-hidden pointer-events-none">
                          <svg viewBox="0 0 16 16" className="w-4 h-4 fill-[#f0f4fa] dark:fill-slate-950">
                            <path d="M 16 0 L 16 16 A 16 16 0 0 0 0 0 Z" />
                          </svg>
                        </div>
                      </motion.div>
                    )}

                    <div className={`relative z-10 flex items-center gap-3 min-w-0 ${collapsed ? "justify-center w-full" : ""
                      } ${active ? preset.activeTextColor : "text-slate-400 group-hover:text-white"
                      }`}>
                      <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${active ? "stroke-[2.5]" : "opacity-80"}`} />
                      {!collapsed && (
                        <span className="truncate text-xs font-extrabold tracking-tight">{item.label}</span>
                      )}
                    </div>
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
    <div className="h-screen w-screen flex overflow-hidden bg-[#f0f4fa] dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Desktop sidebar - Collapsible w-16 (Closed/Patla) vs w-60 (Open) - Border removed for seamless cutout */}
      <aside
        className={`h-screen flex-shrink-0 hidden md:flex flex-col ${preset.sidebarBg} transition-all duration-200 ${collapsed ? "w-16" : "w-60"
          }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <aside className={`absolute inset-y-0 left-0 w-60 flex flex-col ${preset.sidebarBg} shadow-2xl border-r border-slate-800`}>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Dynamic Theme Header Bar */}
        <header className={`h-16 flex items-center justify-between px-4 md:px-8 ${preset.headerGradient} text-white shadow-md z-20 shrink-0`}>
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
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
              {(() => {
                const tenantSlugMatch = pathname?.match(/\/store\/([^\/]+)/);
                const storefrontUrl = tenantSlugMatch ? `/store/${tenantSlugMatch[1]}` : "/";
                return (
                  <Link href={storefrontUrl as any} className="text-xs font-semibold text-white/90 hover:text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition-colors backdrop-blur-xs">
                    ← Storefront
                  </Link>
                );
              })()}
            </div>
          </div>

          {/* User Controls & Logout in Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
              {email ? email[0].toUpperCase() : "A"}
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-white/90 hover:text-white hover:underline ml-1"
            >
              Log out
            </button>
          </div>
        </header>

        {/* Dashboard Main View Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden relative flex flex-col min-h-0">{children}</main>
      </div>
    </div>
  );
}

