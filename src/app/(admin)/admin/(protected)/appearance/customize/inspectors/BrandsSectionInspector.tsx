"use client";

import React from "react";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import type { HomepageSection } from "@/types/homepage-section";

export interface PickerOption {
  id: string;
  name: string;
}

export interface BrandsSectionInspectorProps {
  section: HomepageSection;
  onChange: (patch: Partial<HomepageSection>) => void;
  brandOptions?: PickerOption[];
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function BrandsSectionInspector({
  section,
  onChange,
  brandOptions = [],
}: BrandsSectionInspectorProps) {
  const config = section.config ?? {};
  const mode = config.mode ?? "auto";
  const selectedBrandIds = config.brandIds ?? [];

  const setConfig = (patch: Partial<HomepageSection["config"]>) => {
    onChange({ config: { ...config, ...patch } });
  };

  const toggleBrandId = (id: string) => {
    const next = selectedBrandIds.includes(id)
      ? selectedBrandIds.filter((x) => x !== id)
      : [...selectedBrandIds, id];
    setConfig({ brandIds: next });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400">
            <BuildingOfficeIcon className="w-5 h-5" />
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Brands Section Inspector
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          Display partner brand logos (Nike, Adidas, etc.) on your homepage to build store trust and guide shoppers to brand collections.
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
            value={section.title ?? "Brands"}
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
            placeholder="Our Brands"
            value={config.heading ?? ""}
            onChange={(e) => setConfig({ heading: e.target.value })}
          />
          <p className="text-[11px] text-slate-400 mt-1">Leave empty to use default heading (&quot;Our Brands&quot;).</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Sub-Heading / Description
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Shop top quality products from authentic global brands"
            value={config.subHeading ?? ""}
            onChange={(e) => setConfig({ subHeading: e.target.value })}
          />
        </div>

        {/* Brand Display Mode Selection */}
        <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Brand Selection Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfig({ mode: "auto" })}
              className={`p-2.5 rounded-xl border text-left text-xs transition ${
                mode === "auto"
                  ? "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-100 font-bold"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <div className="font-semibold">Auto (All Active)</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Show all active brands</div>
            </button>
            <button
              type="button"
              onClick={() => setConfig({ mode: "manual" })}
              className={`p-2.5 rounded-xl border text-left text-xs transition ${
                mode === "manual"
                  ? "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-100 font-bold"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <div className="font-semibold">Manual Selection</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Pick specific brands</div>
            </button>
          </div>

          {/* Checkbox Brand Picker List when in Manual Mode */}
          {mode === "manual" && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Brands to Display ({selectedBrandIds.length} selected):
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/50">
                {brandOptions.length ? (
                  brandOptions.map((brand) => {
                    const isChecked = selectedBrandIds.includes(brand.id);
                    return (
                      <label
                        key={brand.id}
                        className={`flex items-center gap-2 text-xs p-1.5 rounded-lg cursor-pointer transition ${
                          isChecked
                            ? "bg-cyan-100/70 dark:bg-cyan-950/60 font-semibold text-cyan-900 dark:text-cyan-100"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBrandId(brand.id)}
                          className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span>{brand.name}</span>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-2 text-center">No brands found. Create brands in Brand Catalog.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Maximum Brands to Display
          </label>
          <input
            type="number"
            min={1}
            max={24}
            className={inputClass}
            placeholder="All selected/active brands (e.g. 6 or 12)"
            value={config.limit ?? ""}
            onChange={(e) => setConfig({ limit: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>

        {/* Info callout & Direct Link to Brands Catalog */}
        <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/60 space-y-2.5">
          <div className="flex items-start gap-2">
            <span className="text-base">🏢</span>
            <div>
              <h4 className="text-xs font-bold text-cyan-900 dark:text-cyan-200">Brand Status & Catalog</h4>
              <p className="text-xs text-cyan-700 dark:text-cyan-400 mt-0.5">
                Paused or inactive brands will <strong>never</strong> appear on your live store. Manage brand status (Active/Inactive), logos, and links in Brand Manager.
              </p>
            </div>
          </div>
          <Link
            href={"/admin/brands" as any}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-cyan-100 hover:underline pt-1"
          >
            <span>Manage Brands Catalog</span>
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
