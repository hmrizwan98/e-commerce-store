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
  ArrowLeftIcon,
  Bars3Icon,
  EyeIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  SparklesIcon,
  PhotoIcon,
  GiftIcon,
  StarIcon,
  TagIcon,
  NewspaperIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import { saveCustomizerDraftAction, publishCustomizerAction, discardCustomizerDraftAction } from "./actions";
import ThemeTab from "./tabs/ThemeTab";
import ColorsTab from "./tabs/ColorsTab";
import TypographyTab from "./tabs/TypographyTab";
import ButtonsCardsTab from "./tabs/ButtonsCardsTab";
import LayoutTab from "./tabs/LayoutTab";
import PopupTab from "./tabs/PopupTab";
import HomepageTab from "./tabs/HomepageTab";
import NavigationTab from "./tabs/NavigationTab";
import ProductCardTab from "./tabs/ProductCardTab";
import ProductDetailTab from "./tabs/ProductDetailTab";
import CartTab from "./tabs/CartTab";
import ShopTab from "./tabs/ShopTab";
import AnnouncementBarInspector from "./inspectors/AnnouncementBarInspector";
import HeaderInspector from "./inspectors/HeaderInspector";
import HeroSectionInspector from "./inspectors/HeroSectionInspector";
import ProductGridSectionInspector from "./inspectors/ProductGridSectionInspector";
import CategoriesSectionInspector from "./inspectors/CategoriesSectionInspector";
import PromoSectionInspector from "./inspectors/PromoSectionInspector";
import FooterInspector from "./inspectors/FooterInspector";
import BlogSectionInspector from "./inspectors/BlogSectionInspector";
import HowItWorkSectionInspector from "./inspectors/HowItWorkSectionInspector";
import DiscoverMoreSectionInspector from "./inspectors/DiscoverMoreSectionInspector";
import SocialGallerySectionInspector from "./inspectors/SocialGallerySectionInspector";
import BrandsSectionInspector from "./inspectors/BrandsSectionInspector";
import NewsletterSectionInspector from "./inspectors/NewsletterSectionInspector";
import TestimonialsSectionInspector from "./inspectors/TestimonialsSectionInspector";
import GenericSectionInspector from "./inspectors/GenericSectionInspector";
import HomepageSections, { AddSectionModal, type PickerOption } from "../../homepage/HomepageSections";
import { SECTION_META } from "../../homepage/section-meta";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";
import type { HomepageSection, HomepageSectionType } from "@/types/homepage-section";
import type { NavItem } from "@/types/nav";
import type { LinkPickerOptions } from "../../menus/NavItemEditor";

export type GlobalSettingsTabKey =
  | "theme"
  | "colors"
  | "typography"
  | "buttonsCards"
  | "layout"
  | "shop"
  | "productCard"
  | "productDetail"
  | "cart"
  | "popup"
  | "navigation";

export type PreviewSurfaceKey = "home" | "collection" | "product" | "cart";

/**
 * Header/Homepage/Footer live in the "Page Sections" tree mode (left of this
 * file) rather than as flat tabs here, since they're inherently structural
 * (a live list of homepage sections to click into) - together with these
 * groups they cover the full Theme/Global/Header/Homepage/Shop/Product/
 * Cart/Footer information architecture.
 */
