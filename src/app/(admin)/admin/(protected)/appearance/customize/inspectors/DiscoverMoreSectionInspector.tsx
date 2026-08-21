"use client";

import React from "react";
import TileListEditor from "@/components/admin/TileListEditor";
import type { HomepageSection, HomepageTile } from "@/types/homepage-section";

export interface DiscoverMoreSectionInspectorProps {
  section: HomepageSection;
  onChange: (patch: Partial<HomepageSection>) => void;
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function DiscoverMoreSectionInspector({
  section,
  onChange,
}: DiscoverMoreSectionInspectorProps) {
  const config = section.config ?? {};

  const setConfig = (patch: Partial<HomepageSection["config"]>) => {
    onChange({ config: { ...config, ...patch } });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full">
            Discover Carousel
          </span>
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mt-1">
          Discover More Slider Inspector
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize section headings, discovery cards, button labels, colors, and links.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Section Label (Admin)
          </label>
          <input
            type="text"
            className={inputClass}
            value={section.title ?? "Discover More Slider"}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Main Heading (Storefront)
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Discover more"
            value={config.heading ?? "Discover more"}
            onChange={(e) => setConfig({ heading: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Right Tagline / Sub-Heading
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Good things are waiting for you"
            value={config.subHeading ?? "Good things are waiting for you"}
            onChange={(e) => setConfig({ subHeading: e.target.value })}
          />
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Discovery Slide Cards
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Add and customize card titles, images, colors, button text, and link URLs.
            </p>
          </div>

          <TileListEditor
            items={config.items ?? []}
            onChange={(items: HomepageTile[]) => setConfig({ items })}
            showIcon={false}
            showSubtitle={true}
            showBadge={false}
            showColor={true}
            showButtonConfig={true}
            maxItems={10}
          />
        </div>
      </div>
    </div>
  );
}
