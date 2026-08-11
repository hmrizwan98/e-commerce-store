"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  PaintBrushIcon,
  SwatchIcon,
  LanguageIcon,
  Bars3BottomLeftIcon,
  RectangleGroupIcon,
  MegaphoneIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  DevicePhoneMobileIcon,
  ViewColumnsIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  Square3Stack3DIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import { saveCustomizerDraftAction, publishCustomizerAction, discardCustomizerDraftAction } from "./actions";
import ThemeTab from "./tabs/ThemeTab";
import ColorsTab from "./tabs/ColorsTab";
import TypographyTab from "./tabs/TypographyTab";
import ButtonsCardsTab from "./tabs/ButtonsCardsTab";
import LayoutTab from "./tabs/LayoutTab";
import HeaderTab from "./tabs/HeaderTab";
import FooterTab from "./tabs/FooterTab";
import PopupTab from "./tabs/PopupTab";
import HomepageTab from "./tabs/HomepageTab";
import NavigationTab from "./tabs/NavigationTab";
import ProductCardTab from "./tabs/ProductCardTab";
import ProductDetailTab from "./tabs/ProductDetailTab";
import CartTab from "./tabs/CartTab";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";
import type { HomepageSection } from "@/types/homepage-section";
import type { NavItem } from "@/types/nav";
import type { LinkPickerOptions } from "../../menus/NavItemEditor";
import type { PickerOption } from "../../homepage/HomepageSections";

export type CustomizeTabKey =
  | "theme"
  | "colors"
  | "typography"
  | "buttonsCards"
  | "layout"
  | "header"
  | "footer"
  | "popup"
  | "homepage"
  | "navigation"
  | "productCard"
  | "productDetail"
  | "cart";

export type PreviewSurfaceKey = "home" | "collection" | "product" | "cart";

