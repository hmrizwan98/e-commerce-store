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
import JsonLd from '@/components/seo/JsonLd';
import { realImage } from '@/lib/images/real-image';

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
import { activeSectionsInOrder } from '@/lib/theme/page-sections';
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
  // Only tiles the merchant really filled in (an image or a title).
  const activeItems = (items ?? []).filter((t) => t.isActive !== false && (t.image || t.title));
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
  const withImages = (items ?? []).filter((t) => t.image && t.isActive !== false);
  return withImages.map((t) => ({ image: t.image!, href: t.href }));
}

/** Renders one CMS section (also used for sections added to the collection / product pages). */
export async function renderSection(
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
  const { heading, subHeading, limit, columns, showProductCount, viewAllText, viewAllHref, cardVariant } = section.config;
  const presetId = themeConfig.presetId;
  const baseProductCardSettings = themeConfig.productCard;
  const productCardSettings = cardVariant && cardVariant !== "default"
    ? { ...baseProductCardSettings, variant: cardVariant as any }
    : baseProductCardSettings;

  switch (section.type) {
    case 'discoverMore': {
      // Every section below renders ONLY merchant data; nothing to show -> no section (never demo).
      const tiles = tilesToDiscoverData(section.config.items);
      if (!tiles.length) return null;
      return (
        <div key={section.id} className="mt-8 lg:mt-12">
          <DiscoverMoreSlider
            heading={heading}
            rightDescText={subHeading}
            data={tiles}
          />
        </div>
      );
    }

    case 'howItWork': {
      const steps = tilesToHowItWork(section.config.items);
      if (!steps.length) return null;
      return (
        <div key={section.id} className="py-16 border-t border-b lg:py-24 border-slate-200 dark:border-slate-700">
          <SectionHowItWork data={steps} />
        </div>
      );
    }

    case 'promo': {
      const variant = section.config.variant ?? 1;
      const placement = variant === 2 ? 'promo2' : variant === 3 ? 'promo3' : 'promo1';
      const banners = await getBannersByPlacement(placement);
      const dbBanner = banners[0];
      const promoImage = realImage(section.config.imageUrl) || realImage(dbBanner?.imageDesktop);
      const promoTitle = heading || dbBanner?.title;
      // No banner in Store Admin → Promo Banners and no image/heading set on the section: hide it.
      if (!promoImage && !promoTitle) return null;

      const banner = {
        ...dbBanner,
        title: heading || dbBanner?.title,
        subtitle: section.config.badgeText || dbBanner?.subtitle,
        description: subHeading || dbBanner?.description,
        ctaText: section.config.buttonText || dbBanner?.ctaText,
        ctaHref: section.config.buttonHref || dbBanner?.ctaHref,
        ctaText2: section.config.secondaryButtonText || dbBanner?.ctaText2,
        ctaHref2: section.config.secondaryButtonHref || dbBanner?.ctaHref2,
        imageDesktop: promoImage,
        image: promoImage,
        imageMobile: dbBanner?.imageMobile,
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
      if (!products.length) return null;
      return (
        <SectionSliderProductCard
          key={section.id}
          heading={headingText}
          subHeading={subHeading}
          data={products}
          viewAllText={viewAllText}
          viewAllHref={viewAllHref}
          productCardSettings={productCardSettings}
        />
      );
    }

    case 'newArrivals': {
      const headingText = heading || section.title || 'New Arrivals';
      const products = await resolveProducts(section.config, getNewArrivalProducts, 8);
      if (!products.length) return null;
      return (
        <SectionSliderProductCard
          key={section.id}
          heading={headingText}
          subHeading={subHeading}
          data={products}
          viewAllText={viewAllText}
          viewAllHref={viewAllHref}
          productCardSettings={productCardSettings}
        />
      );
    }

    case 'bestSellers': {
      const headingText = heading || section.title || 'Best Sellers';
      const products = await resolveProducts(section.config, getBestSellerProducts, 8);
      if (!products.length) return null;
      return (
        <SectionSliderProductCard
          key={section.id}
          heading={headingText}
          subHeading={subHeading ?? 'Best selling of the month'}
          data={products}
          viewAllText={viewAllText}
          viewAllHref={viewAllHref}
          productCardSettings={productCardSettings}
        />
      );
    }

    case 'onSale': {
      const headingText = heading || section.title || 'On Sale';
      const products = await resolveProducts(section.config, getOnSaleProducts, 8);
      if (!products.length) return null;
      return (
        <SectionSliderProductCard
          key={section.id}
          heading={headingText}
          subHeading={subHeading}
          data={products}
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
      if (!categories.length) return null;
      const data = categories.map((c) => toExploreType(c, counts[c.id]));

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
      if (!products.length) return null;
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
      if (!cards.length) return null;
      return (
        <SectionSliderCategories
          key={section.id}
          heading={headingText}
          subHeading={subHeading}
          data={cards}
        />
      );
    }

    case 'featureItemsGrid': {
      const products = await resolveProducts(section.config, getProducts, limit ?? 8);
      if (!products.length) return null;
      const categories = await resolveCategories(section.config);
      return (
        <SectionGridFeatureItems
          key={section.id}
          heading={heading || section.title || "What's trending now"}
          subHeading={subHeading}
          data={products}
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
      // No published posts -> no blog section at all (it used to show demo articles).
      if (!posts.length) return null;

      const showBtn = section.config.showViewAll ?? true;
      const btnText = section.config.viewAllText || 'Show all blog articles';
      const btnHref = section.config.viewAllHref || '/blog';

      return (
        <div key={section.id} className="relative py-24 lg:py-32">
          <BackgroundSection />
          <div>
            <Heading rightDescText={subHeading}>{heading ?? 'The latest news'}</Heading>
            <SectionMagazine5
              posts={posts}
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
      // Seed samples are already filtered out by the repository; none left -> no section.
      if (!list.length) return null;
      return (
        <SectionClientSay
          key={section.id}
          heading={heading}
          subHeading={subHeading}
          data={list}
        />
      );
    }

    case 'brands': {
      const brands =
        section.config.mode === 'manual' && section.config.brandIds?.length
          ? await getBrandsByIds(section.config.brandIds)
          : await getBrands();
      if (!brands.length) return null;
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
      const gallery = tilesToGallery(section.config.items);
      if (!gallery.length) return null;
      return (
        <SectionSocialGallery
          key={section.id}
          heading={headingText}
          subHeading={subHeading}
          data={gallery}
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

/**
 * Used only when a store has no homepage sections at all. Every entry renders from the store's
 * own data (banners, products, categories, posts, brands, testimonials) and hides itself when
 * that data is empty - no demo tiles, stock photos or invented copy.
 */
const DEFAULT_HOMEPAGE_SECTIONS_FALLBACK: HomepageSection[] = [
  { id: "s1", type: "hero", title: "Hero Slider", isActive: true, order: 1, config: {} },
  { id: "s2", type: "onSale", title: "On Sale", isActive: true, order: 2, config: { heading: "On Sale", mode: "auto", limit: 8, cardVariant: "deal-card" } },
  { id: "s3", type: "bestSellers", title: "Best Sellers", isActive: true, order: 3, config: { heading: "Best Sellers", subHeading: "BEST SELLERS OF THE MONTH", mode: "auto", limit: 8 } },
  { id: "s4", type: "blog", title: "Latest Blog", isActive: true, order: 4, config: { heading: "The Latest News", subHeading: "FROM THE BLOG", limit: 4 } },
  { id: "s5", type: "newArrivals", title: "New Arrivals", isActive: true, order: 5, config: { heading: "New Arrivals", subHeading: "DISCOVER LATEST ARRIVALS", mode: "auto", limit: 8 } },
  { id: "s7", type: "largeProductSlider", title: "Large Product Slider", isActive: true, order: 7, config: { heading: "CHOSEN BY OUR EXPERTS", mode: "auto", limit: 3 } },
  { id: "s8", type: "featuredProducts", title: "Featured Products", isActive: true, order: 8, config: { heading: "Featured Products", subHeading: "Top handpicked items", mode: "auto", limit: 8 } },
  { id: "s9", type: "collections", title: "Shop by Category", isActive: true, order: 9, config: { heading: "Shop by Category", mode: "auto" } },
  { id: "s11", type: "brands", title: "Brands", isActive: true, order: 11, config: { heading: "Top Featured Brands" } },
  { id: "s12", type: "newsletter", title: "Newsletter", isActive: true, order: 12, config: { heading: "Join our newsletter 📦" } },
  { id: "s13", type: "testimonials", title: "Testimonials", isActive: true, order: 13, config: { heading: "What People Are Saying", subHeading: "HAPPY CUSTOMERS" } },
  { id: "s14", type: "featureItemsGrid", title: "Feature Items Grid", isActive: true, order: 14, config: { heading: "What's trending now", subHeading: "DISCOVER MORE PRODUCTS", mode: "auto", limit: 8 } },
  { id: "s15", type: "promo", title: "Promo Banner", isActive: true, order: 15, config: { variant: 1 } },
];

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

  // The editor preview passes the draft theme: its homepageSections (what the admin is editing)
  // are what must show - the live site reads the published sections collection.
  const rawSections = themeConfigOverride?.homepageSections
    ? activeSectionsInOrder(themeConfigOverride.homepageSections)
    : await getActiveHomepageSections();
  const sections = rawSections.length ? rawSections : DEFAULT_HOMEPAGE_SECTIONS_FALLBACK;

  const heroSection = sections.find((s) => s.type === 'hero');
  const restSections = sections.filter((s) => s.type !== 'hero');

  const [heroBanners, renderedSections, heroCategories] = await Promise.all([
    heroSection
      ? getBannersByPlacement('hero').catch((err) => {
          console.error('Failed to load hero banners:', err);
          return [];
        })
      : Promise.resolve([]),
    Promise.all(restSections.map((s) => renderSection(s, themeConfig))),
    // The "tech" hero has a category sidebar - the store's own categories, never a made-up list.
    heroSection && themeConfig.hero?.variant === 'tech'
      ? getHomepageCategories().catch(() => [] as Category[])
      : Promise.resolve([] as Category[]),
  ]);
  // Hero slides = Store Admin → Hero Slides (banners, placement "hero") that have an image.
  const heroSlides = heroBanners.map(toHeroSlide).filter((slide) => Boolean(slide.image));

  const renderHero = () => {
    if (!heroSection || !heroSlides.length) return null;
    return (
      <ThemeHeroAdapter
        heroSettings={themeConfig.hero}
        data={heroSlides}
        presetId={presetId}
        banner={themeConfig.banner}
        categories={heroCategories.map((c) => ({ name: c.name, href: `/category/${c.slug}` }))}
      />
    );
  };

  // Page background/text derive from the theme's own color tokens (CSS
  // variables already injected in layout.tsx) rather than presetId branching.
  const themeContainerClass = 'bg-[var(--background,white)] text-[var(--text,#111827)] min-h-screen';

  return (
    <main className={`relative overflow-hidden nc-PageHome ${themeContainerClass}`}>
      <JsonLd
        type="store"
        name={tenant.slug || "Online Store"}
        url={`https://${tenant.slug}.webriiz.com`}
      />
      {renderHero()}

      {/* Theme "Layout & Container": Section Padding = space above/below the page's sections,
          Section Margin = gap between sections. Phones get 2/3 of it; the default 96px gives
          exactly the old my-16/space-y-16 (phone) and lg:my-24/lg:space-y-24 (desktop). */}
      <div className="container relative my-[calc(var(--section-padding,96px)*2/3)] space-y-[calc(var(--section-margin,96px)*2/3)] lg:space-y-[var(--section-margin,96px)] lg:my-[var(--section-padding,96px)]">
        {renderedSections}
      </div>
    </main>
  );
}
