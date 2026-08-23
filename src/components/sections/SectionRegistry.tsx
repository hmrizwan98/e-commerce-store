"use client";

import React from "react";
import SectionHero2 from "@/components/SectionHero/SectionHero2";
import SectionSliderProductCard from "@/components/SectionSliderProductCard";
import SectionGridFeatureItems from "@/components/SectionGridFeatureItems";
import SectionSliderCategories from "@/components/SectionSliderCategories/SectionSliderCategories";
import SectionBrands from "@/components/SectionBrands";
import SectionClientSay from "@/components/SectionClientSay/SectionClientSay";
import SectionNewsletter from "@/components/SectionNewsletter";
import SectionSocialGallery from "@/components/SectionSocialGallery";
import type { HomepageThemeSectionConfig } from "@/lib/theme/theme-types";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

export interface SectionRegistryProps {
  sections?: HomepageThemeSectionConfig[];
  products?: Product[];
  categories?: Category[];
}

export default function SectionRegistry({ sections, products = [], categories = [] }: SectionRegistryProps) {
  if (!sections || !sections.length) {
    return null;
  }

  const activeSections = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-16 lg:space-y-24">
      {activeSections.map((section) => {
        switch (section.type) {
          case "hero":
            return (
              <div key={section.id} className="container">
                <SectionHero2 />
              </div>
            );
          case "featuredProducts":
          case "newArrivals":
          case "bestSellers":
          case "onSale": {
            const sectionConfig = (section as any).config ?? section;
            const sectionCardVariant = sectionConfig?.cardVariant || section.cardVariant;
            const sectionSettings = sectionCardVariant && sectionCardVariant !== "default"
              ? { variant: sectionCardVariant as any }
              : undefined;

            return (
              <div key={section.id} className="container">
                <SectionSliderProductCard
                  heading={section.heading || sectionConfig?.heading || "Featured Products"}
                  subHeading={section.subHeading || sectionConfig?.subHeading || ""}
                  data={products}
                  productCardSettings={sectionSettings}
                />
              </div>
            );
          }
          case "categories":
          case "exploreGrid":
            return (
              <div key={section.id} className="container">
                <SectionSliderCategories
                  heading={section.heading || "Shop by Category"}
                  subHeading={section.subHeading || "Browse our top collections"}
                />
              </div>
            );
          case "featureItemsGrid": {
            const sectionConfig = (section as any).config ?? section;
            const sectionCardVariant = sectionConfig?.cardVariant || section.cardVariant;
            const sectionSettings = sectionCardVariant && sectionCardVariant !== "default"
              ? { variant: sectionCardVariant as any }
              : undefined;

            return (
              <div key={section.id} className="container">
                <SectionGridFeatureItems
                  heading={section.heading || sectionConfig?.heading || "What's trending now"}
                  subHeading={section.subHeading || sectionConfig?.subHeading || "Discover our top featured collection"}
                  data={products}
                  categories={categories}
                  productCardSettings={sectionSettings}
                />
              </div>
            );
          }
          case "brands":
            return (
              <div key={section.id} className="container">
                <SectionBrands />
              </div>
            );
          case "testimonials":
            return (
              <div key={section.id} className="container">
                <SectionClientSay />
              </div>
            );
          case "newsletter":
            return (
              <div key={section.id} className="container">
                <SectionNewsletter
                  heading={section.heading}
                  subHeading={section.subHeading}
                  buttonText={section.buttonText}
                  placeholderText={section.placeholderText}
                />
              </div>
            );
          case "socialGallery":
            return (
              <div key={section.id} className="container">
                <SectionSocialGallery />
              </div>
            );
          default:
            // Unknown section type fails gracefully
            return null;
        }
      })}
    </div>
  );
}
