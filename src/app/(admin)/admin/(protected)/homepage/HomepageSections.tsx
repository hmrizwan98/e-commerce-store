"use client";

import React, { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Transition } from "@/app/headlessui";
import {
  Bars3Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  createHomepageSection,
  updateHomepageSections,
  deleteHomepageSection,
  reorderHomepageSections,
} from "./actions";
import { SECTION_META, SECTION_TYPES } from "./section-meta";
import TileListEditor from "@/components/admin/TileListEditor";
import type { HomepageSection, HomepageSectionType, HomepageTile } from "@/types/homepage-section";

const inputClass =
  "px-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";

export interface PickerOption {
  id: string;
  name: string;
}

/** Types whose config is entirely managed on a dedicated admin page - no generic heading/limit fields apply. */
const EXTERNAL_CONTENT_LINK: Partial<Record<HomepageSectionType, { label: string; href: string }>> = {
  hero: { label: "Manage slides at Content -> Hero Slides", href: "/admin/hero-slides" },
  promo: { label: "Manage banner content at Content -> Promo Banners", href: "/admin/promo-banners" },
  testimonials: { label: "Manage reviews at Content -> Testimonials", href: "/admin/testimonials" },
  blog: { label: "Manage posts at Content -> Blog Posts", href: "/admin/blog-posts" },
  brands: { label: "Manage brands at Content -> Brands", href: "/admin/brands" },
};

/** Types with no generic heading/sub-heading/limit fields at all (fully external, e.g. hero pulls by placement). */
const NO_GENERIC_FIELDS: HomepageSectionType[] = ["hero", "testimonials"];

const PRODUCT_MODE_TYPES: HomepageSectionType[] = [
  "featuredProducts",
  "newArrivals",
  "bestSellers",
  "onSale",
  "largeProductSlider",
  "featureItemsGrid",
];

/** Only the SectionSliderProductCard-based types actually render a "view all" button. */
const PRODUCT_VIEWALL_TYPES: HomepageSectionType[] = ["featuredProducts", "newArrivals", "bestSellers", "onSale"];

const CATEGORY_MODE_TYPES: HomepageSectionType[] = ["exploreGrid", "collections"];

const TILE_TYPES: Partial<Record<HomepageSectionType, { showIcon?: boolean; showSubtitle?: boolean; maxItems?: number }>> = {
  discoverMore: { showSubtitle: true, maxItems: 6 },
  howItWork: { showIcon: true, showSubtitle: true, maxItems: 6 },
  socialGallery: { maxItems: 12 },
};

function PickerList({
  options,
  selectedIds,
  onToggle,
}: {
  options: PickerOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="sm:col-span-3 max-h-40 overflow-y-auto space-y-1.5 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3">
      {options.length ? (
        options.map((opt) => (
          <label key={opt.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedIds.includes(opt.id)}
              onChange={() => onToggle(opt.id)}
            />
            {opt.name}
          </label>
        ))
      ) : (
        <p className="text-xs text-neutral-500">Nothing to pick from yet.</p>
      )}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
        active
          ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
          : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
      }`}
    >
      {active ? "Enabled" : "Disabled"}
    </span>
  );
}

/** Managed on their own dedicated admin pages, not as reorderable homepage-builder sections. */
const EXTERNAL_SECTIONS = [
  {
    icon: "📢",
    label: "Announcement Bar",
    description: "Scrolling or fixed top-of-site message, with scheduling.",
    href: "/admin/announcements",
    accent: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  },
  {
    icon: "💬",
    label: "WhatsApp Floating Button",
    description: "Floating support button, bottom-right on every page.",
    href: "/admin/settings",
    accent: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  },
];

const AddSectionModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onAdd: (type: HomepageSectionType) => void;
  busy: boolean;
}> = ({ open, onClose, onAdd, busy }) => (
  <Transition appear show={open} as={Fragment}>
    <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
      </Transition.Child>

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900">
              <Dialog.Title className="text-lg font-semibold">Add a section</Dialog.Title>
              <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-3">
              {SECTION_TYPES.map((type) => {
                const meta = SECTION_META[type];
                return (
                  <button
                    key={type}
                    disabled={busy}
                    onClick={() => onAdd(type)}
                    className="flex items-start gap-3 text-left p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 hover:shadow-sm transition disabled:opacity-50"
                  >
                    <span className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg ${meta.accent}`}>
                      {meta.icon}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{meta.label}</span>
                      <span className="block text-xs text-neutral-500 mt-0.5">{meta.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
);

