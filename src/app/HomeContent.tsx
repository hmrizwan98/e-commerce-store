import React from 'react';
import SectionHowItWork from '@/components/SectionHowItWork/SectionHowItWork';
import BackgroundSection from '@/components/BackgroundSection/BackgroundSection';
import ThemeHeroAdapter from '@/components/theme/ThemeHeroAdapter';
import ThemeCategoriesAdapter from '@/components/theme/ThemeCategoriesAdapter';
import ThemePromoAdapter from '@/components/theme/ThemePromoAdapter';
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct';
import SectionSliderProductCard from '@/components/SectionSliderProductCard';
import DiscoverMoreSlider from '@/components/DiscoverMoreSliderClient';
import SectionSliderCategories from '@/components/SectionSliderCategories/SectionSliderCategories';
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
import { getActiveTestimonials, getTestimonialsByIds } from '@/lib/firebase/repositories/testimonials';
import { getBrands, getBrandsByIds } from '@/lib/firebase/repositories/brands';
import { getActiveBlogPosts, getBlogPostsByIds } from '@/lib/firebase/repositories/blog-posts';
import { toCardCategoryData, toHeroSlide, toExploreType } from '@/lib/firebase/adapters';
import { getCurrentTenant } from '@/lib/tenant/current';
import { isPlatformDomainRequest } from '@/lib/tenant/platform-domain';
import { getActiveThemeConfig } from '@/lib/theme/theme-repository';
import PlatformLayout from './(marketing)/platform/layout';
import PlatformHomePage from './(marketing)/platform/page';
import type { HomepageSection, HomepageTile } from '@/types/homepage-section';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import type { SystemThemeConfig } from '@/lib/theme/theme-types';

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
  const activeItems = (items ?? []).filter((t) => t.isActive !== false);
  if (!activeItems.length) return undefined;
  return activeItems.map((t) => ({
    name: t.title ?? '',
    desc: t.subtitle ?? '',
    featuredImage: t.image || '',
    color: t.color || 'auto',
    href: t.href || '/collection',
    btnText: t.buttonText || 'Show me all',
    showBtn: t.showButton !== false,
  }));
}

function tilesToHowItWork(items: HomepageTile[] | undefined) {
  const withContent = (items ?? []).filter(
    (t) => t.isActive !== false && (t.image || t.icon || t.title || t.subtitle || t.badge)
  );
  if (!withContent.length) return undefined;
  return withContent.map((t) => ({
    id: t.id,
    img: t.image,
    imgDark: t.image,
    icon: t.icon,
    title: t.title,
    desc: t.subtitle,
    badge: t.badge,
  }));
}

function tilesToGallery(items: HomepageTile[] | undefined) {
  const withImages = (items ?? []).filter((t) => t.image);
  if (!withImages.length) return undefined;
  return withImages.map((t) => ({ image: t.image!, href: t.href }));
}

async function renderSection(
  section: HomepageSection,
  themeConfig: SystemThemeConfig
): Promise<JSX.Element | null> {
  try {
    return await renderSectionInner(section, themeConfig);
  } catch (err) {
    console.error(`Failed to render homepage section "${section.title}" (${section.type}):`, err);
    return null;
  }
}

