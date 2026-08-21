"use client";

import React from "react";
import TileListEditor from "@/components/admin/TileListEditor";
import type { HomepageSection, HomepageTile } from "@/types/homepage-section";

export interface HowItWorkSectionInspectorProps {
  section: HomepageSection;
  onChange: (patch: Partial<HomepageSection>) => void;
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function HowItWorkSectionInspector({ section, onChange }: HowItWorkSectionInspectorProps) {
  const config = section.config ?? {};

  const setConfig = (patch: Partial<HomepageSection["config"]>) => {
    onChange({ config: { ...config, ...patch } });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          How It Works Inspector
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize step titles, descriptions, icons, and step illustration images dynamically.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Section Title
          </label>
          <input
            type="text"
            className={inputClass}
            value={section.title ?? "How It Works"}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Heading
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="How ordering works"
            value={config.heading ?? ""}
            onChange={(e) => setConfig({ heading: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Sub-Heading
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Follow 4 easy steps to place your order"
            value={config.subHeading ?? ""}
            onChange={(e) => setConfig({ subHeading: e.target.value })}
          />
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Dynamic Process Steps (Cards)
          </label>
          <p className="text-xs text-slate-500">
            Edit step titles, descriptions, upload custom step images or set text icons.
          </p>

          <TileListEditor
            items={config.items ?? []}
            onChange={(items: HomepageTile[]) => setConfig({ items })}
            showIcon={true}
            showSubtitle={true}
            showBadge={true}
            maxItems={8}
          />
        </div>
      </div>
    </div>
  );
}
