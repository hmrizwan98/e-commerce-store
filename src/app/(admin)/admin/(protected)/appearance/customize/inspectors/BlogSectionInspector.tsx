"use client";

import React, { useState } from "react";
import { PlusIcon, ArrowTopRightOnSquareIcon, NewspaperIcon, MagnifyingGlassIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import type { HomepageSection, HomepageSectionConfig } from "@/types/homepage-section";
import type { PickerOption } from "@/app/(admin)/admin/(protected)/homepage/HomepageSections";

export interface BlogSectionInspectorProps {
  section: HomepageSection;
  onChange: (patch: Partial<HomepageSection>) => void;
  blogOptions?: PickerOption[];
}

const inputClass =
  "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

export default function BlogSectionInspector({ section, onChange, blogOptions = [] }: BlogSectionInspectorProps) {
  const config = section.config ?? {};
  const mode = config.mode ?? "auto";
  const selectedPostIds = config.postIds ?? [];
  const [blogSearch, setBlogSearch] = useState("");

  const setConfig = (patch: Partial<HomepageSectionConfig>) => {
    onChange({ config: { ...config, ...patch } });
  };

  const togglePostId = (id: string) => {
    const exists = selectedPostIds.includes(id);
    const nextIds = exists
      ? selectedPostIds.filter((item: string) => item !== id)
      : [...selectedPostIds, id];
    setConfig({ postIds: nextIds, mode: "manual" });
  };

  const filteredBlogPosts = blogOptions.filter((b) =>
    b.name.toLowerCase().includes(blogSearch.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Blog Section Inspector
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure section titles, filter/select specific blog posts to display, or manage blog content.
        </p>
      </div>

      {/* Blog Catalog & Quick Actions Box */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
            <NewspaperIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Blog Content Manager</span>
          </div>
          <span className="text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
            Dynamic Articles
          </span>
        </div>
        <p className="text-xs text-indigo-900/70 dark:text-indigo-300/70 leading-relaxed">
          Create new articles, update cover images, edit excerpts, or manage all blog posts.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <a
            href="/admin/blog-posts/new"
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add New Blog Post ↗
          </a>
          <a
            href="/admin/blog-posts"
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            Manage All Blog Posts
          </a>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {/* Section Heading & Titles */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Section Title
          </label>
          <input
            type="text"
            className={inputClass}
            value={section.title ?? "Latest Blog"}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Main Heading
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="The latest news and stories"
            value={config.heading ?? ""}
            onChange={(e) => setConfig({ heading: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Sub-Heading / Tagline
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Read our recent articles and guide"
            value={config.subHeading ?? ""}
            onChange={(e) => setConfig({ subHeading: e.target.value })}
          />
        </div>

        {/* Article Selection Mode */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Article Selection &amp; Filter Mode
          </label>

          <div className="grid grid-cols-1 gap-2">
            <label
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                mode === "auto"
                  ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-xs text-indigo-700 dark:text-indigo-300"
                  : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <input
                type="radio"
                name="blogMode"
                checked={mode === "auto"}
                onChange={() => setConfig({ mode: "auto" })}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold">Automatic (Latest Published Articles)</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  Automatically shows latest active blog posts.
                </span>
              </div>
            </label>

            <label
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                mode === "manual"
                  ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-xs text-indigo-700 dark:text-indigo-300"
                  : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <input
                type="radio"
                name="blogMode"
                checked={mode === "manual"}
                onChange={() => setConfig({ mode: "manual" })}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold">Manual Picker (Select Specific Articles)</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  Check &amp; uncheck exact blog articles to show/hide.
                </span>
              </div>
            </label>
          </div>

          {/* Manual Blog Articles Picker */}
          {mode === "manual" && (
            <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                  Selected Articles ({selectedPostIds.length})
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    onClick={() => setConfig({ postIds: blogOptions.map((b) => b.id) })}
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                    onClick={() => setConfig({ postIds: [] })}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Blog Post Search Bar */}
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  className={`${inputClass} pl-9`}
                  placeholder="Search blog post title..."
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                />
              </div>

              {/* Scrollable Blog Checkbox List */}
              <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBlogPosts.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 text-center">
                    {blogOptions.length === 0 ? "No blog posts published yet" : "No matching articles"}
                  </p>
                ) : (
                  filteredBlogPosts.map((post) => {
                    const isChecked = selectedPostIds.includes(post.id);
                    return (
                      <label
                        key={post.id}
                        className={`flex items-center justify-between py-2 px-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? "bg-indigo-50/80 dark:bg-indigo-950/40" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePostId(post.id)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {post.name}
                          </span>
                        </div>
                        {isChecked && <CheckCircleIcon className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Number of Posts Limit */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Number of Posts to Display ({config.limit ?? 3})
            </label>
          </div>
          <input
            type="range"
            min={1}
            max={12}
            step={1}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            value={config.limit ?? 3}
            onChange={(e) => setConfig({ limit: Number(e.target.value) })}
          />
        </div>
        {/* Card Display Options */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">
            Card Display Options
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showDate ?? true}
              onChange={(e) => setConfig({ showDate: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Show Published Date on Article Cards
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={config.showReadMore ?? true}
              onChange={(e) => setConfig({ showReadMore: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Show &quot;Read Article&quot; Link
            </span>
          </label>

          {(config.showReadMore ?? true) && (
            <div className="pt-1">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                &quot;Read Article&quot; Link Text
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="Read Article"
                value={config.readMoreText ?? "Read Article"}
                onChange={(e) => setConfig({ readMoreText: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* View All Button Controls */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showViewAll ?? true}
              onChange={(e) => setConfig({ showViewAll: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Show &quot;View All&quot; Button at Bottom
            </span>
          </label>

          {(config.showViewAll ?? true) && (
            <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Button Text / Label
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Show all blog articles"
                  value={config.viewAllText ?? "Show all blog articles"}
                  onChange={(e) => setConfig({ viewAllText: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Redirect URL / Link Path
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="/blog"
                  value={config.viewAllHref ?? "/blog"}
                  onChange={(e) => setConfig({ viewAllHref: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
