'use client';
import React from 'react';
import SectionHowItWork from '@/components/SectionHowItWork/SectionHowItWork';
import BackgroundSection from '@/components/BackgroundSection/BackgroundSection';
import SectionPromo1 from '@/components/SectionPromo1';
import SectionHero2 from '@/components/SectionHero/SectionHero2';
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct';
import SectionSliderProductCard from '@/components/SectionSliderProductCard';
// import DiscoverMoreSlider from '@/components/DiscoverMoreSlider';
import SectionGridMoreExplore from '@/components/SectionGridMoreExplore/SectionGridMoreExplore';
import SectionPromo2 from '@/components/SectionPromo2';
import SectionSliderCategories from '@/components/SectionSliderCategories/SectionSliderCategories';
import SectionPromo3 from '@/components/SectionPromo3';
import SectionClientSay from '@/components/SectionClientSay/SectionClientSay';
import Heading from '@/components/Heading/Heading';
import ButtonSecondary from '@/shared/Button/ButtonSecondary';
import { PRODUCTS, SPORT_PRODUCTS } from '@/data/data';
import SectionGridFeatureItems from '@/components/SectionGridFeatureItems';
import SectionMagazine5 from '@/app/blog/SectionMagazine5';
import { useEffect } from 'react';
import { useAppDispatch } from '@/utils/hooks/store';
import {
  getSliderThunk,
  getCategoryThunk,
  getSubCategoryThunk,
} from '@/store/thunks/homePageThunk';
import dynamic from 'next/dynamic';
const DiscoverMoreSlider = dynamic(
  () => import('@/components/DiscoverMoreSlider'),
  {
    ssr: false, // Disable server-side rendering
  }
);

function PageHome() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getSliderThunk());
    dispatch(getCategoryThunk());
    dispatch(getSubCategoryThunk());
  }, []);
  return (
    <div className="relative overflow-hidden nc-PageHome">
      <SectionHero2 />

      <div className="mt-24 lg:mt-32">
        <DiscoverMoreSlider />
      </div>

      <div className="container relative my-24 space-y-24 lg:space-y-32 lg:my-32">
        <SectionSliderProductCard
          data={[
            PRODUCTS[4],
            SPORT_PRODUCTS[5],
            PRODUCTS[7],
            SPORT_PRODUCTS[1],
            PRODUCTS[6],
          ]}
        />

        <div className="py-24 border-t border-b lg:py-32 border-slate-200 dark:border-slate-700">
          <SectionHowItWork />
        </div>
        <SectionPromo1 />

        <div className="relative py-24 lg:py-32">
          <BackgroundSection />
          <SectionGridMoreExplore />
        </div>

        <SectionSliderProductCard
          heading="Best Sellers"
          subHeading="Best selling of the month"
        />

        <SectionPromo2 />

        <SectionSliderLargeProduct cardStyle="style2" />

        <SectionSliderCategories />

        <SectionPromo3 />

        <SectionGridFeatureItems />

        <div className="relative py-24 lg:py-32">
          <BackgroundSection />
          <div>
            <Heading rightDescText="From the Ciseco blog">
              The latest news
            </Heading>
            <SectionMagazine5 />
            <div className="flex justify-center mt-16">
              <ButtonSecondary>Show all blog articles</ButtonSecondary>
            </div>
          </div>
        </div>
        <SectionClientSay />
      </div>
    </div>
  );
}

export default PageHome;
