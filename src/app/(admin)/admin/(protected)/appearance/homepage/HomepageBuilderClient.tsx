"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Input from "@/shared/Input/Input";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { saveThemeDraftAction, publishThemeAction, resetThemeDraftAction } from "../actions";
import type { SystemThemeConfig, HomepageThemeSectionConfig } from "@/lib/theme/theme-types";

export interface HomepageBuilderClientProps {
  draftTheme: SystemThemeConfig;
  activeTheme: SystemThemeConfig;
}

const DEFAULT_HOMEPAGE_SECTIONS: HomepageThemeSectionConfig[] = [
  { id: "s1", type: "hero", enabled: true, order: 1, heading: "New Season Arrivals" },
  { id: "s2", type: "featuredProducts", enabled: true, order: 2, heading: "Featured Products", subHeading: "Top handpicked items" },
  { id: "s3", type: "categories", enabled: true, order: 3, heading: "Shop by Category" },
  { id: "s4", type: "brands", enabled: true, order: 4, heading: "Featured Brands" },
  { id: "s5", type: "testimonials", enabled: true, order: 5, heading: "Customer Reviews" },
  { id: "s6", type: "newsletter", enabled: true, order: 6, heading: "Stay Informed" },
];

export default function HomepageBuilderClient({ draftTheme, activeTheme }: HomepageBuilderClientProps) {
  const initialSections = draftTheme.homepage?.sections?.length
    ? draftTheme.homepage.sections
    : DEFAULT_HOMEPAGE_SECTIONS;

  const [sections, setSections] = useState<HomepageThemeSectionConfig[]>(initialSections);
  const [loading, setLoading] = useState(false);

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    // Update order indices
    const updated = copy.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    setSections(updated);
  };

  const handleToggle = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const handleHeadingChange = (id: string, heading: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, heading } : s)));
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    const updatedConfig: Partial<SystemThemeConfig> = {
      ...draftTheme,
      homepage: { sections },
    };
    const res = await saveThemeDraftAction(updatedConfig);
    if (res.ok) {
      toast.success("Saved draft homepage configuration!");
    } else {
      toast.error("Failed to save draft.");
    }
    setLoading(false);
  };

  const handlePublish = async () => {
    setLoading(true);
    const updatedConfig: Partial<SystemThemeConfig> = {
      ...draftTheme,
      homepage: { sections },
    };
    await saveThemeDraftAction(updatedConfig);
    const pubRes = await publishThemeAction();
    if (pubRes.ok) {
      toast.success("Published homepage live to storefront!");
    } else {
      toast.error("Failed to publish homepage.");
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setLoading(true);
    const res = await resetThemeDraftAction();
    if (res.ok) {
      toast.success("Reset draft to active published theme!");
      setSections(activeTheme.homepage?.sections?.length ? activeTheme.homepage.sections : DEFAULT_HOMEPAGE_SECTIONS);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <div className="text-sm font-medium">
          Draft Status: <span className="text-amber-600 font-bold">Working Draft</span>
        </div>
        <div className="flex items-center gap-3">
          <ButtonSecondary onClick={handleReset} disabled={loading}>
            Reset Draft
          </ButtonSecondary>
          <ButtonSecondary onClick={handleSaveDraft} loading={loading}>
            Save Draft
          </ButtonSecondary>
          <ButtonPrimary onClick={handlePublish} loading={loading}>
            Publish Live
          </ButtonPrimary>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
              section.enabled ? "border-slate-200 dark:border-slate-800" : "border-slate-200/50 opacity-60 bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex flex-col gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, "up")}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ArrowUpIcon className="w-4 h-4" />
                </button>
                <button
                  disabled={idx === sections.length - 1}
                  onClick={() => handleMove(idx, "down")}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDownIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                    #{section.order}
                  </span>
                  <span className="font-bold text-sm uppercase tracking-wide text-slate-700 dark:text-slate-300">
                    {section.type}
                  </span>
                </div>
                <Input
                  value={section.heading || ""}
                  onChange={(e) => handleHeadingChange(section.id, e.target.value)}
                  placeholder="Section Heading"
                  className="text-sm py-1.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input
                  type="checkbox"
                  checked={section.enabled}
                  onChange={() => handleToggle(section.id)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
                {section.enabled ? "Enabled" : "Disabled"}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
