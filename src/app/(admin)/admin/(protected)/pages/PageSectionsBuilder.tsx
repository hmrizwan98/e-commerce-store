"use client";

import React, { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Transition } from "@/app/headlessui";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  Bars3Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  createPageSection,
  updatePageSections,
  deletePageSection,
  reorderPageSections,
} from "./actions";
import { PAGE_SECTION_META, PAGE_SECTION_TYPES } from "./page-section-meta";
import type { PageSection, PageSectionType } from "@/types/page-section";

const inputClass =
  "px-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";

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

const AddSectionModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onAdd: (type: PageSectionType) => void;
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
              {PAGE_SECTION_TYPES.map((type) => {
                const meta = PAGE_SECTION_META[type];
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
  pageId: string;
  section: PageSection;
  isDirty: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
  onChange: (patch: Partial<PageSection>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUploadingChange: (uploading: boolean) => void;
  dragHandleProps: {
    draggable: boolean;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
    onDragEnd: () => void;
  };
  isDragging: boolean;
}> = ({
  pageId,
  section,
  isDirty,
  expanded,
  onToggleExpanded,
  onChange,
  onDuplicate,
  onDelete,
  onUploadingChange,
  dragHandleProps,
  isDragging,
}) => {
  const meta = PAGE_SECTION_META[section.type];

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
          {!!meta.fields.length && (
            <button
              title={expanded ? "Collapse settings" : "Expand settings"}
              onClick={onToggleExpanded}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              {expanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {expanded && !!meta.fields.length && (
        <div className="px-4 pb-4 pl-[4.75rem] grid grid-cols-1 sm:grid-cols-2 gap-3">
          {meta.fields.includes("heading") && (
            <input
              placeholder="Heading"
              className={inputClass}
              value={section.config.heading ?? ""}
              onChange={(e) => onChange({ config: { ...section.config, heading: e.target.value } })}
            />
          )}
          {meta.fields.includes("subHeading") && (
            <input
              placeholder="Sub-heading"
              className={inputClass}
              value={section.config.subHeading ?? ""}
              onChange={(e) => onChange({ config: { ...section.config, subHeading: e.target.value } })}
            />
          )}
          {meta.fields.includes("image") && (
            <div className="sm:col-span-2">
              <ImageUploader
                value={section.config.image ? [section.config.image] : []}
                onChange={(urls) => onChange({ config: { ...section.config, image: urls[0] } })}
                imageType="page"
                subfolder={pageId}
                multiple={false}
                label="Image"
                onUploadingChange={onUploadingChange}
              />
            </div>
          )}
          {meta.fields.includes("imagePosition") && (
            <select
              className={inputClass}
              value={section.config.imagePosition ?? "left"}
              onChange={(e) => onChange({ config: { ...section.config, imagePosition: e.target.value as "left" | "right" } })}
            >
              <option value="left">Image on left</option>
              <option value="right">Image on right</option>
            </select>
          )}
          {meta.fields.includes("buttonText") && (
            <input
              placeholder="Button text"
              className={inputClass}
              value={section.config.buttonText ?? ""}
              onChange={(e) => onChange({ config: { ...section.config, buttonText: e.target.value } })}
            />
          )}
          {meta.fields.includes("buttonHref") && (
            <input
              placeholder="Button link"
              className={inputClass}
              value={section.config.buttonHref ?? ""}
              onChange={(e) => onChange({ config: { ...section.config, buttonHref: e.target.value } })}
            />
          )}
          {meta.fields.includes("limit") && (
            <input
              placeholder="Item limit"
              type="number"
              className={inputClass}
              value={section.config.limit ?? ""}
              onChange={(e) => onChange({ config: { ...section.config, limit: Number(e.target.value) || undefined } })}
            />
          )}
          {meta.fields.includes("body") && (
            <textarea
              placeholder="Body (HTML allowed)"
              rows={4}
              className={`${inputClass} sm:col-span-2`}
              value={section.config.body ?? ""}
              onChange={(e) => onChange({ config: { ...section.config, body: e.target.value } })}
            />
          )}
        </div>
      )}
    </div>
  );
};

function snapshotKey(s: PageSection): string {
  return JSON.stringify({ title: s.title, isActive: s.isActive, config: s.config });
}

const PageSectionsBuilder: React.FC<{ pageId: string; sections: PageSection[] }> = ({ pageId, sections: initial }) => {
  const router = useRouter();
  const [sections, setSections] = useState(initial);
  const [savedSections, setSavedSections] = useState(initial);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const setUploadingId = (id: string, uploading: boolean) => {
    setUploadingIds((prev) => {
      const next = new Set(prev);
      if (uploading) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const isUploadingImages = uploadingIds.size > 0;

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

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdd = async (type: PageSectionType) => {
    setBusy(true);
    try {
      const title = PAGE_SECTION_META[type].label;
      const order = sections.length;
      const id = await createPageSection(pageId, type, title, order);
      const newSection: PageSection = { id, type, title, order, isActive: true, config: {} };
      setSections((prev) => [...prev, newSection]);
      setSavedSections((prev) => [...prev, newSection]);
      setModalOpen(false);
      setExpandedIds((prev) => new Set(prev).add(id));
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleDuplicate = async (section: PageSection) => {
    setBusy(true);
    try {
      const title = `${section.title} (copy)`;
      const order = sections.length;
      const id = await createPageSection(pageId, section.type, title, order, section.config);
      const newSection: PageSection = { id, type: section.type, title, order, isActive: true, config: section.config };
      setSections((prev) => [...prev, newSection]);
      setSavedSections((prev) => [...prev, newSection]);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleChange = (id: string, patch: Partial<PageSection>) => {
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
      await updatePageSections(pageId, patches);
      setSavedSections(sections);
      setJustSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setSections(savedSections);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this section?")) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
    setSavedSections((prev) => prev.filter((s) => s.id !== id));
    await deletePageSection(pageId, id);
    router.refresh();
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
    await reorderPageSections(pageId, next.map((s) => s.id));
    router.refresh();
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = sections.findIndex((s) => s.id === dragId);
    const to = sections.findIndex((s) => s.id === targetId);
    moveByIndex(from, to);
    setDragId(null);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Page sections</h2>
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
            pageId={pageId}
            section={section}
            isDirty={dirtyIds.has(section.id)}
            expanded={expandedIds.has(section.id)}
            onToggleExpanded={() => toggleExpanded(section.id)}
            onChange={(patch) => handleChange(section.id, patch)}
            onDuplicate={() => handleDuplicate(section)}
            onDelete={() => handleDelete(section.id)}
            onUploadingChange={(u) => setUploadingId(section.id, u)}
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
          <div className="text-center py-10 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl">
            <p className="text-sm text-neutral-500">
              No sections yet - this page will render its plain content below until you add some.
            </p>
          </div>
        )}
      </div>

      <AddSectionModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} busy={busy} />

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
              disabled={!isDirty || saving || isUploadingImages}
              className="px-5 py-2 text-sm rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
            >
              {isUploadingImages ? "Uploading image…" : saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageSectionsBuilder;
