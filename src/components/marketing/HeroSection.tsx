import Link from "next/link";
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TruckIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import AnimatedHeadline from "./AnimatedHeadline";
import { MKT_BTN_PRIMARY, MKT_BTN_SECONDARY } from "./buttons";

const HIGHLIGHTS = [
  { icon: GlobeAltIcon, label: "Your own store & domain", color: "text-primary-6000" },
  { icon: TruckIcon, label: "6+ Pakistani couriers", color: "text-indigo-500" },
  { icon: ShieldCheckIcon, label: "COD order verification", color: "text-cyan-500" },
  { icon: ChatBubbleLeftRightIcon, label: "WhatsApp order updates", color: "text-emerald-500" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-24 bg-gradient-to-b from-primary-50/40 via-transparent to-transparent dark:from-neutral-900/50">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-primary-6000/10 via-indigo-500/10 to-cyan-500/10 blur-3xl pointer-events-none -z-10" />

      <div className="container relative max-w-4xl mx-auto text-center px-4">
        {/* Eyebrow pill */}
        <div className="mkt-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-6000/20 bg-primary-6000/10 dark:bg-primary-6000/20 text-primary-700 dark:text-primary-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
          <SparklesIcon className="w-4 h-4 text-primary-6000" />
          <span>The complete online store builder for Pakistani businesses</span>
        </div>

        {/* Headline - word-by-word reveal (see AnimatedHeadline) */}
        <AnimatedHeadline
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-[1.15]"
          segments={[
            { text: "Launch your online store" },
            { text: "with local payments & 6+ courier tracking", gradient: true },
          ]}
        />

        {/* Description */}
        <p
          className="mkt-fade-up mt-6 text-base sm:text-xl text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed"
          style={{ animationDelay: "550ms" }}
        >
          Take Cash on Delivery, bank transfer and JazzCash / EasyPaisa payments, send customers their
          courier tracking link on WhatsApp in one click, and check COD orders before you ship them
          &mdash; all from one simple Store Admin, on your own domain.
        </p>

        {/* CTA Buttons */}
        <div
          className="mkt-fade-up mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          style={{ animationDelay: "700ms" }}
        >
          <Link href={"/book-demo" as any} className={`${MKT_BTN_PRIMARY} w-full sm:w-auto`}>
            <span>Book a Personalized Demo</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>

          <Link href={"/pricing" as any} className={`${MKT_BTN_SECONDARY} w-full sm:w-auto`}>
            View Pricing
          </Link>
        </div>
        <p
          className="mkt-fade-up mt-4 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400"
          style={{ animationDelay: "800ms" }}
        >
          No setup fee and no monthly fee &mdash; you pay a small commission only when you sell.
        </p>

        {/* Key Trust Highlights */}
        <ul
          className="mkt-fade-up mt-10 pt-8 border-t border-neutral-200/60 dark:border-neutral-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left"
          style={{ animationDelay: "900ms" }}
        >
          {HIGHLIGHTS.map(({ icon: Icon, label, color }) => (
            <li
              key={label}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-neutral-900/50 border border-neutral-200/60 dark:border-neutral-800/50"
            >
              <Icon className={`w-5 h-5 shrink-0 ${color}`} />
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