async function renderSectionInner(
  section: HomepageSection,
  themeConfig: SystemThemeConfig
): Promise<JSX.Element | null> {
  const { heading, subHeading, limit, columns, showProductCount, viewAllText, viewAllHref } = section.config;
  const presetId = themeConfig.presetId;
  const productCardSettings = themeConfig.productCard;

  switch (section.type) {
    case 'discoverMore':
      return (
        <div key={section.id} className="mt-8 lg:mt-12">
          <DiscoverMoreSlider
            heading={heading}
            rightDescText={subHeading}
            data={tilesToDiscoverData(section.config.items)}
          />
        </div>
      );

    case 'howItWork':
      return (
        <div key={section.id} className="py-16 border-t border-b lg:py-24 border-slate-200 dark:border-slate-700">
          <SectionHowItWork data={tilesToHowItWork(section.config.items)} />
        </div>
      );

    case 'promo': {
      const variant = section.config.variant ?? 1;
      const placement = variant === 2 ? 'promo2' : variant === 3 ? 'promo3' : 'promo1';
      const banners = await getBannersByPlacement(placement);
      const dbBanner = banners[0];

      const banner = {
        ...dbBanner,
        title: heading || dbBanner?.title,
        subtitle: section.config.badgeText || dbBanner?.subtitle,
        description: subHeading || dbBanner?.description,
        ctaText: section.config.buttonText || dbBanner?.ctaText,
        ctaHref: section.config.buttonHref || dbBanner?.ctaHref,
        ctaText2: section.config.secondaryButtonText || dbBanner?.ctaText2,
        ctaHref2: section.config.secondaryButtonHref || dbBanner?.ctaHref2,
        imageDesktop: section.config.imageUrl || dbBanner?.imageDesktop,
        image: section.config.imageUrl || dbBanner?.imageDesktop,
      };

      return (
        <ThemePromoAdapter
          key={section.id}
          promoSettings={themeConfig.promo}
          banner={banner}
          presetId={presetId}
          numericVariant={variant}
        />
      );
    }

    case 'featuredProducts': {
      const headingText = heading || section.title || 'Featured Products';
      const products = await resolveProducts(section.config, getFeaturedProducts, 5);
      return (
        <SectionSliderProductCard
          key={section.id}
          heading={headingText}
          subHeading={subHeading}
          data={products.length ? products : undefined}
          viewAllText={viewAllText}
          viewAllHref={viewAllHref}
          productCardSettings={productCardSettings}
        />
      );
    }

    case 'newArrivals': {
      const headingText = heading || section.title || 'New Arrivals';
      const products = await resolveProducts(section.config, getNewArrivalProducts, 8);
      return (
        <SectionSliderProductCard
          key={section.id}
          heading={headingText}
          subHeading={subHeading}
          data={products.length ? products : undefined}
          viewAllText={viewAllText}
          viewAllHref={viewAllHref}
          productCardSettings={productCardSettings}
        />
      );
    }

    case 'bestSellers': {
      const headingText = heading || section.title || 'Best Sellers';
      const products = await resolveProducts(section.config, getBestSellerProducts, 8);
      return (
        <SectionSliderProductCard
          key={section.id}
          heading={headingText}
          subHeading={subHeading ?? 'Best selling of the month'}
          data={products.length ? products : undefined}
          viewAllText={viewAllText}
          viewAllHref={viewAllHref}
          productCardSettings={productCardSettings}
        />
      );
    }

    case 'onSale': {
      const headingText = heading || section.title || 'On Sale';
      const products = await resolveProducts(section.config, getOnSaleProducts, 8);
      return (
        <SectionSliderProductCard
          key={section.id}
          heading={headingText}
          subHeading={subHeading}
          data={products.length ? products : undefined}
          viewAllText={viewAllText}
          viewAllHref={viewAllHref}
          productCardSettings={productCardSettings}
        />
      );
    }

    case 'exploreGrid': {
      const headingText = heading || section.title || 'Shop By Category';
      const categories = (await resolveCategories(section.config)).slice(0, limit ?? 6);
      const counts = showProductCount ? await getCategoryProductCounts(categories.map((c) => c.id)) : {};
      const data = categories.length
        ? categories.map((c) => toExploreType(c, counts[c.id]))
        : undefined;

      return (
        <ThemeCategoriesAdapter
          key={section.id}
          heading={headingText}
          subHeading={subHeading}
          categoriesSettings={themeConfig.categories}
          data={data}
          presetId={presetId}
          columns={columns}
        />
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
      const headingText = heading || section.title || 'Shop by Category';
      const categories = await resolveCategories(section.config);
      const counts = showProductCount ? await getCategoryProductCounts(categories.map((c) => c.id)) : {};
      const cards = categories.map((c) => toCardCategoryData(c, counts[c.id]));
      return (
        <SectionSliderCategories
          key={section.id}
          heading={headingText}
          subHeading={subHeading}
          data={cards.length ? cards : undefined}
        />
      );
    }

    case 'featureItemsGrid': {
      const products = await resolveProducts(section.config, getProducts, limit ?? 8);
      const categories = await resolveCategories(section.config);
      return (
        <SectionGridFeatureItems
          key={section.id}
          heading={heading || section.title || "What's trending now"}
          subHeading={subHeading}
          data={products.length ? products : undefined}
          categories={categories}
          productCardSettings={productCardSettings}
        />
      );
    }

    case 'blog': {
      const posts =
        section.config.mode === 'manual' && section.config.postIds?.length
          ? await getBlogPostsByIds(section.config.postIds)
          : await getActiveBlogPosts(limit ?? 4);

      const showBtn = section.config.showViewAll ?? true;
      const btnText = section.config.viewAllText || 'Show all blog articles';
      const btnHref = section.config.viewAllHref || '/blog';

      return (
        <div key={section.id} className="relative py-24 lg:py-32">
          <BackgroundSection />
          <div>
            <Heading rightDescText={subHeading}>{heading ?? 'The latest news'}</Heading>
            <SectionMagazine5
              posts={posts.length ? posts : undefined}
              showDate={section.config.showDate ?? true}
              showReadMore={section.config.showReadMore ?? true}
              readMoreText={section.config.readMoreText}
            />
            {showBtn && (
              <div className="flex justify-center mt-16">
                <ButtonSecondary href={btnHref as any}>{btnText}</ButtonSecondary>
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'testimonials': {
      const testimonials =
        section.config.mode === 'manual' && section.config.testimonialIds?.length
          ? await getTestimonialsByIds(section.config.testimonialIds)
          : await getActiveTestimonials();
      const list = limit ? testimonials.slice(0, limit) : testimonials;
      return (
        <SectionClientSay
          key={section.id}
          heading={heading}
          subHeading={subHeading}
          data={list.length ? list : undefined}
        />
      );
    }

    case 'brands': {
      const brands =
        section.config.mode === 'manual' && section.config.brandIds?.length
          ? await getBrandsByIds(section.config.brandIds)
          : await getBrands();
      return (
        <SectionBrands
          key={section.id}
          heading={heading}
          subHeading={subHeading}
          data={limit ? brands.slice(0, limit) : brands}
        />
      );
    }

    case 'socialGallery': {
      const headingText = heading || section.title || 'Follow us on Instagram';
      return (
        <SectionSocialGallery
          key={section.id}
          heading={headingText}
          subHeading={subHeading}
          data={tilesToGallery(section.config.items)}
        />
      );
    }

    case 'newsletter':
      return (
        <SectionNewsletter
          key={section.id}
          heading={heading}
          subHeading={subHeading}
          buttonText={section.config.buttonText}
          placeholderText={section.config.placeholderText}
        />
      );

    default:
      return null;
  }
}

export interface HomeContentProps {
  /** Overrides the tenant's active theme - used by the admin theme-customizer preview to render a draft/static preset instead of what's actually live. */
  themeConfig?: SystemThemeConfig;
}

export default async function HomeContent({ themeConfig: themeConfigOverride }: HomeContentProps = {}) {
  const tenant = isPlatformDomainRequest() ? null : await getCurrentTenant();
  if (!tenant) {
    return (
      <PlatformLayout>
        <PlatformHomePage />
      </PlatformLayout>
    );
  }

  const themeConfig = themeConfigOverride ?? (await getActiveThemeConfig());
  const presetId = themeConfig.presetId;

  const sections = await getActiveHomepageSections();

  const heroSection = sections.find((s) => s.type === 'hero');
  const restSections = sections.filter((s) => s.type !== 'hero');

  const [heroBanners, renderedSections] = await Promise.all([
    heroSection
      ? getBannersByPlacement('hero').catch((err) => {
          console.error('Failed to load hero banners:', err);
          return [];
        })
      : Promise.resolve([]),
    Promise.all(restSections.map((s) => renderSection(s, themeConfig))),
  ]);
  const heroSlides = heroBanners.map(toHeroSlide);

  const renderHero = () => {
    if (!heroSection) return null;
    const slides = heroSlides.length ? heroSlides : undefined;

    return (
      <ThemeHeroAdapter heroSettings={themeConfig.hero} data={slides} presetId={presetId} banner={themeConfig.banner} />
    );
  };

  // Page background/text derive from the theme's own color tokens (CSS
  // variables already injected in layout.tsx) rather than presetId branching.
  const themeContainerClass = 'bg-[var(--background,white)] text-[var(--text,#111827)] min-h-screen';

  return (
    <div className={`relative overflow-hidden nc-PageHome ${themeContainerClass}`}>
      {renderHero()}

      <div className="container relative my-16 space-y-16 lg:space-y-24 lg:my-24">
        {renderedSections}
      </div>
    </div>
  );
}
