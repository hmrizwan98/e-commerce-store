"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { reorderPromoBanners, setPromoBannerActive } from "./actions";
import PromoBannerRowActions from "./PromoBannerRowActions";
import type { Banner, BannerPlacement } from "@/types/banner";

const PromoBannersList: React.FC<{ initialBanners: Banner[]; placement: BannerPlacement }> = ({
  initialBanners,
  placement,
}) => {
  const [banners, setBanners] = useState(initialBanners);
  const [dragId, setDragId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  React.useEffect(() => {
    setBanners(initialBanners);
  }, [initialBanners]);

  const moveByIndex = async (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    const next = banners.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setBanners(next);
    try {
      await reorderPromoBanners(next.map((b) => b.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reorder");
    }
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = banners.findIndex((b) => b.id === dragId);
    const to = banners.findIndex((b) => b.id === targetId);
    moveByIndex(from, to);
    setDragId(null);
  };

  const handleToggleActive = async (banner: Banner) => {
    setTogglingId(banner.id);
    setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b)));
    try {
      await setPromoBannerActive(banner.id, !banner.isActive);
    } catch (err) {
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, isActive: banner.isActive } : b)));
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setTogglingId(null);
    }
  };

  if (!banners.length) {
    return (
      <div className="text-center py-12 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl">
        <p className="text-sm text-neutral-500">No banners yet for this placement.</p>
        <Link
          href={`/admin/promo-banners/new?placement=${placement}` as any}
          className="inline-block mt-3 px-4 py-2 text-sm rounded-full bg-primary-6000 text-white font-medium"
        >
          + Add your first banner
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">Drag rows by the handle to reorder the banners.</p>
      {banners.map((banner) => (
        <div
          key={banner.id}
          draggable
          onDragStart={() => setDragId(banner.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(banner.id)}
          onDragEnd={() => setDragId(null)}
          className={`bg-white dark:bg-neutral-900 border rounded-2xl p-4 flex flex-wrap items-center gap-4 transition-opacity ${
            dragId === banner.id ? "opacity-40" : "border-neutral-200 dark:border-neutral-800"
          }`}
        >
          <span className="cursor-grab text-neutral-400 select-none" title="Drag to reorder">
            ⠿
          </span>
          <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.imageDesktop} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <Link href={`/admin/promo-banners/${banner.id}/edit` as any} className="font-semibold hover:underline">
                {banner.title}
              </Link>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  banner.isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                    : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                }`}
              >
                {banner.isActive ? "Enabled" : "Disabled"}
              </span>
            </div>
            {banner.subtitle && <p className="text-xs text-neutral-500 mt-0.5">{banner.subtitle}</p>}
          </div>
          <label className="flex items-center gap-2 text-xs font-medium flex-shrink-0">
            <input
              type="checkbox"
              checked={banner.isActive}
              disabled={togglingId === banner.id}
              onChange={() => handleToggleActive(banner)}
            />
            Active
          </label>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link href={`/admin/promo-banners/${banner.id}/edit` as any} className="text-sm font-medium hover:underline">
              Edit
            </Link>
            <PromoBannerRowActions id={banner.id} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PromoBannersList;