const GLOBAL_TAB_GROUPS: {
  groupName: string;
  tabs: { key: GlobalSettingsTabKey; label: string; icon: React.ComponentType<{ className?: string }>; savesImmediately?: boolean }[];
}[] = [
  {
    groupName: "Theme",
    tabs: [{ key: "theme", label: "Theme Preset", icon: PaintBrushIcon }],
  },
  {
    groupName: "Global",
    tabs: [
      { key: "colors", label: "Colors & Palette", icon: SwatchIcon },
      { key: "typography", label: "Typography & Fonts", icon: LanguageIcon },
      { key: "buttonsCards", label: "Buttons & Cards", icon: Square3Stack3DIcon },
      { key: "layout", label: "Layout & Container", icon: AdjustmentsHorizontalIcon },
    ],
  },
  {
    groupName: "Shop",
    tabs: [{ key: "shop", label: "Collection & Grid", icon: Squares2X2Icon }],
  },
  {
    groupName: "Product",
    tabs: [
      { key: "productCard", label: "Product Cards", icon: ViewColumnsIcon },
      { key: "productDetail", label: "Product Detail", icon: DocumentTextIcon },
    ],
  },
  {
    groupName: "Cart",
    tabs: [{ key: "cart", label: "Cart & Drawer", icon: ShoppingBagIcon }],
  },
  {
    groupName: "Navigation",
    tabs: [{ key: "navigation", label: "Navigation Menus", icon: Bars3BottomLeftIcon, savesImmediately: true }],
  },
  {
    groupName: "Popup",
    tabs: [{ key: "popup", label: "Promo Popup", icon: MegaphoneIcon }],
  },
];

const ALL_GLOBAL_TABS = GLOBAL_TAB_GROUPS.flatMap((g) => g.tabs);

const VIEWPORTS = {
  desktop: { label: "Desktop", width: 1440, icon: ComputerDesktopIcon },
  tablet: { label: "Tablet", width: 768, icon: DeviceTabletIcon },
  mobile: { label: "Mobile", width: 390, icon: DevicePhoneMobileIcon },
} as const;

type ViewportKey = keyof typeof VIEWPORTS;

const PREVIEW_SURFACES: { key: PreviewSurfaceKey; label: string }[] = [
  { key: "home", label: "Homepage" },
  { key: "collection", label: "Collection Page" },
  { key: "product", label: "Product Page" },
  { key: "cart", label: "Cart & Checkout" },
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
    blogOptions?: PickerOption[];
    brandOptions?: PickerOption[];
    testimonialOptions?: PickerOption[];
  };
  navigation: {
    headerItems: NavItem[];
    footerItems: NavItem[];
    options: LinkPickerOptions;
  };
}

