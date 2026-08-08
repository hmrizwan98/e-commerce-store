import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SparklesIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { THEME_PRESETS } from "@/lib/themes/theme-presets";
import { FONT_PRESETS } from "@/lib/theme/fonts";

export const metadata: Metadata = {
  title: "Themes — Tradez Glint Platform",
  description: "Four production-ready storefront themes included with every store, installable at store creation.",
  openGraph: {
    title: "Themes — Tradez Glint Platform",
    description: "Four production-ready storefront themes included with every store, installable at store creation.",
    url: "/themes",
    siteName: "Tradez Glint",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Themes — Tradez Glint Platform",
    description: "Four production-ready storefront themes included with every store.",
  },
  alternates: { canonical: "/themes" },
};

const FALLBACK_SWATCHES = ["#0284c7", "#16a34a", "#f59e0b"];

export default function ThemesShowcasePage() {
  const presets = Object.values(THEME_PRESETS);

  return (
    <div className="container py-16 lg:py-24 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold">
          <SparklesIcon className="w-4 h-4 text-amber-500" />
          <span>Production Storefront Themes</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
          Four themes, ready on day one
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Every store can install one of these production-ready presets at creation time — colors, typography, and homepage section order pre-configured, and fully customizable in Theme Builder.
        </p>
      </div>

      {/* Grid of Theme Presets */}
      <div className="grid sm:grid-cols-2 gap-8">
        {presets.map((preset) => {
          const swatches = [preset.theme.colors?.primary, preset.theme.colors?.secondary, preset.theme.colors?.accent].filter(
            (c): c is string => Boolean(c)
          );
          const displaySwatches = swatches.length ? swatches : FALLBACK_SWATCHES;
          const typography = preset.theme.typography;
          const headingFont = typography?.headingFont ? FONT_PRESETS[typography.headingFont]?.label : undefined;
          const bodyFont = typography?.bodyFont ? FONT_PRESETS[typography.bodyFont]?.label : undefined;
          const sampleTestimonial = preset.testimonials[0];
          const sampleFaq = preset.faqs[0];

          return (
            <div
              key={preset.key}
              className="p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-lg shadow-neutral-900/5 hover:border-primary-6000/40 transition-all space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {displaySwatches.map((color, i) => (
                      <span
                        key={i}
                        className="w-8 h-8 rounded-full border border-black/10 shadow-xs ring-2 ring-white dark:ring-neutral-900"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    Preset ID: {preset.key}
                  </span>
                </div>

                <h2 className="font-extrabold text-2xl text-neutral-900 dark:text-white tracking-tight">{preset.name}</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{preset.description}</p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {preset.suitableFor.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-6000/10 text-primary-6000 dark:text-primary-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {headingFont && bodyFont && (
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-600 dark:text-neutral-400 font-mono border border-neutral-200/50 dark:border-neutral-800/50">
                    Typography — Headings: <strong className="text-neutral-900 dark:text-white">{headingFont}</strong> · Body: <strong className="text-neutral-900 dark:text-white">{bodyFont}</strong>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono mb-2.5">
                    Pre-configured Homepage Sections
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {preset.homepageSections
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <span
                          key={section.order}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                        >
                          {section.order}. {section.title}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              {(sampleTestimonial || sampleFaq) && (
                <div className="pt-5 border-t border-neutral-200/60 dark:border-neutral-800/60 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
                    Sample Starter Content Included
                  </h3>
                  {sampleTestimonial && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 italic">
                      &ldquo;{sampleTestimonial.content}&rdquo; — <span className="not-italic font-semibold text-neutral-800 dark:text-neutral-200">{sampleTestimonial.clientName}</span>
                    </p>
                  )}
                  {sampleFaq && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      <strong className="text-neutral-800 dark:text-neutral-200">Q:</strong> {sampleFaq.question}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Callout */}
      <div className="text-center">
        <Link
          href={"/book-demo" as any}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary-6000 to-indigo-600 text-white font-bold text-base shadow-xl hover:shadow-2xl transition-all"
        >
          <span>See Theme Customization Live on Demo Call</span>
          <ArrowRightIcon className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

