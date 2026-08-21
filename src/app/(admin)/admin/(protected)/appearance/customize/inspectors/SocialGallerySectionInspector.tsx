"use client";

import React from "react";
import TileListEditor from "@/components/admin/TileListEditor";
import type { HomepageSection, HomepageTile } from "@/types/homepage-section";

export interface SocialGallerySectionInspectorProps {
  section: HomepageSection;
  onChange: (patch: Partial<HomepageSection>) => void;
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function SocialGallerySectionInspector({
  section,
  onChange,
}: SocialGallerySectionInspectorProps) {
  const config = section.config ?? {};

  const setConfig = (patch: Partial<HomepageSection["config"]>) => {
    onChange({ config: { ...config, ...patch } });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 rounded-full">
            Instagram / Social
          </span>
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mt-1">
          Social Gallery Inspector
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize section heading, social handle, and upload photos for your Instagram feed.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Section Title (Heading)
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Follow us on Instagram"
            value={section.title ?? config.heading ?? "Follow us on Instagram"}
            onChange={(e) => {
              const val = e.target.value;
              onChange({ title: val });
              setConfig({ heading: val });
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Sub-Heading / Tagline (Optional)
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Tag us on Instagram #GlamixStyle"
            value={config.subHeading ?? ""}
            onChange={(e) => setConfig({ subHeading: e.target.value })}
          />
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Social Photo Cards
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload images and add optional redirect links for each social tile.
            </p>
          </div>

          <TileListEditor
            items={config.items ?? []}
            onChange={(items: HomepageTile[]) => setConfig({ items })}
            showIcon={false}
            showSubtitle={false}
            showBadge={false}
            maxItems={12}
          />
        </div>
      </div>
    </div>
  );
}
