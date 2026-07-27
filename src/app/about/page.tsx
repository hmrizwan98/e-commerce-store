import rightImg from "@/images/hero-right1.png";
import React from "react";
import SectionFounder from "./SectionFounder";
import SectionStatistic from "./SectionStatistic";
import BgGlassmorphism from "@/components/BgGlassmorphism/BgGlassmorphism";
import BackgroundSection from "@/components/BackgroundSection/BackgroundSection";
import SectionHero from "./SectionHero";
import SectionClientSay from "@/components/SectionClientSay/SectionClientSay";
import SectionPromo3 from "@/components/SectionPromo3";
import { getActiveTestimonials } from "@/lib/firebase/repositories/testimonials";

export const dynamic = "force-dynamic";

const PageAbout = async () => {
  const testimonials = await getActiveTestimonials();

  return (
    <div className={`nc-PageAbout overflow-hidden relative`}>
      {/* ======== BG GLASS ======== */}
      <BgGlassmorphism />

      <div className="container py-16 lg:py-28 space-y-16 lg:space-y-28">
        <SectionHero
          rightImg={rightImg}
          heading="👋 About Us."
          btnText=""
          subHeading="We’re impartial and independent, and every day we create distinctive, world-class programmes and content which inform, educate and entertain millions of people in the around the world."
        />

        <SectionFounder />
        <div className="relative py-16">
          <BackgroundSection />
          <SectionClientSay data={testimonials.length ? testimonials : undefined} />
        </div>

        <SectionStatistic />

        <SectionPromo3 />
      </div>
    </div>
  );
};

export default PageAbout;
