import React from "react";
import { getActivePageSections } from "@/lib/firebase/repositories/page-sections";
import { getActiveFaqs } from "@/lib/firebase/repositories/faqs";
import { getActiveTestimonials } from "@/lib/firebase/repositories/testimonials";
import { getFeaturedProducts } from "@/lib/firebase/repositories/products";
import { getHomepageCategories } from "@/lib/firebase/repositories/categories";
import { toCardCategoryData } from "@/lib/firebase/adapters";
import AccordionInfo from "@/components/AccordionInfo";
import SectionClientSay from "@/components/SectionClientSay/SectionClientSay";
import SectionNewsletter from "@/components/SectionNewsletter";
import SectionGridFeatureItems from "@/components/SectionGridFeatureItems";
import SectionSliderCategories from "@/components/SectionSliderCategories/SectionSliderCategories";
import PageSectionHero from "@/components/page-sections/PageSectionHero";
import PageSectionImageText from "@/components/page-sections/PageSectionImageText";
import PageSectionCta from "@/components/page-sections/PageSectionCta";
import PageSectionBanner from "@/components/page-sections/PageSectionBanner";
import type { PageSection } from "@/types/page-section";

import type { CmsPage } from "@/types/page";

/**
 * Renders a merchant's CMS page (Store Admin → Pages): its page sections when it has any,
 * otherwise its title + content. Shared by /pages/[slug] and /about. Sections whose data is
 * empty render nothing - never demo content.
 */
async function renderSection(section: PageSection): Promise<JSX.Element | null> {
  switch (section.type) {
    case "hero":
      return <PageSectionHero config={section.config} />;
    case "imageText":
      return <PageSectionImageText config={section.config} />;
    case "cta":
      return <PageSectionCta config={section.config} />;
    case "banner":
      return <PageSectionBanner config={section.config} />;
    case "divider":
      return <div className="h-8 sm:h-16" />;
    case "richText":
      return (
        <div>
          {section.config.heading && <h2 className="text-2xl font-semibold mb-4">{section.config.heading}</h2>}
          {section.config.body && (
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: section.config.body }}
            />
          )}
        </div>
      );
    case "faq": {
      const faqs = await getActiveFaqs();
      const data = faqs.map((f) => ({ name: f.question, content: f.answer }));
      return (
        <div>
          {section.config.heading && <h2 className="text-2xl font-semibold mb-6">{section.config.heading}</h2>}
          {data.length ? <AccordionInfo data={data} /> : <p className="text-neutral-500">No FAQs published yet.</p>}
        </div>
      );
    }
    case "testimonials": {
      const testimonials = await getActiveTestimonials();
      // Real, published testimonials only - no section at all when there are none.
      return testimonials.length ? <SectionClientSay data={testimonials} /> : null;
    }
    case "newsletter":
      return <SectionNewsletter heading={section.config.heading} subHeading={section.config.subHeading} />;
    case "productGrid": {
      const products = await getFeaturedProducts(section.config.limit ?? 8);
      if (!products.length) return null;
      return (
        <div>
          {section.config.heading && <h2 className="text-2xl font-semibold mb-6">{section.config.heading}</h2>}
          <SectionGridFeatureItems data={products} />
        </div>
      );
    }
    case "categoryGrid": {
      const categories = await getHomepageCategories();
      const cards = categories.map((c) => toCardCategoryData(c));
      if (!cards.length) return null;
      return (
        <SectionSliderCategories
          heading={section.config.heading}
          subHeading={section.config.subHeading}
          data={cards}
        />
      );
    }
    default:
      return null;
  }
}

export default async function CmsPageContent({ page }: { page: CmsPage }) {
  const sections = await getActivePageSections(page.id);
  const renderedSections = await Promise.all(sections.map(renderSection));

  return (
    <div className="container py-16 lg:py-24 space-y-16">
      {!sections.length && (
        <>
          <h1 className="text-3xl sm:text-4xl font-semibold">{page.title}</h1>
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
        </>
      )}
      {sections.map((section, index) => (
        <div key={section.id}>{renderedSections[index]}</div>
      ))}
    </div>
  );
}
