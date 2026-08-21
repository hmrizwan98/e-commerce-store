"use client";

import React from "react";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import type { HomepageSection } from "@/types/homepage-section";

export interface PickerOption {
  id: string;
  name: string;
}

export interface TestimonialsSectionInspectorProps {
  section: HomepageSection;
  onChange: (patch: Partial<HomepageSection>) => void;
  testimonialOptions?: PickerOption[];
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function TestimonialsSectionInspector({
  section,
  onChange,
  testimonialOptions = [],
}: TestimonialsSectionInspectorProps) {
  const config = section.config ?? {};
  const mode = config.mode ?? "auto";
  const selectedTestimonialIds = config.testimonialIds ?? [];

  const setConfig = (patch: Partial<HomepageSection["config"]>) => {
    onChange({ config: { ...config, ...patch } });
  };

  const toggleTestimonialId = (id: string) => {
    const next = selectedTestimonialIds.includes(id)
      ? selectedTestimonialIds.filter((x) => x !== id)
      : [...selectedTestimonialIds, id];
    setConfig({ testimonialIds: next });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Testimonials Section Inspector
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          Display customer reviews and social proof ratings on your homepage.
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
            value={section.title ?? "Testimonials"}
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
            placeholder="What People Are Saying"
            value={config.heading ?? ""}
            onChange={(e) => setConfig({ heading: e.target.value })}
          />
          <p className="text-[11px] text-slate-400 mt-1">Leave empty to use default heading (&quot;What People Are Saying&quot;).</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Sub-Heading / Tagline
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="HAPPY CUSTOMERS"
            value={config.subHeading ?? ""}
            onChange={(e) => setConfig({ subHeading: e.target.value })}
          />
        </div>

        {/* Testimonial Display Mode Selection */}
        <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Review Selection Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfig({ mode: "auto" })}
              className={`p-2.5 rounded-xl border text-left text-xs transition ${
                mode === "auto"
                  ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100 font-bold"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <div className="font-semibold">Auto (All Active)</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Show all active reviews</div>
            </button>
            <button
              type="button"
              onClick={() => setConfig({ mode: "manual" })}
              className={`p-2.5 rounded-xl border text-left text-xs transition ${
                mode === "manual"
                  ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100 font-bold"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <div className="font-semibold">Manual Selection</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Pick specific reviews</div>
            </button>
          </div>

          {/* Checkbox Testimonial Picker List when in Manual Mode */}
          {mode === "manual" && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Customer Reviews ({selectedTestimonialIds.length} selected):
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/50">
                {testimonialOptions.length ? (
                  testimonialOptions.map((item) => {
                    const isChecked = selectedTestimonialIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-start gap-2 text-xs p-2 rounded-lg cursor-pointer transition ${
                          isChecked
                            ? "bg-purple-100/70 dark:bg-purple-950/60 font-semibold text-purple-900 dark:text-purple-100"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTestimonialId(item.id)}
                          className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 mt-0.5"
                        />
                        <span className="line-clamp-2">{item.name}</span>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-2 text-center">No reviews found. Add reviews in Content -&gt; Testimonials.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Maximum Reviews to Display
          </label>
          <input
            type="number"
            min={1}
            max={20}
            className={inputClass}
            placeholder="All active/selected reviews (e.g. 5)"
            value={config.limit ?? ""}
            onChange={(e) => setConfig({ limit: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>

        {/* Info callout & Direct Link to Testimonials Manager */}
        <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-2.5">
          <div className="flex items-start gap-2">
            <span className="text-base">💬</span>
            <div>
              <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">Reviews &amp; Ratings Catalog</h4>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                Client names, avatars, star ratings, and review content are managed in the main Testimonials manager.
              </p>
            </div>
          </div>
          <Link
            href={"/admin/testimonials" as any}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 hover:underline pt-1"
          >
            <span>Manage Reviews Catalog</span>
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
