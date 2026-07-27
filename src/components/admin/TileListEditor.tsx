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
  maxItems?: number;
  onUploadingChange?: (uploading: boolean) => void;
}

const inputClass =
  "w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";

function createTile(): HomepageTile {
  return { id: `tile-${Date.now()}-${Math.random().toString(36).slice(2)}` };
}

const TileListEditor: React.FC<TileListEditorProps> = ({
  items,
  onChange,
  imageType = "homepage",
  showIcon = false,
  showSubtitle = false,
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
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Tile {index + 1}</span>
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

          {showIcon && (
            <input
              placeholder="Icon (emoji)"
              className={inputClass}
              value={tile.icon ?? ""}
              onChange={(e) => updateTile(tile.id, { icon: e.target.value })}
            />
          )}

          <input
            placeholder="Title"
            className={inputClass}
            value={tile.title ?? ""}
            onChange={(e) => updateTile(tile.id, { title: e.target.value })}
          />

          {showSubtitle && (
            <input
              placeholder="Subtitle"
              className={inputClass}
              value={tile.subtitle ?? ""}
              onChange={(e) => updateTile(tile.id, { subtitle: e.target.value })}
            />
          )}

          <input
            placeholder="Link (href)"
            className={inputClass}
            value={tile.href ?? ""}
            onChange={(e) => updateTile(tile.id, { href: e.target.value })}
          />
        </div>
      ))}

      {canAdd && (
        <button
          type="button"
          onClick={addTile}
          className="px-4 py-2 text-sm rounded-full border border-neutral-300 dark:border-neutral-700"
        >
          + Add tile
        </button>
      )}
    </div>
  );
};

export default TileListEditor;
