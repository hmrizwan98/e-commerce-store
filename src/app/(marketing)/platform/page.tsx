import dynamic from "next/dynamic";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import HeroSection from "@/components/marketing/HeroSection";
import PakistanEcosystemSection from "@/components/marketing/PakistanEcosystemSection";
import FeatureGrid from "@/components/marketing/FeatureGrid";

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
    "Launch and run your own online store on an enterprise-grade multi-tenant platform with native Pakistan couriers tracking (Couriers Next, TCS, PostEx, Trax, Leopards), WhatsApp order updates, JazzCash / EasyPaisa checkout, and Super Admin control.",
  openGraph: {
    title: "Webriiz Platform — The Complete Store Builder for Pakistan & Global Brands",
    description:
      "Launch and run your own online store on an enterprise-grade multi-tenant platform with native Pakistan couriers tracking and 0% hidden transaction fees.",
    url: "/",
    siteName: "Webriiz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Webriiz Platform — The Complete Store Builder for Pakistan & Global Brands",
    description:
      "Launch and run your own online store with local payments, 6+ courier tracking, and Next.js 14 speed.",
  },
  alternates: { canonical: "/" },
};

export default function PlatformHomePage() {
  return (
    <div className="space-y-4">
      <HeroSection />
      <PakistanEcosystemSection />
      <ComparisonMatrix />
      <FeatureGrid />
      <StatsBand />
      <DashboardPreview />
      <ThemesTeaser />
      <VideoPlaceholder />
      <TestimonialsSection />
      <FaqTeaser />
      <PricingTeaser />
      <CallSchedulingSection />

      {/* Bottom Conversion Hero Banner */}
      <section className="relative overflow-hidden border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary-6000/30 via-indigo-600/10 to-transparent pointer-events-none" />

        <div className="container relative py-20 lg:py-28 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
            <SparklesIcon className="w-4 h-4 text-amber-400" />
            <span>Ready to transform your retail experience?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Ready to see the platform in action?
          </h2>

          <p className="text-base sm:text-lg text-neutral-300 max-w-xl mx-auto leading-relaxed">
            Book a personalized 1-on-1 demo and we&apos;ll walk you through Store Admin, Super Admin, and everything in between.
          </p>

          <div className="pt-4">
            <Link
              href={"/book-demo" as any}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-neutral-900 font-extrabold text-base shadow-xl hover:bg-neutral-100 hover:-translate-y-0.5 transition-all"
            >
              <span>Book a Demo Now</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

