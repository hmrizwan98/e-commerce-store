# Tradez Glint — Next.js 14 eCommerce Storefront + Admin Panel

This repo is a Next.js 14 (App Router) storefront that has been migrated from
a fully hardcoded demo (the "Ciseco" template) to a dynamic, Firebase-powered
eCommerce platform with a Shopify-style Admin Panel — while keeping the
original design and UX unchanged. The migration is delivered in phases;
**Phases 1 and 2 (storefront dynamism + full Admin Panel) are complete**. See
[Migration Status](#migration-status) for what's done and what's next.

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase credentials, see below
npm run seed                 # populates Firestore + sample data (see below)
npm run set-admin -- you@example.com   # grants admin access to a Firebase Auth user
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront, or
[http://localhost:3000/admin](http://localhost:3000/admin/login) for the
Admin Panel.

Until `.env.local` is filled in with real Firebase credentials, every page
that reads from Firestore will error at request time — this is expected.
Complete the [Firebase Setup Guide](#firebase-setup-guide) below first.

## Migration Status

| Phase | Scope | Status |
|---|---|---|
| 1 | Firebase project wiring, canonical types, repository layer, security rules, seed script, home page/nav proven end-to-end on Firestore | **Done** |
| 2 | Dynamic `/product/[slug]`, real filters/search/pagination, full Admin Panel (auth, products/categories/brands/menus/homepage/reviews/orders/customers/inventory/settings) | **Done** |
| 3 | Wire the Admin's Homepage Builder sections into the storefront's actual rendering pipeline; brand slider/newsletter storefront sections | Planned |
| 4 | Real cart → checkout → order creation (Server Actions, stock decrement, guest/customer flow); discount-code UI removed (no coupon system) | Planned |
| 5 | Customer accounts/auth, real payment-proof upload flow, shipping-cost calculation at checkout, customer-submitted reviews | Planned |
| 6 | SEO metadata/sitemap, full security-rules test suite, performance pass | Planned |

There is intentionally **no coupon/discount system** anywhere in this
project (schema, admin panel, or checkout UI) — this was explicitly descoped.

Firebase Storage is currently **disabled** (see [Image Uploads](#image-uploads-storage-disabled)
below) — every image field still works, just with placeholder URLs until
you're on a Blaze-plan project and flip one environment variable.

## Architecture

- **Reads** (storefront pages) go through a **repository layer**
  (`src/lib/firebase/repositories/*.ts`) using the **Firebase Admin SDK**
  from Next.js Server Components — no client-side Firestore round-trip, no
  security-rule evaluation needed for reads.
- **Writes** (the Admin Panel) go through Next.js **Server Actions**
  (colocated per feature, e.g. `src/app/(admin)/admin/(protected)/products/actions.ts`),
  which call `requireAdmin()` first, write via the Admin SDK, then
  `revalidatePath()` so the storefront reflects the change immediately.
- **Firestore Security Rules** (`firestore.rules`) are the authoritative
  access boundary regardless of app code — every collection is explicitly
  public-read/admin-write or admin-only, with a deny-by-default catch-all.
- **Admin auth**: Firebase Auth + a custom `role: admin` claim, exchanged for
  an httpOnly session cookie (`src/app/api/admin/session/route.ts`), checked
  server-side by `src/app/(admin)/admin/(protected)/layout.tsx` on every
  request (not just client-side).
- Storefront navigation (header/footer menus) and product filters are
  fetched/updated **client-side** via the Firebase client SDK and URL search
  params respectively, since those component trees are deeply client-rendered
  already.
- **Redux Toolkit** is kept only for genuinely client-side state (cart/UI
  toggles, once Phase 4 lands). No server data flows through Redux.

### Key folders

```
src/lib/firebase/
  client.ts                 # lazy client SDK getters (getFirebaseAuth/Db/Storage)
  admin.ts                  # lazy Admin SDK getters + serverTimestamp/arrayUnion helpers
  admin-auth.ts              # session cookie create/verify + isAdminClaim
  require-admin.ts           # requireAdmin() guard called by every admin Server Action
  repositories/               # typed Admin-SDK read functions, one file per collection
  client-data/menus.ts        # client-SDK menu fetch (header/footer nav)
  adapters.ts                 # maps Firestore Category/Banner into legacy component shapes
src/lib/filters/              # URL-searchParams filter state (constants, parsing, hook)
src/lib/images/                # Storage-disabled-safe upload service (see below)
src/types/                    # canonical Product, Category, Brand, Banner, NavItem,
                               # Review, Order, Customer, HomepageSection, SiteSettings
src/app/(admin)/admin/         # Admin Panel (see below)
scripts/seed.ts                 # migrates old hardcoded demo data into Firestore
scripts/set-admin-claim.ts       # grants the admin custom claim to a Firebase Auth user
firestore.rules, storage.rules, firebase.json, .firebaserc, firestore.indexes.json
```

## Firestore Schema

- **`products/{id}`** — `name, slug, description, shortDescription, sku,
  barcode, brandId, categoryIds[], tags[], images[], videoUrl, status
  ('draft'|'active'|'archived'), badge, price, compareAtPrice, stock,
  trackInventory, lowStockThreshold, attributes[], hasVariants, rating,
  numberOfReviews, isFeatured, isNewArrival, isBestSeller, isOnSale,
  relatedProductIds[], seoTitle, seoDescription, colorFacets[], sizeFacets[],
  nameLower, isDeleted, deletedAt`.
  - `attributes: {id, name, type:'color'|'text'|'image', values}[]` — how
    admins define **unlimited custom attribute types** (Color, Size,
    Material, anything).
  - `colorFacets`/`sizeFacets`/`nameLower` are **server-computed only**
    (recomputed in the product Server Action from `attributes`/`name` on
    every save) — used for storefront filtering/search, never client-submitted.
  - **`products/{id}/variants/{variantId}`** (subcollection): `productId,
    attributeSelections: {[name]: value}, sku, price, compareAtPrice, image,
    stock, isDefault, order`.
- **`categories/{id}`** — `name, slug, description, image, icon, parentId,
  order, isActive, showInNav, showOnHomepage, isDeleted, deletedAt`.
- **`brands/{id}`** — `name, slug, logo, banner, description, isActive, order,
  isDeleted, deletedAt`.
- **`menus/{id}`** (`header` | `footer`) — `items: NavItem[]` (recursive tree:
  `{id, name, href, type?, isNew?, children?}`).
- **`banners/{id}`** — hero/promo banners: `title, subtitle, ctaText, ctaHref,
  imageDesktop, imageMobile, placement, order, startDate, endDate, isActive`.
- **`homepageSections/{id}`** — homepage builder entries: `type, title, order,
  isActive, config: {heading?, subHeading?, categoryIds?, productIds?,
  bannerIds?, limit?}`. Admin-manageable today; not yet wired into the
  storefront's actual render pipeline (Phase 3).
- **`reviews/{id}`** — `productId, userId?, userName, userAvatar?, rating,
  title?, comment, isVerifiedPurchase, status:'pending'|'approved'|'rejected'`.
  Approving/rejecting/deleting recomputes the product's denormalized
  `rating`/`numberOfReviews`.
- **`orders/{id}`** — `orderNumber, userId?, guestEmail?, items[], subtotal,
  shippingCost, total, shippingAddress, paymentMethod:'cod'|'bank_transfer'|
  'jazzcash', paymentStatus, paymentProofUrl?, trackingNumber?, orderStatus,
  statusHistory[]`. Admin-only until Phase 4 adds real checkout.
- **`users/{uid}`** — customer records: `email, displayName, phone, role:
  'customer'|'admin', totalSpend, orderCount`, + `addresses` subcollection.
- **`siteSettings/{general|shipping|payments|email}`** — singleton docs for
  store info/currency/tax, shipping rates, payment method config
  (COD/bank transfer/JazzCash), and outgoing email sender info.

## Admin Panel

Sign in at `/admin/login` (see [bootstrapping the first admin](#3-bootstrap-your-first-admin-user)
below). Everything is server-guarded (`src/app/(admin)/admin/(protected)/layout.tsx`)
— visiting any `/admin/*` URL without a valid admin session redirects to login.

| Module | Path | Capabilities |
|---|---|---|
| Dashboard | `/admin` | Live counts (products/categories/brands/customers/orders/revenue), low-stock list |
| Products | `/admin/products` | Full CRUD, draft/active/archived, variants + dynamic attributes, images, SEO, tags, related products, featured/new-arrival/best-seller/on-sale flags, soft delete + Trash/restore, search + status filter + pagination |
| Categories | `/admin/categories` | Full CRUD, parent/child, sort order, enable/disable, soft delete + Trash/restore |
| Brands | `/admin/brands` | Full CRUD, soft delete + Trash/restore |
| Inventory | `/admin/inventory` | Stock levels across all tracked products, low-stock flagging, inline stock edit |
| Menus | `/admin/menus` | Header + footer nav editor — unlimited items/levels, dropdown/mega-menu type, reorder (↑↓), only saved items appear on the storefront |
| Homepage | `/admin/homepage` | Add/reorder/toggle homepage sections (hero, featured categories/products, new arrivals, best sellers, on sale, collections, promo, testimonials, newsletter, blog) with per-section heading/sub-heading/limit config |
| Reviews | `/admin/reviews` | Approve / reject / delete, filter by status |
| Orders | `/admin/orders` | List + filter by status, detail view, order/payment status update, tracking number, print invoice |
| Customers | `/admin/customers` | List, detail view with saved addresses + order history |
| Settings | `/admin/settings` | Store info, currency, tax rate, shipping rates, payment methods (COD/bank transfer/JazzCash) + instructions, email sender info |

### Bootstrapping the first admin user

1. Create a user via the storefront's `/signup` page (or the Firebase Console → Authentication → Add user).
2. Run `npm run set-admin -- their-email@example.com` — this grants the `role: admin` custom claim via the Admin SDK.
3. Sign in at `/admin/login` with that account.

Admin write Server Actions call `requireAdmin()` (verifies the session
cookie + claim server-side) as defense-in-depth on top of the layout guard
and `firestore.rules`' `isAdmin()` check — three independent layers, not one.

### Image uploads (Storage disabled)

Firebase Storage requires the Blaze (pay-as-you-go) plan for new projects.
While `FIREBASE_STORAGE_ENABLED` is unset/`false` (the default), every
upload control in the Admin Panel (`src/components/admin/ImageUploader.tsx`)
still renders and functions — clicking "Upload image" returns a placeholder
URL instead of calling Storage, and there's also a "paste an image URL"
fallback for testing with distinct images meanwhile.

The whole upload path is centralized in `src/lib/images/`:
- `config.ts` — the `STORAGE_ENABLED` flag + placeholder URL, read from env.
- `upload-service.ts` — the one function (`uploadImageFile`) that decides
  whether to call Storage or return the placeholder.
- `actions.ts` — the Server Action every `ImageUploader` calls.

**To enable real uploads later**: set `FIREBASE_STORAGE_ENABLED=true` in
`.env.local` (once your project is on the Blaze plan). No Firestore schema
change, no Admin UI change, no component redesign — every product/category/
brand/banner doc already stores plain image URL strings; only
`upload-service.ts`'s internal behavior changes.

## Firebase Setup Guide

### 1. Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/) → **Add project** → follow the prompts (Google Analytics is optional).
2. **Build → Authentication → Get started** → enable the **Email/Password** sign-in provider (used by both `/signup` and `/admin/login`).
3. **Build → Firestore Database → Create database** → start in **production mode** (the rules in this repo already lock it down) → pick a region close to your users.
4. **Build → Storage → Get started** — optional for now; see [Image Uploads](#image-uploads-storage-disabled). Storage requires the Blaze plan to actually provision on new projects.

### 2. Get your web app config (client SDK)

1. Project settings (gear icon) → **General** → under "Your apps", click the **Web** icon (`</>`) to register a web app.
2. Copy the `firebaseConfig` values into `.env.local`'s `NEXT_PUBLIC_FIREBASE_*` variables (see `.env.example`).

### 3. Get a service account key (Admin SDK)

1. Project settings → **Service accounts** → **Generate new private key** → downloads a JSON file.
2. From that JSON, copy `project_id` → `FIREBASE_PROJECT_ID`, `client_email` → `FIREBASE_CLIENT_EMAIL`, and `private_key` → `FIREBASE_PRIVATE_KEY` in `.env.local`. Keep the `\n` sequences in the private key literal (paste it inside quotes as one line) — `src/lib/firebase/admin.ts` un-escapes them at runtime.
3. **Never commit this key or `.env.local`** — covered by `.gitignore`'s `.env*.local` rule. If a real key is ever pasted into `.env.example` or any other tracked file by mistake, treat it as compromised and rotate it immediately from the same Service accounts page.

### 4. Deploy security rules and indexes

```bash
npm install -g firebase-tools   # if you don't have it yet
firebase login
# Edit .firebaserc and replace REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID with your project id
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 5. Seed initial data

```bash
npm run seed
```

Populates `products` (+ variants + reviews), `categories`, `brands`,
`menus/header`, `menus/footer`, `banners`, and a couple of illustrative
sample `users`/`orders` records (so the Admin Panel's Orders/Customers pages
aren't empty before real checkout exists — safe to delete from the Firestore
console once real data starts flowing). Image fields use placeholder URLs
unless `FIREBASE_STORAGE_ENABLED=true`.

### 6. Bootstrap an admin user and run the app

```bash
npm run set-admin -- you@example.com   # after creating that user via /signup or the Firebase console
npm run dev
```

Load `http://localhost:3000` for the storefront and
`http://localhost:3000/admin/login` for the Admin Panel.

## Environment Variables

See `.env.example` for the full list.

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Client SDK config — safe to expose to the browser by Firebase's design |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | Admin SDK service account — server-only secrets, never prefix `NEXT_PUBLIC_` |
| `FIREBASE_STORAGE_ENABLED` | `true`/`false` — see [Image Uploads](#image-uploads-storage-disabled) |
| `NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL` | Shown in place of real uploads while Storage is disabled |

## Deployment

This app deploys to any Node.js host that supports Next.js 14 (e.g. Vercel)
or **Firebase App Hosting** (supports Server Components/Server Actions).
Whichever host you pick, set the same environment variables from
`.env.local` in that platform's environment/secrets configuration, and run
`firebase deploy --only firestore:rules,firestore:indexes,storage` whenever
`firestore.rules`, `storage.rules`, or `firestore.indexes.json` change.

**Note on Next.js version**: this project pins `next` to `14.2.35` (not a
caret range) — earlier 14.0.x patches have a webpack bug where any Server
Action that transitively imports `firebase-admin` fails to build
("await isn't allowed in non-async function" / a `SyntaxError` during
"Collecting page data"). Don't downgrade below `14.2.x` without re-testing
`npm run build` against the Admin Panel's Server Actions.

## Troubleshooting

- **`auth/invalid-api-key` at build or request time** — `.env.local` is
  missing or has a placeholder `NEXT_PUBLIC_FIREBASE_API_KEY`. Complete the
  setup guide above.
- **`FirebaseError: Missing or insufficient permissions`** — you're
  attempting a write that `firestore.rules`/`storage.rules` correctly
  reject because the signed-in user doesn't have the `role: admin` custom
  claim. Run `npm run set-admin -- <email>` and sign in again (custom claims
  only take effect on a fresh ID token).
- **Redirected to `/admin/login` in a loop** — the session cookie wasn't
  set or the account isn't an admin yet; check the browser's cookies for
  `admin_session` and confirm `npm run set-admin` was run for that exact email.
- **A Firestore query throws asking for a composite index** — Firestore
  gives you a console link to create it, or add it to
  `firestore.indexes.json` and redeploy with `firebase deploy --only firestore:indexes`.
- **`npm run seed` fails with "Seed image not found"** — run it from the
  repo root (it reads images relative to `src/images/`), or ignore/upload
  manually if `FIREBASE_STORAGE_ENABLED=false` (no file access needed then).
- **Next.js build fails with `await isn't allowed in non-async function` or
  a `SyntaxError` mentioning `__webpack_async_dependencies__`** — you're on
  a Next.js `14.0.x` patch below `14.2`; upgrade (`npm install next@14.2.35`)
  per the Deployment note above.

## Maintenance

- Re-run `npm run seed` any time you want to reset to a fresh demo dataset
  (it always creates new documents — it does not delete existing ones first,
  so clear the relevant collections in the Firestore console first if you
  want a clean reset).
- Rotate the Admin SDK service account key periodically from **Project
  settings → Service accounts**, and update `FIREBASE_PRIVATE_KEY` /
  `FIREBASE_CLIENT_EMAIL` wherever the app is deployed.
- Keep `firestore.rules`/`storage.rules` in sync with any new collection —
  every collection should have an explicit rule; the catch-all at the bottom
  of each rules file denies-by-default.
- When Storage is enabled (`FIREBASE_STORAGE_ENABLED=true`), consider adding
  a scheduled Cloud Function to clean up orphaned images (e.g. from products
  deleted permanently) — not built yet, since permanent delete itself isn't
  implemented (only soft delete/Trash).

## Future Extension Guide

- **Wire the Homepage Builder into the storefront** (Phase 3): `src/app/page.tsx`
  should iterate `getActiveHomepageSections()` and switch-render the matching
  section component per `type`, instead of the current fixed section order.
- **Cart/Checkout/Orders** (Phase 4): add a `cartSlice` to Redux synced to a
  `carts/{uid}` doc, remove the discount-code UI at `src/app/checkout/page.tsx`
  (already flagged — no coupon system), and build a checkout Server Action
  that re-validates price/stock server-side before creating an `orders` doc
  (the schema already exists and the Admin Orders module already consumes it).
- **Customer accounts** (Phase 5): extend the existing Firebase Auth usage
  (currently admin-only) to customers, add a real review-submission flow
  gated on verified purchase, and wire real payment-proof uploads through the
  existing (Storage-disabled-safe) `src/lib/images/` upload service.
- **Real payment gateways**: `src/types/order.ts`'s `PaymentMethod` union and
  `siteSettings/payments` are both designed so adding Stripe/PayPal/Easypaisa/
  a real JazzCash API integration later is additive, not a rewrite.
