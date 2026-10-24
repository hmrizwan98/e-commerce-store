import dynamic from "next/dynamic";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import HeroSection from "@/components/marketing/HeroSection";
import PakistanEcosystemSection from "@/components/marketing/PakistanEcosystemSection";
import FeatureGrid from "@/components/marketing/FeatureGrid";
import Reveal from "@/components/marketing/Reveal";
import { MKT_BTN_INVERSE } from "@/components/marketing/buttons";

const ComparisonMatrix = dynamic(() => import("@/components/marketing/ComparisonMatrix"));
const StatsBand = dynamic(() => import("@/components/marketing/StatsBand"));
const DashboardPreview = dynamic(() => import("@/components/marketing/DashboardPreview"));
const ThemesTeaser = dynamic(() => import("@/components/marketing/ThemesTeaser"));
const VideoPlaceholder = dynamic(() => import("@/components/marketing/VideoPlaceholder"));
const TestimonialsSection = dynamic(() => import("@/components/marketing/TestimonialsSection"));
const FaqTeaser = dynamic(() => import("@/components/marketing/FaqTeaser"));
const PricingTeaser = dynamic(() => import("@/components/marketing/PricingTeaser"));
const CallSchedulingSection = dynamic(() => import("@/components/marketing/CallSchedulingSection"));

export const metadata: Metadata = {
  title: "Webriiz Platform — The Complete Store Builder for Pakistan & Global Brands",
  description:
    "Launch your own online store with Cash on Delivery, bank transfer and JazzCash / EasyPaisa payments, tracking links for 6+ Pakistani couriers (Couriers Next, TCS, PostEx, Trax, Leopards, CallCourier), WhatsApp order updates and your own domain.",
  openGraph: {
    title: "Webriiz Platform — The Complete Store Builder for Pakistan & Global Brands",
    description:
      "Launch your own online store with local payments, 6+ Pakistani courier tracking and WhatsApp order updates. No setup fee, no monthly fee.",
    url: "/",
    siteName: "Webriiz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Webriiz Platform — The Complete Store Builder for Pakistan & Global Brands",
    description:
      "Launch your own online store with local payments, 6+ courier tracking and WhatsApp order updates.",
  },
  alternates: { canonical: "/" },
};

/** Supporting sections fade/slide in as they scroll into view (see Reveal). The hero
 * and the first section stay static so above-the-fold content paints immediately. */
const REVEALED_SECTIONS = [
  ComparisonMatrix,
  FeatureGrid,
  StatsBand,
  DashboardPreview,
  ThemesTeaser,
  VideoPlaceholder,
  TestimonialsSection,
  FaqTeaser,
  PricingTeaser,
  CallSchedulingSection,
];

export default function PlatformHomePage() {
  return (
    <div>
      <HeroSection />
      <PakistanEcosystemSection />
      {REVEALED_SECTIONS.map((Section, i) => (
        <Reveal key={i}>
          <Section />
        </Reveal>
      ))}

      {/* Bottom Conversion Hero Banner */}
      <section className="relative overflow-hidden border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary-6000/30 via-indigo-600/10 to-transparent pointer-events-none" />

        <Reveal className="container relative py-16 lg:py-24 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
            <SparklesIcon className="w-4 h-4 text-amber-400" />
            <span>Ready to start selling online?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            See your future store in action
          </h2>

          <p className="text-base sm:text-lg text-neutral-300 max-w-xl mx-auto leading-relaxed">
            Book a personalized 1-on-1 demo and we&apos;ll show you how to add products, take orders, confirm COD
            orders and share tracking with your customers &mdash; step by step.
          </p>

          <div className="pt-2">
            <Link href={"/book-demo" as any} className={MKT_BTN_INVERSE}>
              <span>Book a Demo Now</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
