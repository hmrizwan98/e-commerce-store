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
  { id: "s1", type: "hero", enabled: true, order: 1, heading: "Hero Slider" },
  { id: "s2", type: "onSale", enabled: true, order: 2, heading: "On Sale", subHeading: "LIMITED TIME DISCOUNTS", cardVariant: "deal-card" },
  { id: "s3", type: "bestSellers", enabled: true, order: 3, heading: "Best Sellers", subHeading: "BEST SELLERS OF THE MONTH" },
  { id: "s4", type: "blog", enabled: true, order: 4, heading: "Latest Blog", subHeading: "FROM THE BLOG" },
  { id: "s5", type: "newArrivals", enabled: true, order: 5, heading: "New Arrivals", subHeading: "DISCOVER LATEST ARRIVALS" },
  { id: "s6", type: "howItWork", enabled: true, order: 6, heading: "How It Works" },
  { id: "s7", type: "largeProductSlider", enabled: true, order: 7, heading: "Large Product Slider", subHeading: "CHOSEN BY OUR EXPERTS" },
  { id: "s8", type: "featuredProducts", enabled: true, order: 8, heading: "Featured Products", subHeading: "Top handpicked items" },
  { id: "s9", type: "collections", enabled: true, order: 9, heading: "Shop by Category" },
  { id: "s10", type: "socialGallery", enabled: true, order: 10, heading: "Social Gallery", subHeading: "Follow us on Instagram" },
  { id: "s11", type: "brands", enabled: true, order: 11, heading: "Brands" },
  { id: "s12", type: "newsletter", enabled: true, order: 12, heading: "Newsletter" },
  { id: "s13", type: "testimonials", enabled: true, order: 13, heading: "Customer Reviews", subHeading: "HAPPY CUSTOMERS" },
  { id: "s14", type: "featureItemsGrid", enabled: true, order: 14, heading: "Feature Items Grid", subHeading: "DISCOVER MORE PRODUCTS" },
  { id: "s15", type: "promo", enabled: true, order: 15, heading: "Promo Banner" },
  { id: "s16", type: "discoverMore", enabled: true, order: 16, heading: "Discover More Slider" },
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
