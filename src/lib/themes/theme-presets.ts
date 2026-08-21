import { PLACEHOLDER_IMAGE_URL } from "@/lib/images/config";
import type { Theme } from "@/types/theme";
import type { NavItem } from "@/types/nav";
import type { HomepageSectionType, HomepageSectionConfig } from "@/types/homepage-section";
import type { Banner } from "@/types/banner";
import type { Testimonial } from "@/types/testimonial";
import type { FaqItem } from "@/types/faq";
import type { AnnouncementBar } from "@/types/announcement-bar";

export type ThemePresetKey = "modern-commerce" | "fashion-pro" | "food-express" | "universal-premium";

export interface ThemePresetHomepageSection {
  type: HomepageSectionType;
  title: string;
  order: number;
  config: HomepageSectionConfig;
}

type SeedBanner = Omit<Banner, "id" | "createdAt" | "updatedAt">;
type SeedTestimonial = Omit<Testimonial, "id" | "createdAt" | "updatedAt">;
type SeedFaq = Omit<FaqItem, "id" | "createdAt" | "updatedAt">;
type SeedAnnouncementBar = Omit<AnnouncementBar, "id" | "createdAt" | "updatedAt">;

export interface ThemePreset {
  key: ThemePresetKey;
  name: string;
  description: string;
  suitableFor: string[];
  /** Partial overrides merged over DEFAULT_THEME (see theme-installer.ts) - only the
   * fields that actually differ per theme, not a full Theme object. */
  theme: Partial<Pick<Theme, "colors" | "darkColors" | "typography" | "buttons" | "cards" | "header" | "footer">>;
  announcementBar: SeedAnnouncementBar;
  navigation: { header: NavItem[]; footer: NavItem[] };
  homepageSections: ThemePresetHomepageSection[];
  heroBanner: SeedBanner;
  promoBanners: SeedBanner[];
  testimonials: SeedTestimonial[];
  faqs: SeedFaq[];
  legalPages: { privacy: string; terms: string; refund: string };
}

function navItem(name: string, href: string, children?: NavItem[], type?: NavItem["type"]): NavItem {
  return { id: href.replace(/\W+/g, "-") || "home", name, href, children, type };
}

function heroSlide(overrides: Partial<SeedBanner> & Pick<SeedBanner, "title">): SeedBanner {
  return {
    subtitle: "",
    imageDesktop: PLACEHOLDER_IMAGE_URL,
    imageMobile: PLACEHOLDER_IMAGE_URL,
    placement: "hero",
    order: 0,
    isActive: true,
    textAlign: "left",
    animation: "fade",
    ...overrides,
  };
}

function promoSlide(placement: SeedBanner["placement"], overrides: Partial<SeedBanner> & Pick<SeedBanner, "title">): SeedBanner {
  return {
    imageDesktop: PLACEHOLDER_IMAGE_URL,
    placement,
    order: 0,
    isActive: true,
    textAlign: "left",
    ...overrides,
  };
}

const LEGAL_PAGE_BOILERPLATE = {
  privacy: (storeType: string) =>
    `<h2>Privacy Policy</h2><p>This ${storeType} store respects your privacy. Replace this placeholder with your actual privacy policy from the CMS admin.</p>`,
  terms: (storeType: string) =>
    `<h2>Terms &amp; Conditions</h2><p>These are placeholder terms for this ${storeType} store. Replace with your actual terms from the CMS admin.</p>`,
  refund: (storeType: string) =>
    `<h2>Refund Policy</h2><p>Placeholder refund policy for this ${storeType} store. Replace with your actual refund policy from the CMS admin.</p>`,
};

/** Every theme includes the same required section list (hero, collections, featured
 * products, on-sale, promo, brands, testimonials, newsletter, social gallery) - only the
 * copy/config differs per preset, never the section types themselves. */