const SectionCard: React.FC<{
  section: HomepageSection;
  isDirty: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
  onChange: (patch: Partial<HomepageSection>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  categoryOptions: PickerOption[];
  productOptions: PickerOption[];
  dragHandleProps: {
    draggable: boolean;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
    onDragEnd: () => void;
  };
  isDragging: boolean;
}> = ({
  section,
  isDirty,
  expanded,
  onToggleExpanded,
  onChange,
  onDuplicate,
  onDelete,
  categoryOptions,
  productOptions,
  dragHandleProps,
  isDragging,
}) => {
  const meta = SECTION_META[section.type];
  const config = section.config;
  const setConfig = (patch: Partial<HomepageSection["config"]>) => onChange({ config: { ...config, ...patch } });
  const externalLink = EXTERNAL_CONTENT_LINK[section.type];
  const hasGenericFields = !NO_GENERIC_FIELDS.includes(section.type);
  const isProductMode = PRODUCT_MODE_TYPES.includes(section.type);
  const isCategoryMode = CATEGORY_MODE_TYPES.includes(section.type);
  const tileConfig = TILE_TYPES[section.type];
  const mode = config.mode ?? "auto";

  const toggleId = (list: string[] | undefined, id: string) =>
    (list ?? []).includes(id) ? (list ?? []).filter((x) => x !== id) : [...(list ?? []), id];

  return (
    <div
      {...dragHandleProps}
      className={`bg-white dark:bg-neutral-900 border border-l-4 ${meta.border} ${
        isDirty ? "border-y-amber-300 border-r-amber-300 dark:border-y-amber-700 dark:border-r-amber-700" : "border-neutral-200 dark:border-neutral-800"
      } rounded-2xl transition ${isDragging ? "opacity-40" : ""}`}
    >
      <div className="flex items-start gap-3 p-4">
        <span className="cursor-grab active:cursor-grabbing text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 mt-1.5">
          <Bars3Icon className="w-5 h-5" />
        </span>
        <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${meta.accent}`}>
          {meta.icon}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="flex-1 min-w-[160px] px-2 py-1 text-sm font-semibold rounded-md border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-neutral-300 dark:focus:border-neutral-700 bg-transparent"
              value={section.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
            <StatusBadge active={section.isActive} />
            {isDirty && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                ● Unsaved
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">{meta.description}</p>
          {!!meta.contains.length && (
            <p className="text-xs text-neutral-400 mt-1">Contains: {meta.contains.join(" • ")}</p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <label className="flex items-center gap-1.5 text-xs mr-1">
            <input
              type="checkbox"
              checked={section.isActive}
              onChange={(e) => onChange({ isActive: e.target.checked })}
            />
            Active
          </label>
          <button
            title="Duplicate"
            onClick={onDuplicate}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
          </button>
          <button
            title="Delete"
            onClick={onDelete}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
          <button
            title={expanded ? "Collapse settings" : "Expand settings"}
            onClick={onToggleExpanded}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            {expanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pl-[4.75rem] space-y-3">
          {externalLink && (
            <a
              href={externalLink.href}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-6000 hover:underline"
            >
              {externalLink.label} →
            </a>
          )}

          {hasGenericFields && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                placeholder="Heading"
                className={inputClass}
                value={config.heading ?? ""}
                onChange={(e) => setConfig({ heading: e.target.value })}
              />
              <input
                placeholder="Sub-heading"
                className={inputClass}
                value={config.subHeading ?? ""}
                onChange={(e) => setConfig({ subHeading: e.target.value })}
              />
              <input
                placeholder="Item limit"
                type="number"
                className={inputClass}
                value={config.limit ?? ""}
                onChange={(e) => setConfig({ limit: Number(e.target.value) || undefined })}
              />
            </div>
          )}

          {section.type === "promo" && (
            <select
              className={inputClass}
              value={config.variant ?? 1}
              onChange={(e) => setConfig({ variant: Number(e.target.value) as 1 | 2 | 3 })}
            >
              <option value={1}>Layout 1 (Promo Banner 1)</option>
              <option value={2}>Layout 2 (Promo Banner 2)</option>
              <option value={3}>Layout 3 (Promo Banner 3)</option>
            </select>
          )}

          {(isProductMode || isCategoryMode) && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    checked={mode === "auto"}
                    onChange={() => setConfig({ mode: "auto" })}
                  />
                  Auto
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    checked={mode === "manual"}
                    onChange={() => setConfig({ mode: "manual" })}
                  />
                  Manual selection
                </label>
              </div>

              {mode === "manual" && isProductMode && (
                <PickerList
                  options={productOptions}
                  selectedIds={config.productIds ?? []}
                  onToggle={(id) => setConfig({ productIds: toggleId(config.productIds, id) })}
                />
              )}
              {mode === "manual" && isCategoryMode && (
                <PickerList
                  options={categoryOptions}
                  selectedIds={config.categoryIds ?? []}
                  onToggle={(id) => setConfig({ categoryIds: toggleId(config.categoryIds, id) })}
                />
              )}

              {PRODUCT_VIEWALL_TYPES.includes(section.type) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    placeholder="View all button text"
                    className={inputClass}
                    value={config.viewAllText ?? ""}
                    onChange={(e) => setConfig({ viewAllText: e.target.value })}
                  />
                  <input
                    placeholder="View all button link"
                    className={inputClass}
                    value={config.viewAllHref ?? ""}
                    onChange={(e) => setConfig({ viewAllHref: e.target.value })}
                  />
                </div>
              )}

              {isCategoryMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {section.type === "exploreGrid" && (
                    <input
                      placeholder="Columns"
                      type="number"
                      min={2}
                      max={6}
                      className={inputClass}
                      value={config.columns ?? ""}
                      onChange={(e) => setConfig({ columns: Number(e.target.value) || undefined })}
                    />
                  )}
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={config.showProductCount ?? false}
                      onChange={(e) => setConfig({ showProductCount: e.target.checked })}
                    />
                    Show product count
                  </label>
                </div>
              )}
            </div>
          )}

          {tileConfig && (
            <TileListEditor
              items={config.items ?? []}
              onChange={(items: HomepageTile[]) => setConfig({ items })}
              showIcon={tileConfig.showIcon}
              showSubtitle={tileConfig.showSubtitle}
              maxItems={tileConfig.maxItems}
            />
          )}
        </div>
      )}
    </div>
  );
};

function snapshotKey(s: HomepageSection): string {
  return JSON.stringify({ title: s.title, isActive: s.isActive, config: s.config });
}

const HomepageSections: React.FC<{
  sections: HomepageSection[];
  categoryOptions: PickerOption[];
  productOptions: PickerOption[];
}> = ({ sections: initial, categoryOptions, productOptions }) => {
  const router = useRouter();
  const [sections, setSections] = useState(initial);
  const [savedSections, setSavedSections] = useState(initial);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const savedById = useMemo(() => new Map(savedSections.map((s) => [s.id, s])), [savedSections]);
  const dirtyIds = useMemo(() => {
    const ids = new Set<string>();
    for (const s of sections) {
      const saved = savedById.get(s.id);
      if (!saved || snapshotKey(saved) !== snapshotKey(s)) ids.add(s.id);
    }
    return ids;
  }, [sections, savedById]);
  const isDirty = dirtyIds.size > 0;

  const refresh = () => router.refresh();

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdd = async (type: HomepageSectionType) => {
    setBusy(true);
    try {
      const title = SECTION_META[type].label;
      const order = sections.length;
      const id = await createHomepageSection(type, title, order);
      const newSection: HomepageSection = { id, type, title, order, isActive: true, config: {} };
      setSections((prev) => [...prev, newSection]);
      setSavedSections((prev) => [...prev, newSection]);
      setModalOpen(false);
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleDuplicate = async (section: HomepageSection) => {
    setBusy(true);
    try {
      const title = `${section.title} (copy)`;
      const order = sections.length;
      const id = await createHomepageSection(section.type, title, order, section.config);
      const newSection: HomepageSection = { id, type: section.type, title, order, isActive: true, config: section.config };
      setSections((prev) => [...prev, newSection]);
      setSavedSections((prev) => [...prev, newSection]);
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleChange = (id: string, patch: Partial<HomepageSection>) => {
    setJustSaved(false);
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const handleSaveAll = async () => {
    const patches = sections
      .filter((s) => dirtyIds.has(s.id))
      .map((s) => ({ id: s.id, patch: { title: s.title, isActive: s.isActive, config: s.config } }));
    if (!patches.length) return;
    setSaving(true);
    try {
      await updateHomepageSections(patches);
      setSavedSections(sections);
      setJustSaved(true);
      refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setSections(savedSections);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this homepage section?")) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
    setSavedSections((prev) => prev.filter((s) => s.id !== id));
    await deleteHomepageSection(id);
    refresh();
  };

  const moveByIndex = async (from: number, to: number) => {
    if (to < 0 || to >= sections.length || from === to) return;
    const next = sections.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setSections(next);
    setSavedSections((prevSaved) => {
      const savedNext = prevSaved.slice();
      const savedMovedIndex = savedNext.findIndex((s) => s.id === moved.id);
      if (savedMovedIndex === -1) return prevSaved;
      const [savedMoved] = savedNext.splice(savedMovedIndex, 1);
      savedNext.splice(to, 0, savedMoved);
      return savedNext;
    });
    await reorderHomepageSections(next.map((s) => s.id));
    refresh();
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = sections.findIndex((s) => s.id === dragId);
    const to = sections.findIndex((s) => s.id === targetId);
    moveByIndex(from, to);
    setDragId(null);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:underline"
        >
          <EyeIcon className="w-4 h-4" /> Preview storefront
        </a>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 text-sm rounded-full bg-primary-6000 text-white font-medium"
        >
          + Add section
        </button>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            isDirty={dirtyIds.has(section.id)}
            expanded={expandedIds.has(section.id)}
            onToggleExpanded={() => toggleExpanded(section.id)}
            onChange={(patch) => handleChange(section.id, patch)}
            onDuplicate={() => handleDuplicate(section)}
            onDelete={() => handleDelete(section.id)}
            categoryOptions={categoryOptions}
            productOptions={productOptions}
            isDragging={dragId === section.id}
            dragHandleProps={{
              draggable: true,
              onDragStart: () => setDragId(section.id),
              onDragOver: (e) => e.preventDefault(),
              onDrop: () => handleDrop(section.id),
              onDragEnd: () => setDragId(null),
            }}
          />
        ))}
        {!sections.length && (
          <div className="text-center py-12 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl">
            <p className="text-sm text-neutral-500">No homepage sections yet.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-3 px-4 py-2 text-sm rounded-full bg-primary-6000 text-white font-medium"
            >
              + Add your first section
            </button>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
          Managed on their own pages
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {EXTERNAL_SECTIONS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-start gap-3 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 transition"
            >
              <span className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg ${item.accent}`}>
                {item.icon}
              </span>
              <span>
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="block text-xs text-neutral-500 mt-0.5">{item.description}</span>
              </span>
            </a>
          ))}
        </div>
      </div>

      <AddSectionModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} busy={busy} />

      {/* Sticky save bar - field-level edits (title/active/heading/etc.) are local until you click Save. */}
      {(isDirty || justSaved) && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-30 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur px-6 py-3 flex items-center justify-between gap-4">
          {isDirty ? (
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              ● Unsaved changes ({dirtyIds.size})
            </span>
          ) : (
            <span className="text-sm font-medium text-green-600 dark:text-green-400">✔ All changes saved.</span>
          )}
          <div className="flex items-center gap-3">
            {isDirty && (
              <button
                onClick={handleDiscard}
                disabled={saving}
                className="px-4 py-2 text-sm rounded-full border border-neutral-300 dark:border-neutral-700 disabled:opacity-50"
              >
                Discard
              </button>
            )}
            <button
              onClick={handleSaveAll}
              disabled={!isDirty || saving}
              className="px-5 py-2 text-sm rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomepageSections;
