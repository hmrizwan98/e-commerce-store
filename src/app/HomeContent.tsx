import React from 'react';
import SectionHowItWork from '@/components/SectionHowItWork/SectionHowItWork';
import BackgroundSection from '@/components/BackgroundSection/BackgroundSection';
import SectionPromo1 from '@/components/SectionPromo1';
import SectionHero2 from '@/components/SectionHero/SectionHero2';
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct';
import SectionSliderProductCard from '@/components/SectionSliderProductCard';
import DiscoverMoreSlider from '@/components/DiscoverMoreSliderClient';
import SectionGridMoreExplore from '@/components/SectionGridMoreExplore/SectionGridMoreExplore';
import SectionPromo2 from '@/components/SectionPromo2';
import SectionSliderCategories from '@/components/SectionSliderCategories/SectionSliderCategories';
import SectionPromo3 from '@/components/SectionPromo3';
import SectionClientSay from '@/components/SectionClientSay/SectionClientSay';
import SectionNewsletter from '@/components/SectionNewsletter';
import Heading from '@/components/Heading/Heading';
import ButtonSecondary from '@/shared/Button/ButtonSecondary';
import SectionGridFeatureItems from '@/components/SectionGridFeatureItems';
import SectionMagazine5 from '@/app/blog/SectionMagazine5';
import SectionBrands from '@/components/SectionBrands';
import SectionSocialGallery from '@/components/SectionSocialGallery';
import {
  getFeaturedProducts,
  getNewArrivalProducts,
  getBestSellerProducts,
  getOnSaleProducts,
  getProducts,
  getProductsByIds,
} from '@/lib/firebase/repositories/products';
import { getHomepageCategories, getCategoriesByIds, getCategoryProductCounts } from '@/lib/firebase/repositories/categories';
import { getBannersByPlacement } from '@/lib/firebase/repositories/banners';
import { getActiveHomepageSections } from '@/lib/firebase/repositories/homepage-sections';
import { getActiveTestimonials } from '@/lib/firebase/repositories/testimonials';
import { getBrands } from '@/lib/firebase/repositories/brands';
import { getActiveBlogPosts } from '@/lib/firebase/repositories/blog-posts';
import { toCardCategoryData, toHeroSlide, toExploreType } from '@/lib/firebase/adapters';
import { getCurrentTenant } from '@/lib/tenant/current';
import { isPlatformDomainRequest } from '@/lib/tenant/platform-domain';
import { getActiveThemeConfig } from '@/lib/theme/theme-repository';
import PlatformLayout from './(marketing)/platform/layout';
import PlatformHomePage from './(marketing)/platform/page';
import type { HomepageSection, HomepageTile } from '@/types/homepage-section';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import type { ProductCardThemeConfig } from '@/lib/theme/theme-types';

/** Resolves the auto/manual product list shared by every product-driven section. */
async function resolveProducts(
  config: HomepageSection['config'],
  autoFetch: (limit: number) => Promise<Product[]>,
  defaultLimit: number
): Promise<Product[]> {
  if (config.mode === 'manual' && config.productIds?.length) {
    return getProductsByIds(config.productIds, config.limit ?? config.productIds.length);
  }
  return autoFetch(config.limit ?? defaultLimit);
}

/** Resolves the auto/manual category list shared by exploreGrid/collections. */
async function resolveCategories(config: HomepageSection['config']): Promise<Category[]> {
  if (config.mode === 'manual' && config.categoryIds?.length) {
    return getCategoriesByIds(config.categoryIds);
  }
  return getHomepageCategories();
}

function tilesToDiscoverData(items: HomepageTile[] | undefined) {
  const withImages = (items ?? []).filter((t) => t.image);
  if (!withImages.length) return undefined;
  return withImages.map((t) => ({
    name: t.title ?? '',
    desc: t.subtitle ?? '',
    featuredImage: t.image!,
    href: t.href,
  }));
}

function tilesToHowItWork(items: HomepageTile[] | undefined) {
  const withContent = (items ?? []).filter((t) => t.image || t.icon);
  if (!withContent.length) return undefined;
  return withContent.map((t) => ({
    id: t.id,
    img: t.image,
    imgDark: t.image,
    icon: t.icon,
    title: t.title,
    desc: t.subtitle,
  }));
}

function tilesToGallery(items: HomepageTile[] | undefined) {
  const withImages = (items ?? []).filter((t) => t.image);
  if (!withImages.length) return undefined;
  return withImages.map((t) => ({ image: t.image!, href: t.href }));
}