const TAB_GROUPS: {
  groupName: string;
  tabs: { key: CustomizeTabKey; label: string; icon: React.ComponentType<{ className?: string }>; savesImmediately?: boolean }[];
}[] = [
  {
    groupName: "Global Styles",
    tabs: [
      { key: "theme", label: "Theme Preset", icon: PaintBrushIcon },
      { key: "colors", label: "Colors", icon: SwatchIcon },
      { key: "typography", label: "Typography", icon: LanguageIcon },
      { key: "buttonsCards", label: "Buttons & Cards", icon: Square3Stack3DIcon },
      { key: "layout", label: "Layout & Spacing", icon: AdjustmentsHorizontalIcon },
    ],
  },
  {
    groupName: "Header & Nav",
    tabs: [
      { key: "header", label: "Header", icon: Bars3BottomLeftIcon },
      { key: "navigation", label: "Navigation", icon: Squares2X2Icon, savesImmediately: true },
    ],
  },
  {
    groupName: "Store Pages",
    tabs: [
      { key: "homepage", label: "Homepage", icon: RectangleGroupIcon, savesImmediately: true },
      { key: "productCard", label: "Product Cards", icon: ViewColumnsIcon },
      { key: "productDetail", label: "Product Detail", icon: DocumentTextIcon },
      { key: "cart", label: "Cart & Drawer", icon: ShoppingBagIcon },
    ],
  },
  {
    groupName: "Footer & Popups",
    tabs: [
      { key: "footer", label: "Footer", icon: ListBulletIcon },
      { key: "popup", label: "Promo Popup", icon: MegaphoneIcon },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap((g) => g.tabs);

const VIEWPORTS = {
  desktop: { label: "Desktop", width: 1440, icon: ComputerDesktopIcon },
  tablet: { label: "Tablet", width: 768, icon: DeviceTabletIcon },
  mobile: { label: "Mobile", width: 390, icon: DevicePhoneMobileIcon },
} as const;

type ViewportKey = keyof typeof VIEWPORTS;

const PREVIEW_SURFACES: { key: PreviewSurfaceKey; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "collection", label: "Collection" },
  { key: "product", label: "Product" },
  { key: "cart", label: "Cart" },
];

function mergeDraft(prev: SystemThemeConfig, patch: Partial<SystemThemeConfig>): SystemThemeConfig {
  const next: any = { ...prev };
  for (const key of Object.keys(patch) as (keyof SystemThemeConfig)[]) {
    const value = (patch as any)[key];
    if (value && typeof value === "object" && !Array.isArray(value) && typeof (prev as any)[key] === "object") {
      next[key] = { ...(prev as any)[key], ...value };
    } else {
      next[key] = value;
    }
  }
  return next as SystemThemeConfig;
}

export interface CustomizeShellProps {
  initialDraft: SystemThemeConfig;
  homepage: {
    sections: HomepageSection[];
    categoryOptions: PickerOption[];
    productOptions: PickerOption[];
  };
  navigation: {
    headerItems: NavItem[];
    footerItems: NavItem[];
    options: LinkPickerOptions;
  };
}

export default function CustomizeShell({ initialDraft, homepage, navigation }: CustomizeShellProps) {
  const [activeTab, setActiveTab] = useState<CustomizeTabKey>("theme");
  const [draft, setDraft] = useState<SystemThemeConfig>(initialDraft);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewport, setViewport] = useState<ViewportKey>("desktop");
  const [previewSurface, setPreviewSurface] = useState<PreviewSurfaceKey>("home");
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updateDraft = useCallback((patch: Partial<SystemThemeConfig>) => {
    setDraft((prev) => mergeDraft(prev, patch));
    setDirty(true);
  }, []);

  const sendPreviewUpdate = useCallback((theme: SystemThemeConfig) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ type: "theme-preview-update", theme }, window.location.origin);
  }, []);

  useEffect(() => {
    if (!previewLoaded) return;
    const t = setTimeout(() => sendPreviewUpdate(draft), 150);
    return () => clearTimeout(t);
  }, [draft, previewLoaded, sendPreviewUpdate]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "theme-preview-ready") {
        setPreviewLoaded(true);
        sendPreviewUpdate(draft);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [draft, sendPreviewUpdate]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const res = await saveCustomizerDraftAction(draft);
      if (res.ok) {
        toast.success("Draft saved.");
        setDirty(false);
      } else {
        toast.error("Failed to save draft.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshPreview = async () => {
    setSaving(true);
    try {
      const res = await saveCustomizerDraftAction(draft);
      if (res.ok) {
        setDirty(false);
        setPreviewLoaded(false);
        setReloadKey((k) => k + 1);
      } else {
        toast.error("Failed to save draft before refreshing preview.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      const saveRes = await saveCustomizerDraftAction(draft);
      if (!saveRes.ok) {
        toast.error("Failed to save draft before publishing.");
        return;
      }
      const pubRes = await publishCustomizerAction();
      if (pubRes.ok) {
        toast.success("Published to the live storefront!");
        setDirty(false);
      } else {
        toast.error("Failed to publish.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardConfirmed = async () => {
    setSaving(true);
    setConfirmDiscardOpen(false);
    try {
      const res = await discardCustomizerDraftAction();
      if (res.ok) {
        setDraft(res.config);
        setDirty(false);
        toast.success("Draft discarded - reverted to the published theme.");
      } else {
        toast.error("Failed to discard draft.");
      }
    } finally {
      setSaving(false);
    }
  };

  const activeTabMeta = useMemo(() => ALL_TABS.find((t) => t.key === activeTab)!, [activeTab]);

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sticky top-0 z-10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Theme Studio</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Preset: {draft.presetId}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {dirty ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Unsaved changes in draft
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">All draft changes saved</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ButtonSecondary onClick={() => setConfirmDiscardOpen(true)} disabled={saving || !dirty}>
            Discard Edits
          </ButtonSecondary>
          <ButtonSecondary onClick={handleSaveDraft} loading={saving} disabled={saving}>
            Save Draft
          </ButtonSecondary>
          <ButtonPrimary onClick={handlePublish} loading={saving} disabled={saving}>
            Publish Live
          </ButtonPrimary>
        </div>
      </div>

      {/* Main Studio grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr_minmax(380px,500px)] gap-4 items-start">
        {/* Sidebar navigation */}
        <nav className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-4">
          {TAB_GROUPS.map((group) => (
            <div key={group.groupName} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.groupName}
              </h3>
              {group.tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-primary-6000 text-white shadow-sm"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Inspector panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 min-h-[440px]">
          {activeTabMeta.savesImmediately && (
            <div className="mb-6 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
              Changes in this tab save immediately to the live database independent of the Save Draft / Publish toolbar above.
            </div>
          )}
          {activeTab === "theme" && <ThemeTab draft={draft} onChange={updateDraft} />}
          {activeTab === "colors" && <ColorsTab draft={draft} onChange={updateDraft} />}
          {activeTab === "typography" && <TypographyTab draft={draft} onChange={updateDraft} />}
          {activeTab === "buttonsCards" && <ButtonsCardsTab draft={draft} onChange={updateDraft} />}
          {activeTab === "layout" && <LayoutTab draft={draft} onChange={updateDraft} />}
          {activeTab === "header" && <HeaderTab draft={draft} onChange={updateDraft} />}
          {activeTab === "footer" && <FooterTab draft={draft} onChange={updateDraft} />}
          {activeTab === "productCard" && <ProductCardTab draft={draft} onChange={updateDraft} />}
          {activeTab === "productDetail" && <ProductDetailTab draft={draft} onChange={updateDraft} />}
          {activeTab === "cart" && <CartTab draft={draft} onChange={updateDraft} />}
          {activeTab === "popup" && <PopupTab draft={draft} onChange={updateDraft} />}
          {activeTab === "homepage" && <HomepageTab {...homepage} />}
          {activeTab === "navigation" && <NavigationTab {...navigation} />}
        </div>

        {/* Live Storefront Preview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 xl:sticky xl:top-24">
          <div className="flex flex-col gap-2">
            {/* Viewport and page controls */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {(Object.keys(VIEWPORTS) as ViewportKey[]).map((key) => {
                  const v = VIEWPORTS[key];
                  const Icon = v.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setViewport(key)}
                      title={v.label}
                      className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                        viewport === key
                          ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>

              {/* Surface switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {PREVIEW_SURFACES.map((surf) => (
                  <button
                    key={surf.key}
                    onClick={() => setPreviewSurface(surf.key)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      previewSurface === surf.key
                        ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    {surf.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRefreshPreview}
                disabled={saving}
                title="Save draft and reload preview (required for structural component/variant updates)"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex justify-center" style={{ maxHeight: "75vh" }}>
            <div style={{ width: VIEWPORTS[viewport].width, maxWidth: "100%" }}>
              <iframe
                key={`${reloadKey}-${previewSurface}`}
                ref={iframeRef}
                src={`/admin/theme-customizer-preview?page=${previewSurface}`}
                title="Live Storefront Preview"
                style={{ width: VIEWPORTS[viewport].width, height: "75vh", border: "none", background: "white" }}
                onLoad={() => sendPreviewUpdate(draft)}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Colors, typography &amp; tokens update live in real-time. Component variants refresh automatically on Save/Reload.
          </p>
        </div>
      </div>

      {/* Confirmation modal for Discard */}
      {confirmDiscardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Discard Unsaved Draft Changes?</h3>
            <p className="text-sm text-slate-500">
              This will restore your draft configuration back to the currently published live storefront theme. Any unsaved edits will be lost.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <ButtonSecondary onClick={() => setConfirmDiscardOpen(false)}>Cancel</ButtonSecondary>
              <ButtonPrimary onClick={handleDiscardConfirmed} loading={saving}>
                Yes, Discard Draft
              </ButtonPrimary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