export default function CustomizeShell({ initialDraft, homepage, navigation }: CustomizeShellProps) {
  const [editorMode, setEditorMode] = useState<"sections" | "global">("sections");
  const [activeGlobalTab, setActiveGlobalTab] = useState<GlobalSettingsTabKey>("theme");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

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

  const [sections, setSections] = useState<HomepageSection[]>(
    initialDraft.homepageSections ?? homepage.sections
  );
  const [addModalOpen, setAddModalOpen] = useState(false);

  const updateDraftSections = useCallback(
    (nextSections: HomepageSection[]) => {
      setSections(nextSections);
      updateDraft({ homepageSections: nextSections });
    },
    [updateDraft]
  );

  const handleAddSection = (type: HomepageSectionType) => {
    const meta = SECTION_META[type];
    const newSec: HomepageSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title: meta ? meta.label : type,
      order: sections.length,
      isActive: true,
      config: {},
    };
    const next = [...sections, newSec];
    updateDraftSections(next);
    setAddModalOpen(false);
    setSelectedSectionId(newSec.id);
    toast.success(`Added "${newSec.title}" section to draft.`);
  };

  const handleMoveSection = (index: number, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const next = [...sections];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    next.forEach((s, idx) => {
      s.order = idx;
    });
    updateDraftSections(next);
  };

  const handleToggleSectionActive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = sections.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    updateDraftSections(next);
  };

  const handleDeleteSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Remove this section from draft?")) return;
    const next = sections.filter((s) => s.id !== id).map((s, idx) => ({ ...s, order: idx }));
    updateDraftSections(next);
    if (selectedSectionId === id) setSelectedSectionId(null);
    toast.success("Section removed from draft.");
  };

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
        toast.success("Draft theme saved.");
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
        toast.error("Failed to save draft before reloading.");
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
        toast.success("Published theme live to your storefront!");
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
        toast.success("Draft discarded - reverted to published live theme.");
      } else {
        toast.error("Failed to discard draft.");
      }
    } finally {
      setSaving(false);
    }
  };

  const activeGlobalTabMeta = useMemo(
    () => ALL_GLOBAL_TABS.find((t) => t.key === activeGlobalTab)!,
    [activeGlobalTab]
  );

  const selectedHomepageSection = useMemo(
    () => sections.find((s) => s.id === selectedSectionId),
    [sections, selectedSectionId]
  );

  const updateSelectedSection = (patch: Partial<HomepageSection>) => {
    if (!selectedSectionId) return;
    const next = sections.map((s) => (s.id === selectedSectionId ? { ...s, ...patch } : s));
    updateDraftSections(next);
  };

  const renderSectionInspectorContent = () => {
    if (!selectedSectionId) return null;

    if (selectedSectionId === "announcement-bar") {
      return <AnnouncementBarInspector draft={draft} onChange={updateDraft} />;
    }
    if (selectedSectionId === "header") {
      return <HeaderInspector draft={draft} onChange={updateDraft} />;
    }
    if (selectedSectionId === "footer") {
      return <FooterInspector draft={draft} onChange={updateDraft} />;
    }

    if (selectedHomepageSection) {
      const type = selectedHomepageSection.type;
      if (type === "hero") {
        return <HeroSectionInspector draft={draft} onChange={updateDraft} />;
      }
      if (["featuredProducts", "newArrivals", "bestSellers", "onSale", "largeProductSlider", "featureItemsGrid"].includes(type)) {
        return (
          <ProductGridSectionInspector
            draft={draft}
            onChange={updateDraft}
            section={selectedHomepageSection}
            onChangeSection={updateSelectedSection}
            productOptions={homepage.productOptions}
            categoryOptions={homepage.categoryOptions}
          />
        );
      }
      if (type === "exploreGrid" || type === "collections") {
        return (
          <CategoriesSectionInspector
            draft={draft}
            onChange={updateDraft}
            section={selectedHomepageSection}
            onChangeSection={updateSelectedSection}
            categoryOptions={homepage.categoryOptions}
          />
        );
      }
      if (type === "promo") {
        return (
          <PromoSectionInspector
            draft={draft}
            onChange={updateDraft}
            section={selectedHomepageSection}
            onChangeSection={updateSelectedSection}
          />
        );
      }
      if (type === "blog") {
        return (
          <BlogSectionInspector
            section={selectedHomepageSection}
            onChange={updateSelectedSection}
            blogOptions={homepage.blogOptions}
          />
        );
      }
      if (type === "howItWork") {
        return <HowItWorkSectionInspector section={selectedHomepageSection} onChange={updateSelectedSection} />;
      }
      if (type === "discoverMore") {
        return <DiscoverMoreSectionInspector section={selectedHomepageSection} onChange={updateSelectedSection} />;
      }
      if (type === "socialGallery") {
        return <SocialGallerySectionInspector section={selectedHomepageSection} onChange={updateSelectedSection} />;
      }
      if (type === "brands") {
        return (
          <BrandsSectionInspector
            section={selectedHomepageSection}
            onChange={updateSelectedSection}
            brandOptions={homepage.brandOptions ?? []}
          />
        );
      }
      if (type === "newsletter") {
        return <NewsletterSectionInspector section={selectedHomepageSection} onChange={updateSelectedSection} />;
      }
      if (type === "testimonials") {
        return (
          <TestimonialsSectionInspector
            section={selectedHomepageSection}
            onChange={updateSelectedSection}
            testimonialOptions={homepage.testimonialOptions ?? []}
          />
        );
      }
      return <GenericSectionInspector section={selectedHomepageSection} onChange={updateSelectedSection} />;
    }

    return null;
  };

  return (
    <div className="space-y-4 font-sans text-slate-900 dark:text-slate-100">
      {/* Top Shopify-Style Editor Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            🎨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight">Theme Editor</h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                Preset: {draft.presetId}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {dirty ? (
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Unsaved draft changes
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">All edits saved in draft</span>
              )}
            </p>
          </div>
        </div>

        {/* Center Page & Viewport Switcher */}
        <div className="flex items-center gap-2">
          {/* Surface Page Selector */}
          <select
            value={previewSurface}
            onChange={(e) => setPreviewSurface(e.target.value as PreviewSurfaceKey)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-none"
          >
            {PREVIEW_SURFACES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Viewport switcher */}
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
                      ? "bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-slate-100"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          <button
            onClick={handleRefreshPreview}
            disabled={saving}
            title="Reload preview"
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <ButtonSecondary onClick={() => setConfirmDiscardOpen(true)} disabled={saving || !dirty} sizeClass="py-2 px-3 text-xs">
            Discard
          </ButtonSecondary>
          <ButtonSecondary onClick={handleSaveDraft} loading={saving} disabled={saving} sizeClass="py-2 px-4 text-xs font-semibold">
            Save Draft
          </ButtonSecondary>
          <ButtonPrimary onClick={handlePublish} loading={saving} disabled={saving} sizeClass="py-2 px-4 text-xs font-bold">
            Publish Live
          </ButtonPrimary>
        </div>
      </div>

      {/* Main 3-Panel Studio Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-4 items-start">
        {/* Left Navigation & Inspector Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col min-h-[640px]">
          {/* Top Panel Mode Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setEditorMode("sections");
                setSelectedSectionId(null);
              }}
              className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                editorMode === "sections"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <RectangleGroupIcon className="w-4 h-4" />
              Page Sections
            </button>
            <button
              onClick={() => {
                setEditorMode("global");
                setSelectedSectionId(null);
              }}
              className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                editorMode === "global"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <SwatchIcon className="w-4 h-4" />
              Global Settings
            </button>
          </div>

          {/* Mode 1: Sections & Tree View */}
          {editorMode === "sections" && (
            <div className="p-4 flex-1 flex flex-col space-y-4 overflow-y-auto max-h-[75vh]">
              {selectedSectionId ? (
                /* Contextual Section Inspector Header & Form */
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedSectionId(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to Page Structure
                  </button>
                  {renderSectionInspectorContent()}
                </div>
              ) : (
                /* Modular Sections Tree View */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Page Structure
                      </h3>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        Homepage Layout
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {homepage.sections.length + 3} Sections
                    </span>
                  </div>

                  {/* Section List */}
                  <div className="space-y-2">
                    {/* Fixed Announcement Bar */}
                    <div
                      onClick={() => setSelectedSectionId("announcement-bar")}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📢</span>
                        <div>
                          <span className="block text-xs font-bold">Announcement Bar</span>
                          <span className="block text-[11px] text-slate-500">Top offer message banner</span>
                        </div>
                      </div>
                      <span className="text-xs text-indigo-600 font-semibold">Inspect →</span>
                    </div>

                    {/* Fixed Header */}
                    <div
                      onClick={() => setSelectedSectionId("header")}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🧭</span>
                        <div>
                          <span className="block text-xs font-bold">Header &amp; Navigation</span>
                          <span className="block text-[11px] text-slate-500">Logo, menu &amp; header icons</span>
                        </div>
                      </div>
                      <span className="text-xs text-indigo-600 font-semibold">Inspect →</span>
                    </div>

                    {/* Dynamic Homepage Sections */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between px-1 pb-1">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          Modular Sections
                        </div>
                        <button
                          type="button"
                          onClick={() => setAddModalOpen(true)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                        >
                          <PlusIcon className="w-3.5 h-3.5" /> Add Section
                        </button>
                      </div>

                      {sections.map((sec, index) => {
                        const meta = SECTION_META[sec.type];
                        const isSelected = selectedSectionId === sec.id;
                        const isHidden = sec.isActive === false;

                        return (
                          <div
                            key={sec.id}
                            onClick={() => setSelectedSectionId(sec.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer group flex items-center justify-between ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs"
                                : isHidden
                                ? "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 opacity-60"
                                : "border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-white dark:bg-slate-900 shadow-2xs"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="flex flex-col gap-0.5 text-slate-400 opacity-60 group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={(e) => handleMoveSection(index, "up", e)}
                                  disabled={index === 0}
                                  className="hover:text-indigo-600 disabled:opacity-20"
                                  title="Move Up"
                                >
                                  <ChevronUpIcon className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleMoveSection(index, "down", e)}
                                  disabled={index === sections.length - 1}
                                  className="hover:text-indigo-600 disabled:opacity-20"
                                  title="Move Down"
                                >
                                  <ChevronDownIcon className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="text-base flex-shrink-0">{meta?.icon || "🧩"}</span>
                              <div className="truncate">
                                <span className="block text-xs font-bold truncate">{sec.title}</span>
                                <span className="block text-[10px] text-slate-400 uppercase font-mono truncate">{sec.type}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={(e) => handleToggleSectionActive(sec.id, e)}
                                className={`p-1 rounded-lg transition-colors ${
                                  isHidden
                                    ? "text-slate-400 hover:text-slate-600"
                                    : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                                }`}
                                title={isHidden ? "Hidden (Click to show)" : "Visible (Click to hide)"}
                              >
                                <EyeIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteSection(sec.id, e)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                title="Delete Section"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Fixed Footer */}
                    <div
                      onClick={() => setSelectedSectionId("footer")}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer transition-colors pt-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🦶</span>
                        <div>
                          <span className="block text-xs font-bold">Footer</span>
                          <span className="block text-[11px] text-slate-500">Columns, copyright &amp; payment icons</span>
                        </div>
                      </div>
                      <span className="text-xs text-indigo-600 font-semibold">Inspect →</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Global Settings */}
          {editorMode === "global" && (
            <div className="p-4 flex-1 flex flex-col space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Tab Navigation */}
              <div className="space-y-4">
                {GLOBAL_TAB_GROUPS.map((group) => (
                  <div key={group.groupName} className="space-y-1">
                    <h3 className="px-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      {group.groupName}
                    </h3>
                    {group.tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeGlobalTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setActiveGlobalTab(tab.key)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-xs"
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
              </div>

              {/* Inspector Content for Active Global Tab */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                {activeGlobalTab === "theme" && <ThemeTab draft={draft} onChange={updateDraft} />}
                {activeGlobalTab === "colors" && <ColorsTab draft={draft} onChange={updateDraft} />}
                {activeGlobalTab === "typography" && <TypographyTab draft={draft} onChange={updateDraft} />}
                {activeGlobalTab === "buttonsCards" && <ButtonsCardsTab draft={draft} onChange={updateDraft} />}
                {activeGlobalTab === "layout" && <LayoutTab draft={draft} onChange={updateDraft} />}
                {activeGlobalTab === "shop" && <ShopTab draft={draft} onChange={updateDraft} />}
                {activeGlobalTab === "productCard" && <ProductCardTab draft={draft} onChange={updateDraft} />}
                {activeGlobalTab === "productDetail" && <ProductDetailTab draft={draft} onChange={updateDraft} />}
                {activeGlobalTab === "cart" && <CartTab draft={draft} onChange={updateDraft} />}
                {activeGlobalTab === "popup" && <PopupTab draft={draft} onChange={updateDraft} />}
                {activeGlobalTab === "navigation" && <NavigationTab {...navigation} />}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Live Storefront Preview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 xl:sticky xl:top-20 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                Live Storefront Preview ({VIEWPORTS[viewport].label})
              </span>
            </div>

            <a
              href={`/admin/theme-customizer-preview?page=${previewSurface}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Open Full Screen ↗
            </a>
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
      <AddSectionModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddSection}
        busy={saving}
      />
    </div>
  );
}