function standardHomepageSections(opts: {
  featuredCategoriesHeading?: string;
  featuredProductsHeading?: string;
  onSaleHeading?: string;
  socialGalleryHeading?: string;
}): ThemePresetHomepageSection[] {
  return [
    { type: "hero", title: "Hero", order: 0, config: {} },
    {
      type: "discoverMore",
      title: "Discover More",
      order: 1,
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
    { type: "newArrivals", title: "New Arrivals", order: 2, config: { heading: opts.featuredProductsHeading || "New Arrivals", subHeading: "REY BUY WITH ALL DISCOUNT COUPON", mode: "auto", limit: 8 } },
    {
      type: "howItWork",
      title: "How It Works",
      order: 3,
      config: {
        items: [
          { id: "1", icon: "🔍", title: "Filter & Discover", subtitle: "Smart filtering and search" },
          { id: "2", icon: "🛍️", title: "Add to bag", subtitle: "Easily select and add items" },
          { id: "3", icon: "📦", title: "Fast shipping", subtitle: "Worldwide delivery options" },
          { id: "4", icon: "✨", title: "Enjoy the product", subtitle: "Quality guaranteed" },
        ],
      },
    },
    { type: "promo", title: "Earn Free Money", order: 4, config: { variant: 1 } },
    { type: "exploreGrid", title: "Start Exploring", order: 5, config: { heading: "Start exploring", mode: "auto", limit: 6 } },
    { type: "bestSellers", title: "Best Sellers", order: 6, config: { heading: "Best Sellers", subHeading: "BEST SELLERS OF THE MONTH", mode: "auto", limit: 8 } },
    { type: "promo", title: "Special Offer", order: 7, config: { variant: 2 } },
    { type: "largeProductSlider", title: "Chosen by Our Experts", order: 8, config: { heading: "CHOSEN BY OUR EXPERTS", mode: "auto", limit: 3 } },
    { type: "collections", title: "Shop by Department", order: 9, config: { heading: opts.featuredCategoriesHeading || "Shop by department", mode: "auto" } },
    { type: "promo", title: "Don't Miss Out", order: 10, config: { variant: 3 } },
    { type: "featureItemsGrid", title: "What's Trending Now", order: 11, config: { heading: "What's trending now", subHeading: "DISCOVER MORE PRODUCTS", mode: "auto", limit: 8 } },
    { type: "blog", title: "The Latest News", order: 12, config: { heading: "The latest news", subHeading: "FROM THE CISECO BLOG", limit: 4 } },
    { type: "testimonials", title: "What People Are Saying", order: 13, config: { heading: "What People Are Saying", subHeading: "HAPPY CUSTOMERS" } },
    { type: "newsletter", title: "Join our newsletter 📦", order: 14, config: { heading: "Join our newsletter 📦" } },
  ];
}

const MODERN_COMMERCE: ThemePreset = {
  key: "modern-commerce",
  name: "Modern Commerce",
  description: "Clean, tech-forward theme for electronics, mobile, computers, and accessories.",
  suitableFor: ["Electronics", "Mobile", "Computer", "Accessories", "Minimal", "Premium"],
  theme: {
    colors: {
      primary: "#2563eb",
      secondary: "#0f172a",
      accent: "#06b6d4",
      success: "#16a34a",
      warning: "#eab308",
      danger: "#dc2626",
      info: "#2563eb",
      background: "#ffffff",
      surface: "#f8fafc",
      card: "#ffffff",
      border: "#e2e8f0",
      heading: "#0f172a",
      text: "#1e293b",
      mutedText: "#64748b",
      headerBackground: "#ffffff",
      footerBackground: "#0f172a",
      topBarBackground: "#0f172a",
      buttonBackground: "#2563eb",
      buttonHoverBackground: "#1d4ed8",
      buttonText: "#ffffff",
      link: "#2563eb",
      linkHover: "#1d4ed8",
      badgeSale: "#dc2626",
      badgeNew: "#06b6d4",
      badgeOutOfStock: "#64748b",
    },
    typography: { headingFont: "inter", bodyFont: "inter", baseFontSizePx: 16, lineHeight: 1.5, letterSpacingPx: 0, headingWeight: 700, bodyWeight: 400, buttonWeight: 600 },
    buttons: { radius: "sm", heightPx: 46, shadow: "sm", hoverEffect: "lift", border: false, paddingX: 20, paddingY: 12, transitionSpeed: "fast" },
    header: { sticky: true, transparent: false, heightPx: 80, shadow: "sm", showSearch: true, showWishlist: true, showCompare: true, showAccount: true, showCart: true, topBar: { enabled: true, showSocialIcons: false } },
  },
  announcementBar: {
    title: "Free shipping on orders over $50",
    subtitle: "Latest tech, delivered fast.",
    textColor: "#ffffff",
    backgroundColor: "#0f172a",
    autoScroll: false,
    isClosable: true,
    showOnDesktop: true,
    showOnMobile: true,
    priority: 1,
    isActive: true,
    order: 0,
  },
  navigation: {
    header: [
      navItem("Home", "/"),
      navItem(
        "Shop",
        "/search",
        [
          navItem("Electronics", "/category/electronics"),
          navItem("Mobile", "/category/mobile"),
          navItem("Computers", "/category/computers"),
          navItem("Accessories", "/category/accessories"),
        ],
        "megaMenu"
      ),
      navItem("Deals", "/collection"),
      navItem("Contact", "/contact"),
    ],
    footer: [navItem("About", "/about"), navItem("Contact", "/contact"), navItem("FAQ", "/pages/faq"), navItem("Privacy Policy", "/privacy"), navItem("Terms & Conditions", "/terms"), navItem("Refund Policy", "/refund")],
  },
  homepageSections: standardHomepageSections({
    featuredCategoriesHeading: "Shop by Category",
    featuredProductsHeading: "Featured Tech",
    onSaleHeading: "Special Offers",
    socialGalleryHeading: "Follow @ModernCommerce",
  }),
  heroBanner: heroSlide({ title: "Next-gen tech, today.", subtitle: "Premium electronics and accessories.", ctaText: "Shop Now", ctaHref: "/search" }),
  promoBanners: [
    promoSlide("promo1", { title: "Latest Mobile Phones", ctaText: "Explore", ctaHref: "/category/mobile" }),
    promoSlide("promo2", { title: "Build Your Dream PC", ctaText: "Explore", ctaHref: "/category/computers" }),
  ],
  testimonials: [
    { clientName: "Alex Chen", content: "Fast shipping and the electronics are exactly as described. Great store!", rating: 5, order: 0, isActive: true },
    { clientName: "Priya Nair", content: "Best place for computer accessories. Will order again.", rating: 5, order: 1, isActive: true },
  ],
  faqs: [
    { question: "What is your shipping time?", answer: "Most orders ship within 1-2 business days.", order: 0, isActive: true },
    { question: "Do you offer warranty on electronics?", answer: "Yes, manufacturer warranty applies to all electronics.", order: 1, isActive: true },
  ],
  legalPages: { privacy: LEGAL_PAGE_BOILERPLATE.privacy("electronics"), terms: LEGAL_PAGE_BOILERPLATE.terms("electronics"), refund: LEGAL_PAGE_BOILERPLATE.refund("electronics") },
};

const FASHION_PRO: ThemePreset = {
  key: "fashion-pro",
  name: "Fashion Pro",
  description: "Elegant, editorial theme for clothing, shoes, beauty, and jewelry.",
  suitableFor: ["Clothing", "Shoes", "Beauty", "Jewelry", "Luxury"],
  theme: {
    colors: {
      primary: "#111111",
      secondary: "#b8860b",
      accent: "#b8860b",
      success: "#16a34a",
      warning: "#d97706",
      danger: "#b91c1c",
      info: "#111111",
      background: "#ffffff",
      surface: "#faf9f7",
      card: "#ffffff",
      border: "#e7e2da",
      heading: "#111111",
      text: "#262626",
      mutedText: "#6b6b6b",
      headerBackground: "#ffffff",
      footerBackground: "#111111",
      topBarBackground: "#111111",
      buttonBackground: "#111111",
      buttonHoverBackground: "#b8860b",
      buttonText: "#ffffff",
      link: "#111111",
      linkHover: "#b8860b",
      badgeSale: "#b91c1c",
      badgeNew: "#b8860b",
      badgeOutOfStock: "#6b6b6b",
    },
    typography: { headingFont: "playfairDisplay", bodyFont: "lato", baseFontSizePx: 16, lineHeight: 1.6, letterSpacingPx: 0.2, headingWeight: 600, bodyWeight: 400, buttonWeight: 500 },
    buttons: { radius: "none", heightPx: 48, shadow: "none", hoverEffect: "none", border: true, paddingX: 28, paddingY: 14, transitionSpeed: "slow" },
    header: { sticky: true, transparent: true, heightPx: 88, shadow: "none", showSearch: true, showWishlist: true, showCompare: false, showAccount: true, showCart: true, topBar: { enabled: false, showSocialIcons: true } },
  },
  announcementBar: {
    title: "New Season Collection Now Available",
    textColor: "#ffffff",
    backgroundColor: "#111111",
    autoScroll: true,
    isClosable: true,
    showOnDesktop: true,
    showOnMobile: true,
    priority: 1,
    isActive: true,
    order: 0,
  },
  navigation: {
    header: [
      navItem("Home", "/"),
      navItem(
        "Shop",
        "/search",
        [
          navItem("Clothing", "/category/clothing"),
          navItem("Shoes", "/category/shoes"),
          navItem("Beauty", "/category/beauty"),
          navItem("Jewelry", "/category/jewelry"),
        ],
        "megaMenu"
      ),
      navItem("Collections", "/collection"),
      navItem("About", "/about"),
    ],
    footer: [navItem("About", "/about"), navItem("Contact", "/contact"), navItem("FAQ", "/pages/faq"), navItem("Privacy Policy", "/privacy"), navItem("Terms & Conditions", "/terms"), navItem("Refund Policy", "/refund")],
  },
  homepageSections: standardHomepageSections({
    featuredCategoriesHeading: "Shop the Edit",
    featuredProductsHeading: "Curated For You",
    onSaleHeading: "Limited-Time Offers",
    socialGalleryHeading: "As Seen On Instagram",
  }),
  heroBanner: heroSlide({ title: "Timeless style, redefined.", subtitle: "The new season collection.", ctaText: "Discover", ctaHref: "/search", textAlign: "center" }),
  promoBanners: [
    promoSlide("promo1", { title: "New Arrivals in Jewelry", ctaText: "Shop Jewelry", ctaHref: "/category/jewelry" }),
    promoSlide("promo2", { title: "Beauty Essentials", ctaText: "Shop Beauty", ctaHref: "/category/beauty" }),
  ],
  testimonials: [
    { clientName: "Sofia Marchetti", content: "The quality is exceptional and the packaging feels so luxurious.", rating: 5, order: 0, isActive: true },
    { clientName: "Amara Okafor", content: "My go-to store for statement jewelry pieces.", rating: 5, order: 1, isActive: true },
  ],
  faqs: [
    { question: "What is your return policy?", answer: "Returns are accepted within 30 days in original condition.", order: 0, isActive: true },
    { question: "Do you ship internationally?", answer: "Yes, we ship worldwide.", order: 1, isActive: true },
  ],
  legalPages: { privacy: LEGAL_PAGE_BOILERPLATE.privacy("fashion"), terms: LEGAL_PAGE_BOILERPLATE.terms("fashion"), refund: LEGAL_PAGE_BOILERPLATE.refund("fashion") },
};

const FOOD_EXPRESS: ThemePreset = {
  key: "food-express",
  name: "Food Express",
  description: "Warm, appetite-driving theme for restaurants, pizza, burgers, bakeries, and grocery.",
  suitableFor: ["Restaurant", "Pizza", "Burger", "Bakery", "Grocery"],
  theme: {
    colors: {
      primary: "#dc2626",
      secondary: "#f97316",
      accent: "#f97316",
      success: "#16a34a",
      warning: "#eab308",
      danger: "#dc2626",
      info: "#f97316",
      background: "#ffffff",
      surface: "#fff7ed",
      card: "#ffffff",
      border: "#fed7aa",
      heading: "#1c1917",
      text: "#292524",
      mutedText: "#78716c",
      headerBackground: "#ffffff",
      footerBackground: "#1c1917",
      topBarBackground: "#dc2626",
      buttonBackground: "#dc2626",
      buttonHoverBackground: "#b91c1c",
      buttonText: "#ffffff",
      link: "#dc2626",
      linkHover: "#b91c1c",
      badgeSale: "#dc2626",
      badgeNew: "#f97316",
      badgeOutOfStock: "#78716c",
    },
    typography: { headingFont: "nunito", bodyFont: "nunito", baseFontSizePx: 16, lineHeight: 1.5, letterSpacingPx: 0, headingWeight: 800, bodyWeight: 400, buttonWeight: 700 },
    buttons: { radius: "full", heightPx: 48, shadow: "md", hoverEffect: "scale", border: false, paddingX: 24, paddingY: 14, transitionSpeed: "fast" },
    header: { sticky: true, transparent: false, heightPx: 76, shadow: "sm", showSearch: true, showWishlist: false, showCompare: false, showAccount: true, showCart: true, topBar: { enabled: true, showSocialIcons: false } },
  },
  announcementBar: {
    title: "Free delivery on your first order",
    subtitle: "Order now, fresh and fast.",
    textColor: "#ffffff",
    backgroundColor: "#dc2626",
    autoScroll: false,
    isClosable: true,
    showOnDesktop: true,
    showOnMobile: true,
    priority: 1,
    isActive: true,
    order: 0,
  },
  navigation: {
    header: [
      navItem("Home", "/"),
      navItem(
        "Menu",
        "/search",
        [
          navItem("Pizza", "/category/pizza"),
          navItem("Burgers", "/category/burgers"),
          navItem("Bakery", "/category/bakery"),
          navItem("Grocery", "/category/grocery"),
        ],
        "megaMenu"
      ),
      navItem("Offers", "/collection"),
      navItem("Contact", "/contact"),
    ],
    footer: [navItem("About", "/about"), navItem("Contact", "/contact"), navItem("FAQ", "/pages/faq"), navItem("Privacy Policy", "/privacy"), navItem("Terms & Conditions", "/terms"), navItem("Refund Policy", "/refund")],
  },
  homepageSections: standardHomepageSections({
    featuredCategoriesHeading: "Order by Category",
    featuredProductsHeading: "Popular Right Now",
    onSaleHeading: "Today's Deals",
    socialGalleryHeading: "Tag Us @FoodExpress",
  }),
  heroBanner: heroSlide({ title: "Delicious food, delivered fast.", subtitle: "Fresh ingredients, made to order.", ctaText: "Order Now", ctaHref: "/search" }),
  promoBanners: [
    promoSlide("promo1", { title: "Buy 1 Get 1 on Pizza", ctaText: "Order Pizza", ctaHref: "/category/pizza" }),
    promoSlide("promo2", { title: "Fresh Baked Daily", ctaText: "Shop Bakery", ctaHref: "/category/bakery" }),
  ],
  testimonials: [
    { clientName: "Marco Rossi", content: "Always hot and fresh when it arrives. Best delivery in town.", rating: 5, order: 0, isActive: true },
    { clientName: "Layla Hassan", content: "The bakery items are incredible - order the sourdough!", rating: 5, order: 1, isActive: true },
  ],
  faqs: [
    { question: "How long does delivery take?", answer: "Most orders arrive within 30-45 minutes.", order: 0, isActive: true },
    { question: "Do you cater for allergies?", answer: "Please note any allergies in your order and we'll accommodate where possible.", order: 1, isActive: true },
  ],
  legalPages: { privacy: LEGAL_PAGE_BOILERPLATE.privacy("food"), terms: LEGAL_PAGE_BOILERPLATE.terms("food"), refund: LEGAL_PAGE_BOILERPLATE.refund("food") },
};

const UNIVERSAL_PREMIUM: ThemePreset = {
  key: "universal-premium",
  name: "Universal Premium",
  description: "Versatile, balanced theme suitable for any ecommerce business.",
  suitableFor: ["Any ecommerce business"],
  // Intentionally close to the platform's existing DEFAULT_THEME - the safe, versatile fallback.
  theme: {
    header: { sticky: true, transparent: false, heightPx: 80, shadow: "none", showSearch: true, showWishlist: true, showCompare: true, showAccount: true, showCart: true, topBar: { enabled: false, showSocialIcons: true } },
  },
  announcementBar: {
    title: "Welcome to our store",
    textColor: "#f8fafc",
    backgroundColor: "#111827",
    autoScroll: false,
    isClosable: true,
    showOnDesktop: true,
    showOnMobile: true,
    priority: 1,
    isActive: true,
    order: 0,
  },
  navigation: {
    header: [
      navItem("Home", "/"),
      navItem("Shop", "/search", [navItem("New Arrivals", "/collection"), navItem("Best Sellers", "/collection-2")], "megaMenu"),
      navItem("About", "/about"),
      navItem("Contact", "/contact"),
    ],
    footer: [navItem("About", "/about"), navItem("Contact", "/contact"), navItem("FAQ", "/pages/faq"), navItem("Privacy Policy", "/privacy"), navItem("Terms & Conditions", "/terms"), navItem("Refund Policy", "/refund")],
  },
  homepageSections: standardHomepageSections({
    featuredCategoriesHeading: "Shop by Category",
    featuredProductsHeading: "Featured Products",
    onSaleHeading: "Special Offers",
    socialGalleryHeading: "Follow Us",
  }),
  heroBanner: heroSlide({
    title: "Timeless style, redefined.",
    subtitle: "In this season, find the best 🔥",
    description: "For men, women & kids. Exclusive items crafted for everyday elegance.",
    ctaText: "Shop Now",
    ctaHref: "/search",
    offerText: "Limited-time offers available",
    discountText: "Up to 50% Off",
  }),
  promoBanners: [
    promoSlide("promo1", {
      title: "New Arrivals in Jewelry",
      subtitle: "EXCLUSIVELY FOR YOU",
      description: "Discover handcrafted statement pieces designed for timeless elegance.",
      ctaText: "EXPLORE COLLECTION",
      ctaHref: "/collection",
    }),
    promoSlide("promo2", {
      title: "Beauty Essentials",
      subtitle: "LIMITED STOCK",
      description: "Curated skincare and beauty products selected by industry experts.",
      ctaText: "SHOP CATEGORY",
      ctaHref: "/collection-2",
    }),
  ],
  testimonials: [
    { clientName: "Jordan Smith", content: "Great products and excellent customer service.", rating: 5, order: 0, isActive: true },
  ],
  faqs: [
    { question: "What payment methods do you accept?", answer: "We accept cash on delivery and bank transfer.", order: 0, isActive: true },
  ],
  legalPages: { privacy: LEGAL_PAGE_BOILERPLATE.privacy("general"), terms: LEGAL_PAGE_BOILERPLATE.terms("general"), refund: LEGAL_PAGE_BOILERPLATE.refund("general") },
};

export const THEME_PRESETS: Record<ThemePresetKey, ThemePreset> = {
  "modern-commerce": MODERN_COMMERCE,
  "fashion-pro": FASHION_PRO,
  "food-express": FOOD_EXPRESS,
  "universal-premium": UNIVERSAL_PREMIUM,
};

export function getThemePreset(key: ThemePresetKey | undefined): ThemePreset {
  return (key && THEME_PRESETS[key]) || THEME_PRESETS["universal-premium"];
}
