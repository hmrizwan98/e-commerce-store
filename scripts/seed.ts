/**
 * One-time migration script: translates this repo's hardcoded demo arrays
 * (src/data/data.ts, src/components/Header/DropdownCategories.tsx,
 * src/data/navigation.ts, src/shared/Footer/Footer.tsx,
 * src/components/SectionHero/data.ts) into Firestore + Storage, so the
 * storefront can run entirely on Firebase-backed data.
 *
 * Usage: npm run seed   (requires .env.local to be filled in first)
 */
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { v2 as cloudinary } from "cloudinary";

dotenv.config({
  path: ".env.local",
});

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing Firebase env vars. Copy .env.example to .env.local and fill in your project's credentials first."
  );
  process.exit(1);
}

// Cloudinary uploads only run when credentials are present - otherwise every
// image field is seeded with a placeholder URL instead. See
// src/lib/images/config.ts, which the Admin Panel's upload service also
// reads for the same placeholder.
const CLOUDINARY_ENABLED = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);
const PLACEHOLDER_IMAGE_URL = process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL ?? "/images/placeholder.png";

if (CLOUDINARY_ENABLED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore(app);

const IMAGES_ROOT = path.join(process.cwd(), "src/images");

let uid = 0;
function nextId(prefix: string) {
  uid += 1;
  return `${prefix}_${uid}`;
}

async function uploadImage(localRelPath: string, publicId: string): Promise<string> {
  if (!CLOUDINARY_ENABLED) {
    return PLACEHOLDER_IMAGE_URL;
  }
  const localPath = path.join(IMAGES_ROOT, localRelPath);
  if (!fs.existsSync(localPath)) {
    throw new Error(`Seed image not found: ${localPath}`);
  }
  const result = await cloudinary.uploader.upload(localPath, { public_id: publicId, overwrite: true });
  return result.secure_url;
}

// ---------------------------------------------------------------------------
// Categories - deduped from CardCategories/data.ts, SectionGridMoreExplore/data.ts
// and Header/DropdownCategories.tsx's inline CATEGORIES.
// ---------------------------------------------------------------------------
const CATEGORY_SEEDS = [
  {
    name: "Women",
    description: "New items in 2023",
    image: "collections/1.png",
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16C15.866 16 19 12.866 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.866 8.13401 16 12 16Z" stroke="currentColor" stroke-width="1.5"/><path d="M12 16V22" stroke="currentColor" stroke-width="1.5"/><path d="M15 19H9" stroke="currentColor" stroke-width="1.5"/></svg>`,
  },
  {
    name: "Man",
    description: "Perfect for gentlemen",
    image: "collections/2.png",
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.25 21.5C14.5302 21.5 18 18.0302 18 13.75C18 9.46979 14.5302 6 10.25 6C5.96979 6 2.5 9.46979 2.5 13.75C2.5 18.0302 5.96979 21.5 10.25 21.5Z" stroke="currentColor" stroke-width="1.5"/><path d="M21.5 2.5L16 8" stroke="currentColor" stroke-width="1.5"/><path d="M15 2.5H21.5V9" stroke="currentColor" stroke-width="1.5"/></svg>`,
  },
  {
    name: "Sports",
    description: "The needs of sports",
    image: "collections/3.png",
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.18 18C19.58 18 20.18 16.65 20.18 15V9C20.18 7.35 19.58 6 17.18 6C14.78 6 14.18 7.35 14.18 9V15C14.18 16.65 14.78 18 17.18 18Z" stroke="currentColor" stroke-width="1.5"/><path d="M6.82 18C4.42 18 3.82 16.65 3.82 15V9C3.82 7.35 4.42 6 6.82 6C9.22 6 9.82 7.35 9.82 9V15C9.82 16.65 9.22 18 6.82 18Z" stroke="currentColor" stroke-width="1.5"/></svg>`,
  },
  {
    name: "Beauty",
    description: "Luxury and nobility",
    image: "collections/4.png",
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.7 18.98H7.3C6.88 18.98 6.41 18.65 6.27 18.25L2.13 6.67C1.54 5.01 2.23 4.5 3.65 5.52L7.55 8.31C8.2 8.76 8.94 8.53 9.22 7.8L10.98 3.11C11.54 1.61 12.47 1.61 13.03 3.11L14.79 7.8C15.07 8.53 15.81 8.76 16.45 8.31L20.11 5.7C21.67 4.58 22.42 5.15 21.78 6.96L17.74 18.27C17.59 18.65 17.12 18.98 16.7 18.98Z" stroke="currentColor" stroke-width="1.5"/></svg>`,
  },
  {
    name: "Jewelry",
    description: "Diamond always popular",
    image: "collections/5.png",
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.8 3.4L7.2 7.7C7.1 7.9 7 8.2 6.9 8.4L5.2 17C5.1 17.6 5.4 18.3 5.9 18.6L11.2 21.6C11.6 21.8 12.3 21.8 12.7 21.6L18 18.6C18.5 18.3 18.8 17.6 18.7 17L17 8.4C17 8.2 16.8 7.9 16.7 7.7L13.1 3.4C12.5 2.6 11.5 2.6 10.8 3.4Z" stroke="currentColor" stroke-width="1.5"/></svg>`,
  },
];

// ---------------------------------------------------------------------------
// Menus - mirrors src/data/navigation.ts (NAVIGATION_DEMO_2 / MEGAMENU_*) and
// src/shared/Footer/Footer.tsx's widgetMenus, as plain-string-href NavItems.
// ---------------------------------------------------------------------------
function navItem(name: string, href: string, extra: Record<string, unknown> = {}) {
  return { id: nextId("nav"), name, href, ...extra };
}

const MEGAMENU_CATEGORY_GROUPS = [
  {
    name: "Home Page",
    children: [
      navItem("Home 1", "/"),
      navItem("Home 2", "/home-2", { isNew: true }),
    ],
  },
  {
    name: "Shop Pages",
    children: [
      navItem("Category Page 1", "/collection"),
      navItem("Category Page 2", "/collection-2"),
      navItem("Product Page", "/product-detail"),
      navItem("Cart Page", "/cart"),
      navItem("Checkout Page", "/checkout"),
    ],
  },
  {
    name: "Other Pages",
    children: [
      navItem("Search Page", "/search"),
      navItem("Account Page", "/account"),
      navItem("Order Page", "/account-order"),
      navItem("Subscription", "/subscription"),
    ],
  },
  {
    name: "Blog Page",
    children: [
      navItem("Blog", "/blog"),
      navItem("About", "/about"),
      navItem("Contact", "/contact"),
    ],
  },
].map((group) => navItem(group.name, "/#", { children: group.children }));

const OTHER_PAGE_CHILD = [
  navItem("Home Demo 1", "/"),
  navItem("Home Demo 2", "/home-2"),
  navItem("Cart Page", "/cart"),
  navItem("Checkout Page", "/checkout"),
  navItem("Search Page", "/search"),
  navItem("Account Page", "/account"),
  navItem("About", "/about"),
  navItem("Contact us", "/contact"),
];

const HEADER_MENU_ITEMS = [
  navItem("Category", "/collection", {
    type: "megaMenu",
    children: MEGAMENU_CATEGORY_GROUPS,
  }),
  navItem("Beauty", "/collection"),
  navItem("Sport", "/collection-2"),
  navItem("Explore", "/search", { type: "dropdown", children: OTHER_PAGE_CHILD }),
];

const FOOTER_MENU_ITEMS = [
  {
    title: "Getting started",
    links: ["Release Notes", "Upgrade Guide", "Browser Support", "Dark Mode"],
  },
  { title: "Explore", links: ["Prototyping", "Design systems", "Pricing", "Security"] },
  { title: "Resources", links: ["Best practices", "Support", "Developers", "Learn design"] },
  {
    title: "Community",
    links: ["Discussion Forums", "Code of Conduct", "Contributing", "API Reference"],
  },
].map((group) =>
  navItem(group.title, "/", {
    children: group.links.map((label) => navItem(label, "/")),
  })
);

// ---------------------------------------------------------------------------
// Hero banners - mirrors src/components/SectionHero/data.ts (HERO2_DEMO_DATA)
// ---------------------------------------------------------------------------
const HERO_BANNER_SEEDS = [
  { imageFile: "hero-right-2.png", heading: "Exclusive collection for everyone" },
  { imageFile: "hero-right-3.png", heading: "Exclusive collection for everyone" },
  { imageFile: "hero-right.png", heading: "Exclusive collection for everyone" },
];

// ---------------------------------------------------------------------------
// Products - mirrors src/data/data.ts (PRODUCTS + SPORT_PRODUCTS)
// ---------------------------------------------------------------------------
type LegacyStatus = "New in" | "limited edition" | "Sold Out" | "50% Discount" | undefined;

function toBadge(status: LegacyStatus) {
  switch (status) {
    case "New in":
      return "new";
    case "Sold Out":
      return "sold_out";
    case "limited edition":
      return "limited_edition";
    case "50% Discount":
      return "sale";
    default:
      return null;
  }
}

const IMAGE_VARIANTS = [
  { label: "Black", hex: undefined as string | undefined, swatchImage: "products/v6.jpg" },
  { label: "White", hex: undefined as string | undefined, swatchImage: "products/v2.jpg" },
  { label: "Orange", hex: undefined as string | undefined, swatchImage: "products/v3.jpg" },
  { label: "Sky Blue", hex: undefined as string | undefined, swatchImage: "products/v4.jpg" },
  { label: "Natural", hex: undefined as string | undefined, swatchImage: "products/v5.jpg" },
];

const COLOR_VARIANTS = [
  { label: "Violet", hex: "#a78bfa" as string | undefined, swatchImage: "products/1.png" },
  { label: "Yellow", hex: "#facc15" as string | undefined, swatchImage: "products/2.png" },
  { label: "Orange", hex: "#fb923c" as string | undefined, swatchImage: "products/3.png" },
  { label: "Sky Blue", hex: "#38bdf8" as string | undefined, swatchImage: "products/4.png" },
  { label: "Green", hex: "#4ade80" as string | undefined, swatchImage: "products/5.png" },
];

interface LegacySeedProduct {
  name: string;
  description: string;
  price: number;
  imageFile: string;
  variantType?: "color" | "image";
  sizes?: string[];
  status?: LegacyStatus;
  rating?: string;
  numberOfReviews?: number;
}

const PRODUCT_SEEDS: LegacySeedProduct[] = [
  { name: "Rey Nylon Backpack", description: "Brown cockroach wings", price: 74, imageFile: "products/17.png", variantType: "image", sizes: ["XS", "S", "M", "L", "XL"], status: "New in", rating: "4.4", numberOfReviews: 98 },
  { name: 'Round Buckle 1" Belt', description: "Classic green", price: 68, imageFile: "products/2.png", variantType: "color", status: "50% Discount", rating: "4.9", numberOfReviews: 98 },
  { name: "Waffle Knit Beanie", description: "New blue aqua", price: 132, imageFile: "products/16.png", variantType: "image", sizes: ["S", "M", "L", "XL"], rating: "4.9", numberOfReviews: 98 },
  { name: "Travel Pet Carrier", description: "Dark pink 2023", price: 28, imageFile: "products/4.png", variantType: "color", status: "Sold Out", rating: "4.9", numberOfReviews: 98 },
  { name: "Leather Gloves", description: "Perfect mint green", price: 42, imageFile: "products/5.png", variantType: "image", sizes: ["XS", "S", "M", "L", "XL"], rating: "4.9", numberOfReviews: 98 },
  { name: "Hoodie Sweatshirt", description: "New design 2023", price: 30, imageFile: "products/6.png", variantType: "color", rating: "4.9", numberOfReviews: 98 },
  { name: "Wool Cashmere Jacket", description: "Matte black", price: 12, imageFile: "products/9.png", variantType: "image", status: "New in", rating: "4.9", numberOfReviews: 98 },
  { name: "Ella Leather Tote", description: "Cream pink", price: 145, imageFile: "products/8.png", variantType: "image", sizes: ["XS", "S", "M", "L", "XL"], status: "limited edition", rating: "4.9", numberOfReviews: 98 },
  { name: "Mastermind Toys", description: "Brown cockroach wings", price: 74, imageFile: "products/sport-1.png", variantType: "color", sizes: ["XS", "S", "M", "L", "XL"], status: "New in", rating: "4.9", numberOfReviews: 98 },
  { name: "Jump Rope Kids", description: "Classic green", price: 68, imageFile: "products/sport-2.png", variantType: "color", status: "50% Discount", rating: "4.9", numberOfReviews: 98 },
  { name: "Tee Ball Beanie", description: "New blue aqua", price: 132, imageFile: "products/sport-3.png", variantType: "image", sizes: ["S", "M", "L", "XL"], rating: "4.9", numberOfReviews: 98 },
  { name: "Rubber Table Tennis", description: "Dark pink 2023", price: 28, imageFile: "products/sport-4.png", variantType: "color", status: "Sold Out", rating: "4.9", numberOfReviews: 98 },
  { name: "Classic Blue Rugby", description: "Perfect mint green", price: 42, imageFile: "products/sport-5.png", variantType: "image", sizes: ["XS", "S", "M", "L", "XL"], rating: "4.9", numberOfReviews: 98 },
  { name: "Manhattan Toy WRT", description: "New design 2023", price: 30, imageFile: "products/sport-6.png", variantType: "color", rating: "4.9", numberOfReviews: 98 },
  { name: "Tabletop Football", description: "Matte black", price: 12, imageFile: "products/sport-7.png", variantType: "image", status: "New in", rating: "4.9", numberOfReviews: 98 },
  { name: "Pvc Catching Toy", description: "Cream pink", price: 145, imageFile: "products/sport-8.png", variantType: "color", sizes: ["XS", "S", "M", "L", "XL"], status: "limited edition", rating: "4.9", numberOfReviews: 98 },
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// Reviews - a small realistic pool (drawn from the template's own former
// hardcoded ReviewItem/product-detail sample comments) cycled across seeded
// products, all pre-approved. Read-only in Phase 2 - see README/plan notes.
// ---------------------------------------------------------------------------
const REVIEW_POOL = [
  {
    userName: "Cody Fisher",
    rating: 5,
    comment:
      "Very nice feeling fabric. I like it better than a regular version because it is tailored to be a slimmer fit. Perfect for going out when you want to stay comfy.",
  },
  {
    userName: "Stiven Hokinhs",
    rating: 5,
    comment:
      "I love this. Still looks new after plenty of washes. If you're unsure which one to pick, this is a safe bet.",
  },
  {
    userName: "Gropishta Keo",
    rating: 4,
    comment:
      "The quality and sizing mentioned were accurate and I'm really happy with the purchase. Such a cozy and comfortable fit.",
  },
  {
    userName: "Dahon Stiven",
    rating: 5,
    comment:
      "Before buying this, I didn't really know how I would tell a high quality item, but after opening it, I was very impressed with the material.",
  },
  {
    userName: "Jenny Wilson",
    rating: 3,
    comment:
      "Good value for the price. Sizing runs a little small so I'd recommend going up a size if you're in between.",
  },
];

async function seedReviews(productId: string) {
  const count = 3;
  for (let i = 0; i < count; i++) {
    const review = REVIEW_POOL[(uid + i) % REVIEW_POOL.length];
    await db
      .collection("reviews")
      .doc()
      .set({
        productId,
        userName: review.userName,
        rating: review.rating,
        comment: review.comment,
        isVerifiedPurchase: false,
        status: "approved",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
  }
}

async function seedCategories() {
  console.log(`Seeding ${CATEGORY_SEEDS.length} categories...`);
  const ids: string[] = [];
  for (let index = 0; index < CATEGORY_SEEDS.length; index++) {
    const cat = CATEGORY_SEEDS[index];
    const imageUrl = await uploadImage(cat.image, `categories/${slugify(cat.name)}/image`);
    const ref = db.collection("categories").doc();
    await ref.set({
      name: cat.name,
      slug: slugify(cat.name),
      description: cat.description,
      image: imageUrl,
      icon: cat.icon,
      parentId: null,
      order: index,
      isActive: true,
      showInNav: true,
      showOnHomepage: true,
      isDeleted: false,
      deletedAt: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    ids.push(ref.id);
  }
  return ids;
}

async function seedMenus() {
  console.log("Seeding header/footer menus...");
  await db
    .collection("menus")
    .doc("header")
    .set({ id: "header", items: HEADER_MENU_ITEMS, updatedAt: Timestamp.now() });
  await db
    .collection("menus")
    .doc("footer")
    .set({ id: "footer", items: FOOTER_MENU_ITEMS, updatedAt: Timestamp.now() });
}

async function seedBanners() {
  console.log(`Seeding ${HERO_BANNER_SEEDS.length} hero banners...`);
  for (let index = 0; index < HERO_BANNER_SEEDS.length; index++) {
    const banner = HERO_BANNER_SEEDS[index];
    const imageUrl = await uploadImage(banner.imageFile, `hero/hero-${index}/desktop`);
    await db.collection("banners").doc().set({
      title: banner.heading,
      subtitle: "In this season, find the best",
      ctaText: "Explore now",
      ctaHref: "/",
      imageDesktop: imageUrl,
      imageMobile: imageUrl,
      placement: "hero",
      order: index,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
}

async function seedBrands(): Promise<string[]> {
  const BRAND_SEEDS = [
    { name: "Aurora Studio", description: "Everyday essentials, thoughtfully made." },
    { name: "Nimbus & Co.", description: "Modern outdoor and travel gear." },
    { name: "Cedar Collective", description: "Small-batch accessories." },
  ];
  console.log(`Seeding ${BRAND_SEEDS.length} brands...`);
  const ids: string[] = [];
  for (let i = 0; i < BRAND_SEEDS.length; i++) {
    const b = BRAND_SEEDS[i];
    const ref = db.collection("brands").doc();
    await ref.set({
      name: b.name,
      slug: slugify(b.name),
      description: b.description,
      isActive: true,
      isDeleted: false,
      deletedAt: null,
      order: i,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    ids.push(ref.id);
  }
  return ids;
}

interface SeededProductRef {
  id: string;
  name: string;
  price: number;
  image: string;
  sku?: string;
}

async function seedProducts(categoryIds: string[], brandIds: string[]): Promise<SeededProductRef[]> {
  const seeded: SeededProductRef[] = [];
  console.log(`Seeding ${PRODUCT_SEEDS.length} products...`);
  for (let index = 0; index < PRODUCT_SEEDS.length; index++) {
    const p = PRODUCT_SEEDS[index];
    const slug = slugify(p.name);
    const imageUrl = await uploadImage(p.imageFile, `products/${slug}/main`);

    const productRef = db.collection("products").doc();
    const hasVariants = Boolean(p.variantType);
    const colorFacets =
      p.variantType === "color" ? COLOR_VARIANTS.map((v) => v.label.toLowerCase()) : [];
    const sizeFacets = p.sizes ? p.sizes.map((s) => s.toLowerCase()) : [];

    await productRef.set({
      name: p.name,
      slug,
      nameLower: p.name.toLowerCase(),
      description: p.description,
      shortDescription: p.description,
      price: p.price,
      sku: `SKU-${1000 + index}`,
      brandId: brandIds[index % brandIds.length],
      categoryIds: [categoryIds[index % categoryIds.length]],
      tags: ["tag1", "tag2"],
      images: [imageUrl],
      status: "active",
      badge: toBadge(p.status),
      stock: 25,
      trackInventory: true,
      lowStockThreshold: 5,
      colorFacets,
      sizeFacets,
      attributes: hasVariants
        ? [
            {
              id: nextId("attr"),
              name: p.variantType === "color" ? "Color" : "Style",
              type: p.variantType === "color" ? "color" : "image",
              values:
                p.variantType === "color"
                  ? COLOR_VARIANTS.map((v) => ({ label: v.label, hex: v.hex }))
                  : IMAGE_VARIANTS.map((v) => v.label),
            },
            ...(p.sizes
              ? [
                  {
                    id: nextId("attr"),
                    name: "Size",
                    type: "text",
                    values: p.sizes,
                  },
                ]
              : []),
          ]
        : [],
      hasVariants,
      rating: p.rating ? Number(p.rating) : undefined,
      numberOfReviews: p.numberOfReviews,
      isFeatured: index < 5,
      order: index,
      isDeleted: false,
      deletedAt: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await seedReviews(productRef.id);

    if (hasVariants) {
      const variantSource = p.variantType === "color" ? COLOR_VARIANTS : IMAGE_VARIANTS;
      const attrName = p.variantType === "color" ? "Color" : "Style";
      for (let vIndex = 0; vIndex < variantSource.length; vIndex++) {
        const variant = variantSource[vIndex];
        const variantImageUrl = await uploadImage(
          variant.swatchImage,
          `products/${slug}/variants/${slugify(variant.label)}`
        );
        await productRef.collection("variants").doc().set({
          productId: productRef.id,
          attributeSelections: { [attrName]: variant.label },
          image: variantImageUrl,
          stock: 10,
          isDefault: vIndex === 0,
          order: vIndex,
        });
      }
    }

    seeded.push({ id: productRef.id, name: p.name, price: p.price, image: imageUrl, sku: `SKU-${1000 + index}` });
  }
  return seeded;
}

// ---------------------------------------------------------------------------
// Sample customers + orders - illustrative records only (not real Firebase
// Auth accounts), so the admin Customers/Orders modules aren't empty before
// storefront checkout/customer-auth exist. Safe to delete from the Firestore
// console once real data starts flowing.
// ---------------------------------------------------------------------------
async function seedCustomersAndOrders(products: SeededProductRef[]) {
  if (!products.length) return;
  console.log("Seeding sample customers + orders...");

  const CUSTOMER_SEEDS = [
    { name: "Amina Yousaf", email: "amina@example.com" },
    { name: "Bilal Ahmed", email: "bilal@example.com" },
  ];

  const customerIds: string[] = [];
  for (let i = 0; i < CUSTOMER_SEEDS.length; i++) {
    const c = CUSTOMER_SEEDS[i];
    const ref = db.collection("users").doc(`sample_customer_${i + 1}`);
    await ref.set({
      email: c.email,
      displayName: c.name,
      role: "customer",
      totalSpend: 0,
      orderCount: 0,
      createdAt: Timestamp.now().toMillis(),
    });
    customerIds.push(ref.id);
  }

  const ORDER_STATUSES = ["pending", "processing", "delivered"] as const;

  for (let i = 0; i < 3; i++) {
    const product = products[i % products.length];
    const quantity = 1 + (i % 3);
    const subtotal = product.price * quantity;
    const shippingCost = 5;
    const total = subtotal + shippingCost;
    const status = ORDER_STATUSES[i % ORDER_STATUSES.length];
    const customerId = customerIds[i % customerIds.length];

    await db
      .collection("orders")
      .doc()
      .set({
        orderNumber: `ORD-${1000 + i}`,
        userId: customerId,
        items: [
          {
            productId: product.id,
            name: product.name,
            image: product.image,
            sku: product.sku,
            unitPrice: product.price,
            quantity,
            lineTotal: subtotal,
          },
        ],
        subtotal,
        shippingCost,
        total,
        shippingAddress: {
          fullName: CUSTOMER_SEEDS[i % CUSTOMER_SEEDS.length].name,
          phone: "0300-0000000",
          line1: "123 Sample Street",
          city: "Lahore",
          country: "Pakistan",
        },
        paymentMethod: i % 2 === 0 ? "cod" : "bank_transfer",
        paymentStatus: status === "delivered" ? "paid" : "unpaid",
        orderStatus: status,
        statusHistory: [{ status, at: Date.now(), note: null }],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
  }
}

// ---------------------------------------------------------------------------
// Homepage sections - mirrors the home page's previous hardcoded section
// order/props, so the Admin Panel's Homepage Builder starts pre-populated
// with the exact layout the storefront already had, just now reorderable/
// toggleable from Firestore instead of fixed in JSX.
// ---------------------------------------------------------------------------
async function seedHomepageSections() {
  console.log("Seeding homepage sections...");
  const SECTIONS: { type: string; title: string; config?: Record<string, unknown> }[] = [
    { type: "hero", title: "Hero banner" },
    { type: "discoverMore", title: "Discover more slider" },
    { type: "featuredProducts", title: "Featured products", config: { limit: 5 } },
    { type: "howItWork", title: "How it works" },
    { type: "promo", title: "Promo banner 1", config: { variant: 1 } },
    { type: "exploreGrid", title: "Explore categories grid" },
    {
      type: "bestSellers",
      title: "Best sellers",
      config: { heading: "Best Sellers", subHeading: "Best selling of the month", limit: 8 },
    },
    { type: "promo", title: "Promo banner 2", config: { variant: 2 } },
    { type: "largeProductSlider", title: "Large product slider" },
    { type: "collections", title: "Shop by department" },
    { type: "promo", title: "Promo banner 3", config: { variant: 3 } },
    { type: "featureItemsGrid", title: "Feature items grid", config: { limit: 8 } },
    { type: "blog", title: "Latest blog articles" },
    { type: "testimonials", title: "Customer testimonials" },
  ];

  for (let i = 0; i < SECTIONS.length; i++) {
    const section = SECTIONS[i];
    await db
      .collection("homepageSections")
      .doc()
      .set({
        type: section.type,
        title: section.title,
        order: i,
        isActive: true,
        config: section.config ?? {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
  }
}

async function main() {
  const categoryIds = await seedCategories();
  const brandIds = await seedBrands();
  await seedMenus();
  await seedBanners();
  await seedHomepageSections();
  const products = await seedProducts(categoryIds, brandIds);
  await seedCustomersAndOrders(products);
  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