/**
 * One section's data fetch failing (e.g. a missing Firestore index, a
 * transient network error) must never take down the rest of the homepage -
 * swallow and log, render nothing for that section only.
 */
async function renderSection(section: HomepageSection, productCardSettings?: ProductCardThemeConfig): Promise<JSX.Element | null> {
  try {
    return await renderSectionInner(section, productCardSettings);
  } catch (err) {
    console.error(`Failed to render homepage section "${section.title}" (${section.type}):`, err);
    return null;
  }
}

async function renderSectionInner(section: HomepageSection, productCardSettings?: ProductCardThemeConfig): Promise<JSX.Element | null> {
  const { heading, subHeading, limit, columns, showProductCount, viewAllText, viewAllHref } = section.config;

  switch (section.type) {
    case 'howItWork':
      return (
        <div key={section.id} className="py-24 border-t border-b lg:py-32 border-slate-200 dark:border-slate-700">
          <SectionHowItWork data={tilesToHowItWork(section.config.items)} />
        </div>
      );

    case 'promo': {
      const variant = section.config.variant ?? 1;
      const placement = variant === 2 ? 'promo2' : variant === 3 ? 'promo3' : 'promo1';
      const banners = await getBannersByPlacement(placement);
      const Promo = variant === 2 ? SectionPromo2 : variant === 3 ? SectionPromo3 : SectionPromo1;
      return (
        <div key={section.id}>
          <Promo banner={banners[0]} />
        </div>
      );
    }

    case 'featuredProducts': {
      const products = await resolveProducts(section.config, getFeaturedProducts, 5);
      return (
        <SectionSliderProductCard
          key={section.id}
          heading={heading}
          subHeading={subHeading}
          data={products.length ? products : undefined}
          viewAllText={viewAllText}
          viewAllHref={viewAllHref}
          productCardSettings={productCardSettings}
        />
      );
    }

    case 'newArrivals': {
      const products = await resolveProducts(section.config, getNewArrivalProducts, 8);
      return (
        <SectionSliderProductCard
          key={section.id}
          heading={heading ?? 'New Arrivals'}
          subHeading={subHeading}
          data={products.length ? products : undefined}
          viewAllText={viewAllText}
          viewAllHref={viewAllHref}
          productCardSettings={productCardSettings}
        />
      );
    }

    case 'bestSellers': {
      const products = await resolveProducts(section.config, getBestSellerProducts, 8);
      return (
        <SectionSliderProductCard
          key={section.id}
          heading={heading ?? 'Best Sellers'}
          subHeading={subHeading ?? 'Best selling of the month'}
          data={products.length ? products : undefined}
          viewAllText={viewAllText}
          viewAllHref={viewAllHref}
          productCardSettings={productCardSettings}
        />
      );
    }

    case 'onSale': {
      const products = await resolveProducts(section.config, getOnSaleProducts, 8);
      return (
        <SectionSliderProductCard
          key={section.id}
          heading={heading ?? 'On Sale'}
          subHeading={subHeading}
          data={products.length ? products : undefined}
          viewAllText={viewAllText}
          viewAllHref={viewAllHref}
          productCardSettings={productCardSettings}
        />
      );
    }

    case 'exploreGrid': {
      const categories = (await resolveCategories(section.config)).slice(0, limit ?? 6);
      const counts = showProductCount ? await getCategoryProductCounts(categories.map((c) => c.id)) : {};
      const data = categories.length
        ? categories.map((c) => toExploreType(c, counts[c.id]))
        : undefined;
      const cols = columns ?? 3;
      return (
        <div key={section.id} className="relative py-24 lg:py-32">
          <BackgroundSection />
          <SectionGridMoreExplore data={data} gridClassName={`grid-cols-1 md:grid-cols-2 xl:grid-cols-${cols}`} />
        </div>
      );
    }

    case 'largeProductSlider': {
      const products = await resolveProducts(section.config, getFeaturedProducts, 3);
      return (
        <SectionSliderLargeProduct
          key={section.id}
          cardStyle="style2"
          heading={heading ?? 'Chosen by our experts'}
          data={products}
        />
      );
    }

    case 'collections': {
      const categories = await resolveCategories(section.config);
      const counts = showProductCount ? await getCategoryProductCounts(categories.map((c) => c.id)) : {};
      const cards = categories.map((c) => toCardCategoryData(c, counts[c.id]));
      return (
        <SectionSliderCategories
          key={section.id}
          heading={heading}
          subHeading={subHeading}
          data={cards.length ? cards : undefined}
        />
      );
    }

    case 'featureItemsGrid': {
      const products = await resolveProducts(section.config, getProducts, 8);
      return <SectionGridFeatureItems key={section.id} data={products.length ? products : undefined} />;
    }

    case 'blog': {
      const posts = await getActiveBlogPosts(limit ?? 4);
      return (
        <div key={section.id} className="relative py-24 lg:py-32">
          <BackgroundSection />
          <div>
            <Heading rightDescText="From the Ciseco blog">{heading ?? 'The latest news'}</Heading>
            <SectionMagazine5 posts={posts.length ? posts : undefined} />
            <div className="flex justify-center mt-16">
              <ButtonSecondary href="/blog">Show all blog articles</ButtonSecondary>
            </div>
          </div>
        </div>
      );
    }

    case 'testimonials': {
      const testimonials = await getActiveTestimonials();
      return <SectionClientSay key={section.id} data={testimonials.length ? testimonials : undefined} />;
    }

    case 'brands': {
      const brands = await getBrands();
      return (
        <SectionBrands
          key={section.id}
          heading={heading}
          subHeading={subHeading}
          data={limit ? brands.slice(0, limit) : brands}
        />
      );
    }

    case 'socialGallery':
      return (
        <SectionSocialGallery
          key={section.id}
          heading={heading}
          subHeading={subHeading}
          data={tilesToGallery(section.config.items)}
        />
      );

    case 'newsletter':
      return <SectionNewsletter key={section.id} heading={heading} subHeading={subHeading} />;

    default:
      return null;
  }
}

