// NOTE: not yet migrated to Firebase (Phase 2 scope) - the product sections
// below render whatever each component's own default/empty state is, since
// this page no longer imports the legacy PRODUCTS/SPORT_PRODUCTS demo arrays
// (those aren't compatible with ProductCard's canonical Product type
// anymore). See src/app/page.tsx for the real dynamic home page.
import React from "react";
import SectionHowItWork from "@/components/SectionHowItWork/SectionHowItWork";
import BackgroundSection from "@/components/BackgroundSection/BackgroundSection";
import SectionSliderLargeProduct from "@/components/SectionSliderLargeProduct";
import SectionSliderProductCard from "@/components/SectionSliderProductCard";
import SectionGridMoreExplore from "@/components/SectionGridMoreExplore/SectionGridMoreExplore";
import { DEMO_MORE_EXPLORE_DATA_2 } from "@/components/SectionGridMoreExplore/data";
import SectionPromo2 from "@/components/SectionPromo2";
import SectionHero3 from "@/components/SectionHero/SectionHero3";
import SectionPromo1 from "@/components/SectionPromo1";
import SectionGridFeatureItems from "@/components/SectionGridFeatureItems";

// SectionGridFeatureItems -> HeaderFilterSection -> TabFilters reads
// useSearchParams() (Phase 2b filters), which requires either a Suspense
// boundary or opting out of static prerendering - this page can't be
// statically generated anyway once client filter state is in the tree.
export const dynamic = "force-dynamic";

function PageHome2() {
  return (
    <div className="nc-PageHome2 relative overflow-hidden">
      <div className="container px-4">
        <SectionHero3 />
      </div>

      <div className="container relative space-y-24 my-24 lg:space-y-32 lg:my-32">
        <SectionHowItWork />

        {/* SECTION */}
        <SectionSliderProductCard subHeading="New Sports equipment" />

        {/* SECTION */}
        <SectionPromo2 />

        {/* SECTION 3 */}
        <SectionSliderLargeProduct />

        {/* SECTION */}
        <div className="relative py-24 lg:py-32">
          <BackgroundSection />
          <SectionGridMoreExplore data={DEMO_MORE_EXPLORE_DATA_2} />
        </div>

        {/* SECTION */}
        <SectionGridFeatureItems />

        {/* SECTION */}
        <SectionPromo1 />
      </div>
    </div>
  );
}

export default PageHome2;
