import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import HeroSection from "@/components/marketing/HeroSection";
import FeatureGrid from "@/components/marketing/FeatureGrid";
import StatsBand from "@/components/marketing/StatsBand";
import DashboardPreview from "@/components/marketing/DashboardPreview";
import ThemesTeaser from "@/components/marketing/ThemesTeaser";
import VideoPlaceholder from "@/components/marketing/VideoPlaceholder";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";
import FaqTeaser from "@/components/marketing/FaqTeaser";
import PricingTeaser from "@/components/marketing/PricingTeaser";
import CallSchedulingSection from "@/components/marketing/CallSchedulingSection";

export const metadata: Metadata = {
  title: "Tradez Glint Platform — Enterprise Multi-Tenant eCommerce SaaS",
  description:
    "Launch and run your own online store on an enterprise-grade, multi-tenant eCommerce platform with dedicated Store Admin and Super Admin control, fast hosting, and a commission-based pricing model.",
  openGraph: {
    title: "Tradez Glint Platform — Enterprise Multi-Tenant eCommerce SaaS",
    description:
      "Launch and run your own online store on an enterprise-grade, multi-tenant eCommerce platform with dedicated Store Admin and Super Admin control.",
    url: "/",
    siteName: "Tradez Glint",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tradez Glint Platform — Enterprise Multi-Tenant eCommerce SaaS",
    description:
      "Launch and run your own online store on an enterprise-grade, multi-tenant eCommerce platform.",
  },
  alternates: { canonical: "/" },
};

export default function PlatformHomePage() {
  return (
    <div className="space-y-4">
      <HeroSection />
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

