import Link from "next/link";
import type { Metadata } from "next";
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
    <div>
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

      <section className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <div className="container py-20 lg:py-28 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold">Ready to see it in action?</h2>
          <p className="mt-4 text-neutral-500 dark:text-neutral-400">
            Book a personalized demo and we&apos;ll walk you through Store Admin, Super Admin, and everything in
            between.
          </p>
          <div className="mt-8">
            <Link href={"/book-demo" as any} className="px-6 py-3 rounded-full bg-primary-6000 text-white font-medium">
              Book a Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
