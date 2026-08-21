"use client";

import React from "react";
import { EnvelopeIcon, SparklesIcon } from "@heroicons/react/24/outline";
import type { HomepageSection } from "@/types/homepage-section";

export interface NewsletterSectionInspectorProps {
  section: HomepageSection;
  onChange: (patch: Partial<HomepageSection>) => void;
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function NewsletterSectionInspector({ section, onChange }: NewsletterSectionInspectorProps) {
  const config = section.config ?? {};

  const setConfig = (patch: Partial<HomepageSection["config"]>) => {
    onChange({ config: { ...config, ...patch } });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
            <EnvelopeIcon className="w-5 h-5" />
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Newsletter Section Inspector
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          Customize headline copy, subtext, email placeholder, and button text for your newsletter subscription block.
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
            value={section.title ?? "Newsletter"}
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
            placeholder="Join our newsletter 🎉"
            value={config.heading ?? ""}
            onChange={(e) => setConfig({ heading: e.target.value })}
          />
          <p className="text-[11px] text-slate-400 mt-1">Leave empty to use default (&quot;Join our newsletter 🎉&quot;).</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Sub-Heading / Description
          </label>

          <textarea
            rows={2}
            className={inputClass}
            placeholder="Get the latest deals and new arrivals straight to your inbox."
            value={config.subHeading ?? ""}
            onChange={(e) => setConfig({ subHeading: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Button Label / Text
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Subscribe (e.g. Join Now, Get 10% Off)"
            value={config.buttonText ?? ""}
            onChange={(e) => setConfig({ buttonText: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Input Placeholder Text
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Enter your email"
            value={config.placeholderText ?? ""}
            onChange={(e) => setConfig({ placeholderText: e.target.value })}
          />
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
          <div className="flex items-start gap-2">
            <SparklesIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Email Subscriptions Info</h4>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
                Subscribed email addresses are stored in your store database and tracked under marketing analytics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
