import React from "react";
import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { THEME_PRESETS } from "@/lib/themes/theme-presets";

const FALLBACK_SWATCHES = ["#2563eb", "#0f172a", "#06b6d4"];

function ThemesTeaser() {
  const presets = Object.values(THEME_PRESETS);

  return (
    <section className="container py-20 lg:py-28">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <SparklesIcon className="w-3.5 h-3.5" />
          <span>Production Ready Starter Themes</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Four themes, ready on day one
        </h2>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Every store starts from a complete, production-ready theme - colors, typography, and homepage layout included, pre-configured for instant launch.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {presets.map((preset) => {
          const swatches = [
            preset.theme.colors?.primary,
            preset.theme.colors?.secondary,
            preset.theme.colors?.accent,
          ].filter(Boolean) as string[];
          const colors = swatches.length ? swatches : FALLBACK_SWATCHES;

          return (
            <div
              key={preset.key}
              className="group p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm hover:border-primary-6000/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1.5 p-1 rounded-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60">
                    {colors.map((color, i) => (
                      <span
                        key={i}
                        className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2 tracking-tight group-hover:text-primary-6000 transition-colors">
                  {preset.name}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                  {preset.description}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-wrap gap-1.5">
                {preset.suitableFor.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <Link
          href={"/themes" as any}
          className="inline-flex items-center gap-2 font-semibold text-primary-6000 hover:text-indigo-600 transition-colors group"
        >
          <span>Explore full theme presets & homepage builder</span>
          <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

export default React.memo(ThemesTeaser);

