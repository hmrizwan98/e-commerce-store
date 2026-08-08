import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon, SparklesIcon, BoltIcon, CloudIcon } from "@heroicons/react/24/outline";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 lg:pt-28 lg:pb-32 bg-gradient-to-b from-primary-50/40 via-transparent to-transparent dark:from-neutral-900/50">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-primary-6000/10 via-indigo-500/10 to-cyan-500/10 blur-3xl pointer-events-none -z-10" />

      <div className="container relative max-w-4xl mx-auto text-center px-4">
        {/* Eyebrow pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-6000/20 bg-primary-6000/10 dark:bg-primary-6000/20 text-primary-700 dark:text-primary-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary-6000 animate-pulse" />
          <SparklesIcon className="w-4 h-4 text-primary-6000" />
          <span>Enterprise Multi-Tenant eCommerce SaaS</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-[1.15]">
          Launch your eCommerce store{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-6000 via-indigo-600 to-cyan-500">
            without technical complexity
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 text-base sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          Get fully isolated multi-tenant architecture, dedicated Store Admin & Super Admin panels, fast Next.js hosting, Cloudinary media optimization, and 4 production-ready starter themes — all on a growth-aligned commission model.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={"/book-demo" as any}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary-6000 via-indigo-600 to-indigo-700 text-white font-bold text-base shadow-xl shadow-primary-6000/25 hover:shadow-primary-6000/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <span>Book a Personalized Demo</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>

          <Link
            href={"/pricing" as any}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm text-neutral-800 dark:text-neutral-200 font-semibold text-base hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:-translate-y-0.5 transition-all shadow-sm"
          >
            View Pricing Model
          </Link>
        </div>

        {/* Key Trust Highlights */}
        <div className="mt-12 pt-10 border-t border-neutral-200/60 dark:border-neutral-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50">
            <ShieldCheckIcon className="w-5 h-5 text-primary-6000 shrink-0" />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Data Isolation</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50">
            <CloudIcon className="w-5 h-5 text-indigo-500 shrink-0" />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Cloudinary CDN</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50">
            <BoltIcon className="w-5 h-5 text-cyan-500 shrink-0" />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Next.js Speed</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50">
            <SparklesIcon className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">4 Instant Themes</span>
          </div>
        </div>
      </div>
    </section>
  );
}

