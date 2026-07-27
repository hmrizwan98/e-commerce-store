"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { reorderHeroSlides, setHeroSlideActive } from "./actions";
import HeroSlideRowActions from "./HeroSlideRowActions";
import type { Banner } from "@/types/banner";

const HeroSlidesList: React.FC<{ initialSlides: Banner[] }> = ({ initialSlides }) => {
  const [slides, setSlides] = useState(initialSlides);
  const [dragId, setDragId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const moveByIndex = async (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    const next = slides.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setSlides(next);
    try {
      await reorderHeroSlides(next.map((s) => s.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reorder");
    }
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = slides.findIndex((s) => s.id === dragId);
    const to = slides.findIndex((s) => s.id === targetId);
    moveByIndex(from, to);
    setDragId(null);
  };

  const handleToggleActive = async (slide: Banner) => {
    setTogglingId(slide.id);
    setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, isActive: !s.isActive } : s)));
    try {
      await setHeroSlideActive(slide.id, !slide.isActive);
    } catch (err) {
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, isActive: slide.isActive } : s)));
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setTogglingId(null);
    }
  };

  if (!slides.length) {
    return (
      <div className="text-center py-12 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl">
        <p className="text-sm text-neutral-500">No hero slides yet.</p>
        <Link
          href={"/admin/hero-slides/new" as any}
          className="inline-block mt-3 px-4 py-2 text-sm rounded-full bg-primary-6000 text-white font-medium"
        >
          + Add your first slide
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">Drag rows by the handle to reorder the rotating slides.</p>
      {slides.map((slide) => (
        <div
          key={slide.id}
          draggable
          onDragStart={() => setDragId(slide.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(slide.id)}
          onDragEnd={() => setDragId(null)}
          className={`bg-white dark:bg-neutral-900 border rounded-2xl p-4 flex flex-wrap items-center gap-4 transition-opacity ${
            dragId === slide.id ? "opacity-40" : "border-neutral-200 dark:border-neutral-800"
          }`}
        >
          <span className="cursor-grab text-neutral-400 select-none" title="Drag to reorder">
            ⠿
          </span>
          <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.imageDesktop} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <Link href={`/admin/hero-slides/${slide.id}/edit` as any} className="font-semibold hover:underline">
                {slide.title}
              </Link>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  slide.isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                    : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                }`}
              >
                {slide.isActive ? "Enabled" : "Disabled"}
              </span>
            </div>
            {slide.subtitle && <p className="text-xs text-neutral-500 mt-0.5">{slide.subtitle}</p>}
          </div>
          <label className="flex items-center gap-2 text-xs font-medium flex-shrink-0">
            <input
              type="checkbox"
              checked={slide.isActive}
              disabled={togglingId === slide.id}
              onChange={() => handleToggleActive(slide)}
            />
            Active
          </label>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link href={`/admin/hero-slides/${slide.id}/edit` as any} className="text-sm font-medium hover:underline">
              Edit
            </Link>
            <HeroSlideRowActions id={slide.id} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroSlidesList;
