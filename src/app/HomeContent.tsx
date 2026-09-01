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
  const { heading, subHeading, limit, columns, showProductCount, viewAllText, viewAllHref, cardVariant } = section.config;
  const presetId = themeConfig.presetId;
  const baseProductCardSettings = themeConfig.productCard;
  const productCardSettings = cardVariant && cardVariant !== "default"
    ? { ...baseProductCardSettings, variant: cardVariant as any }
    : baseProductCardSettings;

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

const DEFAULT_HOMEPAGE_SECTIONS_FALLBACK: HomepageSection[] = [
  { id: "s1", type: "hero", title: "Hero Slider", isActive: true, order: 1, config: {} },
  { id: "s2", type: "onSale", title: "On Sale", isActive: true, order: 2, config: { heading: "On Sale", mode: "auto", limit: 8, cardVariant: "deal-card" } },
  { id: "s3", type: "bestSellers", title: "Best Sellers", isActive: true, order: 3, config: { heading: "Best Sellers", subHeading: "BEST SELLERS OF THE MONTH", mode: "auto", limit: 8 } },
  { id: "s4", type: "blog", title: "Latest Blog", isActive: true, order: 4, config: { heading: "The Latest News", subHeading: "FROM THE BLOG", limit: 4 } },
  { id: "s5", type: "newArrivals", title: "New Arrivals", isActive: true, order: 5, config: { heading: "New Arrivals", subHeading: "DISCOVER LATEST ARRIVALS", mode: "auto", limit: 8 } },
  {
    id: "s6",
    type: "howItWork",
    title: "How It Works",
    isActive: true,
    order: 6,
    config: {
      items: [
        { id: "1", icon: "🔍", title: "Filter & Discover", subtitle: "Smart filtering and search" },
        { id: "2", icon: "🛍️", title: "Add to bag", subtitle: "Easily select and add items" },
        { id: "3", icon: "📦", title: "Fast shipping", subtitle: "Worldwide delivery options" },
        { id: "4", icon: "✨", title: "Enjoy the product", subtitle: "Quality guaranteed" },
      ],
    },
  },
  { id: "s7", type: "largeProductSlider", title: "Large Product Slider", isActive: true, order: 7, config: { heading: "CHOSEN BY OUR EXPERTS", mode: "auto", limit: 3 } },
  { id: "s8", type: "featuredProducts", title: "Featured Products", isActive: true, order: 8, config: { heading: "Featured Products", subHeading: "Top handpicked items", mode: "auto", limit: 8 } },
  { id: "s9", type: "collections", title: "Shop by Category", isActive: true, order: 9, config: { heading: "Shop by Category", mode: "auto" } },
  {
    id: "s10",
    type: "socialGallery",
    title: "Social Gallery",
    isActive: true,
    order: 10,
    config: {
      heading: "Follow Us On Instagram",
      items: [
        { id: "1", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80", href: "#" },
        { id: "2", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", href: "#" },
        { id: "3", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80", href: "#" },
        { id: "4", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80", href: "#" },
        { id: "5", image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80", href: "#" },
      ],
    },
  },
  { id: "s11", type: "brands", title: "Brands", isActive: true, order: 11, config: { heading: "Top Featured Brands" } },
  { id: "s12", type: "newsletter", title: "Newsletter", isActive: true, order: 12, config: { heading: "Join our newsletter 📦" } },
  { id: "s13", type: "testimonials", title: "Testimonials", isActive: true, order: 13, config: { heading: "What People Are Saying", subHeading: "HAPPY CUSTOMERS" } },
  { id: "s14", type: "featureItemsGrid", title: "Feature Items Grid", isActive: true, order: 14, config: { heading: "What's trending now", subHeading: "DISCOVER MORE PRODUCTS", mode: "auto", limit: 8 } },
  { id: "s15", type: "promo", title: "Promo Banner", isActive: true, order: 15, config: { variant: 1 } },
  {
    id: "s16",
    type: "discoverMore",
    title: "Discover More Slider",
    isActive: true,
    order: 16,
    config: {
      heading: "Discover more",
      subHeading: "Good things are waiting for you",
      items: [
        { id: "1", title: "Explore new arrivals", subtitle: "Give the gift of choice", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80", href: "/collection" },
        { id: "2", title: "Digital gift cards", subtitle: "Give the gift of choice", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", href: "/collection-2" },
        { id: "3", title: "Sale collection", subtitle: "Up to 80% off", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80", href: "/search" },
      ],
    },
  },
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

  const rawSections = await getActiveHomepageSections();
  const sections = rawSections.length ? rawSections : DEFAULT_HOMEPAGE_SECTIONS_FALLBACK;

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
    <main className={`relative overflow-hidden nc-PageHome ${themeContainerClass}`}>
      {renderHero()}

      <div className="container relative my-16 space-y-16 lg:space-y-24 lg:my-24">
        {renderedSections}
      </div>
    </main>
  );
}