/**
 * The actual tenant storefront homepage - extracted out of page.tsx so it
 * can also be rendered from the theme customizer's live-preview route
 * (appearance/customize/preview/page.tsx) without importing a route segment
 * file (app/page.tsx) as a plain component, which corrupts Next's typedRoutes
 * route-type generation for unrelated routes. page.tsx itself stays the
 * thin route entry (generateMetadata + this component).
 *
 * productCardSettings is an optional override - the real storefront route
 * (page.tsx) never passes it, so this self-fetches the active theme's own
 * config; the theme customizer's live-preview route passes the DRAFT
 * theme's productCard config instead, so preview reflects unsaved edits.
 */
export interface HomeContentProps {
  productCardSettings?: ProductCardThemeConfig;
}

export default async function HomeContent({ productCardSettings }: HomeContentProps = {}) {
  // No tenant resolves for the bare root domain - show the public SaaS
  // marketing site instead of the tenant storefront homepage. Reuses the
  // existing /platform page/layout directly (no duplicated UI, no new
  // route) - everything below this branch is the pre-existing tenant
  // storefront logic, completely unchanged.
  const tenant = isPlatformDomainRequest() ? null : await getCurrentTenant();
  if (!tenant) {
    return (
      <PlatformLayout>
        <PlatformHomePage />
      </PlatformLayout>
    );
  }

  const resolvedProductCardSettings = productCardSettings ?? (await getActiveThemeConfig()).productCard;

  const sections = await getActiveHomepageSections();

  const heroSection = sections.find((s) => s.type === 'hero');
  const discoverSection = sections.find((s) => s.type === 'discoverMore');
  const restSections = sections.filter((s) => s.type !== 'hero' && s.type !== 'discoverMore');

  const [heroBanners, renderedSections] = await Promise.all([
    heroSection
      ? getBannersByPlacement('hero').catch((err) => {
          console.error('Failed to load hero banners:', err);
          return [];
        })
      : Promise.resolve([]),
    Promise.all(restSections.map((s) => renderSection(s, resolvedProductCardSettings))),
  ]);
  const heroSlides = heroBanners.map(toHeroSlide);

  return (
    <div className="relative overflow-hidden nc-PageHome">
      {heroSection && <SectionHero2 data={heroSlides.length ? heroSlides : undefined} />}

      {discoverSection && (
        <div className="mt-24 lg:mt-32">
          <DiscoverMoreSlider
            heading={discoverSection.config.heading}
            rightDescText={discoverSection.config.subHeading}
            data={tilesToDiscoverData(discoverSection.config.items)}
          />
        </div>
      )}

      <div className="container relative my-24 space-y-24 lg:space-y-32 lg:my-32">
        {renderedSections}
      </div>
    </div>
  );
}
