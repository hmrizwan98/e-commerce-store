import type { HomepageSectionType } from "@/types/homepage-section";

export interface SectionMeta {
  icon: string;
  label: string;
  description: string;
  contains: string[];
  /** Tailwind classes for the icon badge + left accent border. */
  accent: string;
  border: string;
}

export const SECTION_META: Record<HomepageSectionType, SectionMeta> = {
  hero: {
    icon: "🖼️",
    label: "Hero Slider",
    description: 'The large banner slider at the top of the homepage. Manage the actual slides at Content -> Hero Slides.',
    contains: ["Slides", "Buttons", "Background images"],
    accent: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    border: "border-l-blue-400",
  },
  discoverMore: {
    icon: "🧭",
    label: "Discover More Slider",
    description: "An auto-rotating discovery carousel just under the hero. Edit the cards below.",
    contains: ["Heading", "Cards (image, title, link)"],
    accent: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    border: "border-l-blue-400",
  },
  howItWork: {
    icon: "ℹ️",
    label: "How It Works",
    description: "A simple step-by-step trust/process section. Edit the steps below.",
    contains: ["Heading", "Steps (image/icon, title, description)"],
    accent: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
    border: "border-l-slate-400",
  },
  promo: {
    icon: "🎯",
    label: "Promo Banner",
    description: 'Pick a layout, then manage its image/title/CTA at Content -> Promo Banners.',
    contains: ["Layout variant"],
    accent: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
    border: "border-l-pink-400",
  },
  featuredProducts: {
    icon: "⭐",
    label: "Featured Products",
    description: "A carousel of products marked \"Featured\", or hand-pick specific products.",
    contains: ["Heading", "Sub-heading", "Auto/Manual", "Item limit"],
    accent: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    border: "border-l-green-400",
  },
  newArrivals: {
    icon: "🆕",
    label: "New Arrivals",
    description: "The most recently added products, or hand-pick specific products.",
    contains: ["Heading", "Sub-heading", "Auto/Manual", "Item limit"],
    accent: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    border: "border-l-green-400",
  },
  bestSellers: {
    icon: "🏆",
    label: "Best Sellers",
    description: "Top-selling products, ranked by orders, or hand-pick specific products.",
    contains: ["Heading", "Sub-heading", "Auto/Manual", "Item limit"],
    accent: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    border: "border-l-green-400",
  },
  onSale: {
    icon: "🏷️",
    label: "On Sale",
    description: "Products currently marked on sale, or hand-pick specific products.",
    contains: ["Heading", "Sub-heading", "Auto/Manual", "Item limit"],
    accent: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    border: "border-l-green-400",
  },
  exploreGrid: {
    icon: "🧩",
    label: "Explore Categories Grid",
    description: "A category discovery grid with a background pattern.",
    contains: ["Heading", "Sub-heading", "Auto/Manual", "Columns", "Categories"],
    accent: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
    border: "border-l-orange-400",
  },
  largeProductSlider: {
    icon: "🛍️",
    label: "Large Product Slider",
    description: "A curated spotlight slider of large product cards (\"Chosen by our experts\").",
    contains: ["Heading", "Auto/Manual", "Featured products"],
    accent: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    border: "border-l-green-400",
  },
  collections: {
    icon: "📦",
    label: "Shop by Category",
    description: "A row of category cards linking into the catalog.",
    contains: ["Heading", "Sub-heading", "Auto/Manual", "Categories"],
    accent: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
    border: "border-l-orange-400",
  },
  featureItemsGrid: {
    icon: "🔲",
    label: "Feature Items Grid",
    description: "A plain product grid section.",
    contains: ["Item limit"],
    accent: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    border: "border-l-green-400",
  },
  blog: {
    icon: "📰",
    label: "Latest Blog",
    description: "A preview of the latest blog articles, managed in Content -> Blog.",
    contains: ["Heading", "Item limit"],
    accent: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    border: "border-l-indigo-400",
  },
  testimonials: {
    icon: "❤️",
    label: "Testimonials",
    description: "Customer reviews, managed in Content -> Testimonials.",
    contains: ["Approved testimonials"],
    accent: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    border: "border-l-purple-400",
  },
  newsletter: {
    icon: "✉️",
    label: "Newsletter",
    description: "An email subscription signup block.",
    contains: ["Heading", "Sub-heading"],
    accent: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    border: "border-l-indigo-400",
  },
  brands: {
    icon: "🏢",
    label: "Brands",
    description: "A row of brand logos, managed in Content -> Brands.",
    contains: ["Heading", "Sub-heading", "Item limit"],
    accent: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
    border: "border-l-cyan-400",
  },
  socialGallery: {
    icon: "📸",
    label: "Social Gallery",
    description: "An Instagram-style photo grid. Edit the tiles below.",
    contains: ["Heading", "Photo tiles (image, link)"],
    accent: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    border: "border-l-rose-400",
  },
};

export const SECTION_TYPES = Object.keys(SECTION_META) as HomepageSectionType[];
