import React from "react";
import type { Metadata } from "next";
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
    <div className="container py-16 lg:py-24">
      <h1 className="text-3xl sm:text-4xl font-semibold text-center">Four themes, ready on day one</h1>
      <p className="mt-4 text-center text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
        Every store can install one of these production-ready presets at creation time - colors, typography, and
        homepage layout all pre-configured. Fully customizable afterward in the Theme Builder.
      </p>

      <div className="mt-16 grid sm:grid-cols-2 gap-8">
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
            <div key={preset.key} className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div className="flex gap-2 mb-5">
                {displaySwatches.map((color, i) => (
                  <span key={i} className="w-8 h-8 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                ))}
              </div>
              <h2 className="font-semibold text-lg mb-2">{preset.name}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{preset.description}</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {preset.suitableFor.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800">
                    {tag}
                  </span>
                ))}
              </div>

              {headingFont && bodyFont && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">
                  Headings: {headingFont} · Body: {bodyFont}
                </p>
              )}

              <div className="mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500 mb-2">
                  Homepage layout
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {preset.homepageSections
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <span
                        key={section.order}
                        className="px-2 py-0.5 rounded-full text-xs bg-primary-6000/10 text-primary-6000"
                      >
                        {section.order}. {section.title}
                      </span>
                    ))}
                </div>
              </div>

              {(sampleTestimonial || sampleFaq) && (
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500 mb-2">
                    Includes — sample content shipped with this theme
                  </h3>
                  {sampleTestimonial && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                      &ldquo;{sampleTestimonial.content}&rdquo; — {sampleTestimonial.clientName}
                    </p>
                  )}
                  {sampleFaq && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Q: {sampleFaq.question}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
