"use client";

import React from "react";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import type { HomepageSection, HomepageSectionType } from "@/types/homepage-section";

const EXTERNAL_CONTENT_LINK: Partial<Record<HomepageSectionType, { label: string; href: string }>> = {
  hero: { label: "Manage slides at Content -> Hero Slides", href: "/admin/hero-slides" },
  promo: { label: "Manage banner content at Content -> Promo Banners", href: "/admin/promo-banners" },
  testimonials: { label: "Manage reviews at Content -> Testimonials", href: "/admin/testimonials" },
  blog: { label: "Manage posts at Content -> Blog Posts", href: "/admin/blog-posts" },
  brands: { label: "Manage brands at Content -> Brands", href: "/admin/brands" },
};

export interface GenericSectionInspectorProps {
  section: HomepageSection;
  onChange: (patch: Partial<HomepageSection>) => void;
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function GenericSectionInspector({ section, onChange }: GenericSectionInspectorProps) {
  const config = section.config ?? {};
  const externalLink = EXTERNAL_CONTENT_LINK[section.type];

  const setConfig = (patch: Partial<HomepageSection["config"]>) => {
    onChange({ config: { ...config, ...patch } });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            {section.title || section.type} Inspector
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          Section-specific properties for {section.type}.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Section Label (Internal)
          </label>
          <input
            type="text"
            className={inputClass}
            value={section.title ?? ""}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Display Heading
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Section Heading"
            value={config.heading ?? ""}
            onChange={(e) => setConfig({ heading: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Sub-Heading / Description
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Sub-heading text..."
            value={config.subHeading ?? ""}
            onChange={(e) => setConfig({ subHeading: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Item Limit
          </label>
          <input
            type="number"
            min={1}
            max={50}
            className={inputClass}
            placeholder="Limit items (optional)"
            value={config.limit ?? ""}
            onChange={(e) => setConfig({ limit: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>

        {externalLink && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Content for this section is managed in its dedicated admin manager.
            </p>
            <Link
              href={externalLink.href as any}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>{externalLink.label}</span>
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
