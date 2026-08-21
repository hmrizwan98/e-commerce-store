import type { ThemePresetId } from "./theme-types";

/**
 * Curated default imagery/copy per preset, keyed by presetId (not by structural
 * component family) so presets sharing a hero/categories/promo component family
 * (e.g. premium-luxury/fashion-editorial/furniture-home all render via the
 * "luxe" family) still get industry-appropriate imagery instead of literally
 * identical photos. Real Firestore banner/category data (when present) always
 * takes precedence over these - this is only the last-resort fallback, exactly
 * mirroring the precedence each component already had before this file existed.
 */
export interface ThemeDefaultHeroAsset {
  image: string;
  heading?: string;
  subHeading?: string;
}

export interface ThemeDefaultCategoryAsset {
  name: string;
  desc: string;
  image: string;
}

export interface ThemeDefaultPromoAsset {
  image: string;
  secondaryImage?: string;
  title?: string;
  description?: string;
}

export interface ThemeDefaultAssets {
  hero: ThemeDefaultHeroAsset;
  categories: ThemeDefaultCategoryAsset[];
  promo: ThemeDefaultPromoAsset;
}

function unsplash(id: string, w = 1200) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}

export const THEME_DEFAULT_ASSETS: Record<ThemePresetId, ThemeDefaultAssets> = {
  "modern-minimal": {
    hero: {
      image: unsplash("photo-1490481651871-ab68de25d43d"),
      heading: "Style That Inspires",
      subHeading: "Discover the latest trends & exclusive minimal designs.",
    },
    categories: [
      { name: "New Arrivals", desc: "Clean minimalist pieces", image: unsplash("photo-1434389677669-e08b4cac3105", 600) },
      { name: "Best Sellers", desc: "Most loved daily wear", image: unsplash("photo-1523275335684-37898b6baf30", 600) },
      { name: "Summer Essentials", desc: "Lightweight fabrics", image: unsplash("photo-1572635196237-14b3f281503f", 600) },
    ],
    promo: {
      image: unsplash("photo-1445205170230-053b83016050", 800),
      title: "Simplicity is the ultimate sophistication.",
      description: "Save 20% off this holiday season on minimalist apparel and everyday essentials.",
    },
  },
  "bold-commerce": {
    hero: {
      image: unsplash("photo-1483985988355-763728e1935b"),
      heading: "Bold Deals. Bigger Savings.",
      subHeading: "Shop today's hottest picks across every category",
    },
    categories: [
      { name: "Trending Now", desc: "This week's top picks", image: unsplash("photo-1441986300917-64674bd600d8", 600) },
      { name: "Flash Deals", desc: "Limited-time savings", image: unsplash("photo-1472851294608-062f824d29cc", 600) },
      { name: "Top Rated", desc: "Customer favorites", image: unsplash("photo-1441984904996-e0b6ba687e04", 600) },
    ],
    promo: {
      image: unsplash("photo-1472851294608-062f824d29cc", 800),
      title: "EXCLUSIVE OFFERS LIMITED TIME ONLY",
      description: "Big brands, bigger discounts - shop the storewide mega sale event now.",
    },
  },
  "premium-luxury": {
    hero: {
      image: unsplash("photo-1515886657613-9f3515b0c78f"),
      heading: "Dive Into A World Of Endless Fashion Possibilities",
      subHeading: "Bespoke Italian Craftsmanship & Premium Silks",
    },
    categories: [
      { name: "Couture Dresses", desc: "Fine silk evening gowns", image: unsplash("photo-1515886657613-9f3515b0c78f", 600) },
      { name: "Designer Handbags", desc: "Handcrafted Italian leather", image: unsplash("photo-1584917865442-de89df76afd3", 600) },
      { name: "Luxury Footwear", desc: "Bespoke stiletto heels", image: unsplash("photo-1543163521-1bf539c55dd2", 600) },
    ],
    promo: {
      image: unsplash("photo-1515886657613-9f3515b0c78f", 600),
      secondaryImage: unsplash("photo-1539109136881-3be0616acf4b", 600),
      title: "Redefining Everyday Elegance",
      description: "Curated luxury fashion pieces crafted with silk, cashmere & fine leather for timeless sophistication.",
    },
  },
  "fashion-editorial": {
    hero: {
      image: unsplash("photo-1490114538077-0a7f8cb49891"),
      heading: "The Autumn Editorial",
      subHeading: "Curated runway-inspired looks for the modern icon",
    },
    categories: [
      { name: "The Edit", desc: "This season's curation", image: unsplash("photo-1490114538077-0a7f8cb49891", 600) },
      { name: "Runway Ready", desc: "Statement silhouettes", image: unsplash("photo-1520006403909-838d6b92c22e", 600) },
      { name: "Accessories", desc: "Finishing touches", image: unsplash("photo-1524805444758-089113d48a6d", 600) },
    ],
    promo: {
      image: unsplash("photo-1490114538077-0a7f8cb49891", 600),
      secondaryImage: unsplash("photo-1520006403909-838d6b92c22e", 600),
      title: "New Season, New Story",
      description: "Editorial-inspired pieces shot for the runway, designed for real life.",
    },
  },
  "beauty-cosmetics": {
    hero: {
      image: unsplash("photo-1596462502278-27bfdc403348"),
      heading: "Radiance Starts Here",
      subHeading: "Clean beauty & skincare crafted for your glow.",
    },
    categories: [
      { name: "Skincare Essentials", desc: "Nourish & renew", image: unsplash("photo-1556228720-195a672e8a03", 600) },
      { name: "Makeup Must-Haves", desc: "Everyday glam", image: unsplash("photo-1512496015851-a90fb38ba796", 600) },
      { name: "Fragrance", desc: "Signature scents", image: unsplash("photo-1541643600914-78b084683601", 600) },
    ],
    promo: {
      image: unsplash("photo-1556228720-195a672e8a03", 800),
      title: "Glow Up Sale",
      description: "20% off skincare & cosmetics favorites this week only.",
    },
  },
  "electronics-tech": {
    hero: {
      image: unsplash("photo-1505740420928-5e560c06d30e"),
      heading: "Spark Your Savings on Electronics!",
      subHeading: "Latest High-Performance Gadgets & Tech Accessories",
    },
    categories: [
      { name: "Smartphones", desc: "Flagship iOS & Android", image: unsplash("photo-1511707171634-5f897ff02aa9", 600) },
      { name: "Laptops & PCs", desc: "Ultra-fast workstation gear", image: unsplash("photo-1496181133206-80ce9b88a853", 600) },
      { name: "Audio Gear", desc: "Noise cancelling headphones", image: unsplash("photo-1505740420928-5e560c06d30e", 600) },
    ],
    promo: {
      image: unsplash("photo-1505740420928-5e560c06d30e", 800),
      title: "Experience Innovation Like Never Before.",
      description: "High-resolution OLED displays, ultra-fast processors & noise-cancelling wireless audio gear.",
    },
  },
  "streetwear-urban": {
    hero: {
      image: unsplash("photo-1509631179647-0177331693ae"),
      heading: "OWN THE DARKNESS",
      subHeading: "PREMIUM STREETWEAR FOR THE FEARLESS",
    },
    categories: [
      { name: "GRAPHIC HOODIES", desc: "Heavyweight fleece", image: unsplash("photo-1556905055-8f358a7a47b2", 600) },
      { name: "CARGO JOGGERS", desc: "Tactical streetwear", image: unsplash("photo-1517445312882-bc9910d016b7", 600) },
      { name: "URBAN SNEAKERS", desc: "Limited retro kicks", image: unsplash("photo-1552346154-21d32810aba3", 600) },
    ],
    promo: {
      image: unsplash("photo-1509631179647-0177331693ae", 800),
      title: "EXCLUSIVE OFFERS LIMITED TIME ONLY",
      description: "Heavyweight hoodies, cargo pants & limited retro sneakers drop available now.",
    },
  },
  "furniture-home": {
    hero: {
      image: unsplash("photo-1493663284031-b7e3aefcae8e"),
      heading: "Timeless Pieces For Modern Living",
      subHeading: "Handcrafted furniture blending comfort and sophistication",
    },
    categories: [
      { name: "Living Room", desc: "Sofas & statement seating", image: unsplash("photo-1567538096630-e0c55bd6374c", 600) },
      { name: "Bedroom Collections", desc: "Rest, elevated", image: unsplash("photo-1540932239986-30128078f3c5", 600) },
      { name: "Dining & Decor", desc: "Gather in style", image: unsplash("photo-1449247613801-ab06418e2861", 600) },
    ],
    promo: {
      image: unsplash("photo-1567538096630-e0c55bd6374c", 600),
      secondaryImage: unsplash("photo-1449247613801-ab06418e2861", 600),
      title: "Elevate Your Space",
      description: "Premium handcrafted furniture, thoughtfully designed for the way you live.",
    },
  },
  "grocery-fresh": {
    hero: {
      image: unsplash("photo-1542838132-92c53300491e"),
      heading: "Fresh, Delivered Daily",
      subHeading: "Farm-fresh groceries picked and packed with care.",
    },
    categories: [
      { name: "Fruits & Vegetables", desc: "Picked at peak freshness", image: unsplash("photo-1610832958506-aa56368176cf", 600) },
      { name: "Dairy & Bakery", desc: "Baked and bottled fresh", image: unsplash("photo-1550583724-b2692b85b150", 600) },
      { name: "Pantry Staples", desc: "Everyday essentials", image: unsplash("photo-1509440159596-0249088772ff", 600) },
    ],
    promo: {
      image: unsplash("photo-1542838132-92c53300491e", 800),
      title: "Fresh Deals This Week",
      description: "Save on seasonal produce and pantry favorites, delivered to your door.",
    },
  },
};

export function getThemeDefaultAssets(presetId: ThemePresetId | undefined | null): ThemeDefaultAssets {
  return THEME_DEFAULT_ASSETS[presetId as ThemePresetId] ?? THEME_DEFAULT_ASSETS["premium-luxury"];
}
