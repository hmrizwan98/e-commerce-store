"use client";

import React, { useEffect, useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import type { ImageType } from "@/lib/images/presets";
import type { HomepageTile } from "@/types/homepage-section";
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@heroicons/react/24/outline";

export interface TileListEditorProps {
  items: HomepageTile[];
  onChange: (items: HomepageTile[]) => void;
  imageType?: ImageType;
  showIcon?: boolean;
  showSubtitle?: boolean;
  showBadge?: boolean;
  showColor?: boolean;
  showButtonConfig?: boolean;
  maxItems?: number;
  onUploadingChange?: (uploading: boolean) => void;
}

const inputClass =
  "w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";

function createTile(): HomepageTile {
  return {
    id: `tile-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    isActive: true,
    showButton: true,
    buttonText: "Show me all",
    color: "auto",
  };
}

const TileListEditor: React.FC<TileListEditorProps> = ({
  items,
  onChange,
  imageType = "homepage",
  showIcon = false,
  showSubtitle = false,
  showBadge = false,
  showColor = false,
  showButtonConfig = false,
  maxItems,
  onUploadingChange,
}) => {
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const anyUploading = uploadingIds.size > 0;

  useEffect(() => {
    onUploadingChange?.(anyUploading);
  }, [anyUploading, onUploadingChange]);

  const setUploadingId = (id: string, uploading: boolean) => {
    setUploadingIds((prev) => {
      const next = new Set(prev);
      if (uploading) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const updateTile = (id: string, patch: Partial<HomepageTile>) => {
    onChange(items.map((tile) => (tile.id === id ? { ...tile, ...patch } : tile)));
  };

  const removeTile = (id: string) => {
    onChange(items.filter((tile) => tile.id !== id));
  };

  const moveTile = (index: number, direction: -1 | 1) => {
    const to = index + direction;
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    const [moved] = next.splice(index, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const addTile = () => {
    if (maxItems && items.length >= maxItems) return;
    onChange([...items, createTile()]);
  };

  const canAdd = !maxItems || items.length < maxItems;

  return (
    <div className="space-y-3">
      {items.map((tile, index) => (
        <div
          key={tile.id}
          className={`rounded-xl border p-3 space-y-3 transition-colors ${
            tile.isActive !== false
              ? "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50"
              : "border-amber-300 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 opacity-70"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                Item {index + 1}
              </span>
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-neutral-600 dark:text-neutral-400">
                <input
                  type="checkbox"
                  checked={tile.isActive !== false}
                  onChange={(e) => updateTile(tile.id, { isActive: e.target.checked })}
                  className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <span>{tile.isActive !== false ? "Active" : "Hidden"}</span>
              </label>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Move up"
                onClick={() => moveTile(index, -1)}
                disabled={index === 0}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 disabled:opacity-30"
              >
                <ChevronUpIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Move down"
                onClick={() => moveTile(index, 1)}
                disabled={index === items.length - 1}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 disabled:opacity-30"
              >
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Remove tile"
                onClick={() => removeTile(tile.id)}
                className="p-1 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ImageUploader
            value={tile.image ? [tile.image] : []}
            onChange={(urls) => updateTile(tile.id, { image: urls[0] })}
            imageType={imageType}
            multiple={false}
            label="Image"
            onUploadingChange={(uploading) => setUploadingId(tile.id, uploading)}
          />

          {showBadge && (
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                Badge / Step Text (e.g. &quot;Step 1&quot; - leave empty to hide badge)
              </label>
              <input
                placeholder='e.g. "Step 1" or "01"'
                className={inputClass}
                value={tile.badge ?? ""}
                onChange={(e) => updateTile(tile.id, { badge: e.target.value })}
              />
            </div>
          )}

          {showIcon && (
            <input
              placeholder="Icon (emoji)"
              className={inputClass}
              value={tile.icon ?? ""}
              onChange={(e) => updateTile(tile.id, { icon: e.target.value })}
            />
          )}

          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
              Top Subtitle / Tagline (e.g. &quot;Explore new arrivals&quot;)
            </label>
            <input
              placeholder="e.g. Explore new arrivals"
              className={inputClass}
              value={tile.title ?? ""}
              onChange={(e) => updateTile(tile.id, { title: e.target.value })}
            />
          </div>

          {showSubtitle && (
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                Main Card Heading / Description (e.g. &quot;Shop the latest from top brands&quot;)
              </label>
              <input
                placeholder="e.g. Shop the latest from top brands"
                className={inputClass}
                value={tile.subtitle ?? ""}
                onChange={(e) => updateTile(tile.id, { subtitle: e.target.value })}
              />
            </div>
          )}

          {showColor && (
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                Card Background Accent Theme
              </label>
              <select
                className={inputClass}
                value={tile.color ?? "auto"}
                onChange={(e) => updateTile(tile.id, { color: e.target.value })}
              >
                <option value="auto">✨ Auto-Detect Dynamic Color (From Product Image)</option>
                <option value="bg-yellow-50 dark:bg-yellow-950/20">💛 Yellow Accent (Warm)</option>
                <option value="bg-red-50 dark:bg-red-950/20">❤️ Red / Coral Accent</option>
                <option value="bg-blue-50 dark:bg-blue-950/20">💙 Blue Accent</option>
                <option value="bg-green-50 dark:bg-green-950/20">💚 Green Accent</option>
                <option value="bg-purple-50 dark:bg-purple-950/20">💜 Purple Accent</option>
                <option value="bg-slate-50 dark:bg-slate-800/40">🩶 Slate / Neutral Accent</option>
              </select>
            </div>
          )}

          {showButtonConfig && (
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Card Button (CTA)
                </label>
                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer text-neutral-600 dark:text-neutral-400">
                  <input
                    type="checkbox"
                    checked={tile.showButton !== false}
                    onChange={(e) => updateTile(tile.id, { showButton: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Show Button</span>
                </label>
              </div>

              {tile.showButton !== false && (
                <div>
                  <input
                    placeholder="Button Text (e.g. Show me all)"
                    className={inputClass}
                    value={tile.buttonText ?? "Show me all"}
                    onChange={(e) => updateTile(tile.id, { buttonText: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
              Destination Link (href)
            </label>
            <input
              placeholder="e.g. /collection or /search"
              className={inputClass}
              value={tile.href ?? ""}
              onChange={(e) => updateTile(tile.id, { href: e.target.value })}
            />
          </div>
        </div>
      ))}

      {canAdd && (
        <button
          type="button"
          onClick={addTile}
          className="px-4 py-2 text-sm rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          + Add item
        </button>
      )}
    </div>
  );
};

export default TileListEditor;
