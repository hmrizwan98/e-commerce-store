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


## Testing Utilities

### Reset a Store Admin Password

Resetting a Store Admin's password is a real Super Admin panel feature, not
a script. From `/superadmin`, each store row has a "Reset password" action
(`resetStoreAdminPassword()` in
`src/app/(superadmin)/superadmin/(protected)/actions.ts`) that:

- Is guarded by `requireSuperAdmin()` — only a signed-in Super Admin can call it.
- Looks up the store's admin by the store's `email` field via the Firebase
  Admin SDK (`adminAuth().getUserByEmail()`).
- Generates a new random temporary password and updates the Firebase Auth
  user's password.
- Displays the new one-time password directly in the panel — it is not
  emailed or logged anywhere, and is not shown again after you navigate away.

There is no separate script for this — use the panel action for both
development and production.

## Multi Store Architecture

This platform is a **multi-tenant** system: one deployment, one Firebase
project, and unlimited independent stores, each with its own products,
orders, customers, menus, homepage, pages, theme, settings, and Cloudinary
assets. This is **not** subdomain-only SaaS — every store also gets its own
custom domain (e.g. `abcstore.com`) in addition to a generated
`{slug}.ROOT_DOMAIN` subdomain, both resolving to the same store.

```
                           Super Admin
                     panel.yourcompany.com/superadmin

                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼

            Store A        Store B       Store C

         abcstore.com   fashionhub.pk   gadgets.pk

            │               │              │

         /admin          /admin         /admin

            │               │              │

       Own Products    Own Products   Own Products
       Own Orders      Own Orders     Own Orders
       Own Customers   Own Customers  Own Customers
       Own Menus       Own Menus      Own Menus
       Own Homepage    Own Homepage   Own Homepage
       Own Pages       Own Pages      Own Pages
       Own Theme       Own Theme      Own Theme
       Own Settings    Own Settings   Own Settings
       Own Cloudinary  Own Cloudinary Own Cloudinary
```

Every tenant-scoped collection lives under `stores/{storeId}/{collection}`
in Firestore (see `src/lib/firebase/tenant-scope.ts`'s `tenantCollection()`/
`tenantDoc()` helpers — every repository and admin Server Action goes through
these instead of touching a flat top-level collection). The `stores/{id}`
document itself is the tenant registry, read by
`src/lib/tenant/current.ts` to resolve "which store is this request for" on
every request.

## Super Admin

The Super Admin is a single, global account — it does **not** belong to any
store (no `tenantId` claim, just `role: "superadmin"`) and customers/store
admins never see or reach it. It lives at `/superadmin` (guarded by
`src/lib/firebase/require-super-admin.ts` + the `(superadmin)/superadmin/
(protected)/layout.tsx` route guard) regardless of which domain serves it —
`src/middleware.ts` reserves the `/superadmin` path from tenant resolution
entirely.

Provision it once, after deploying, with:

```bash
npm run set-admin -- muhammad.rizwan2698@gmail.com Hello123@ --superadmin
```

This is a manual, one-time command — the credentials are never hardcoded
into `scripts/seed.ts` or any auto-run script.

**Super Admin capabilities** (`src/app/(superadmin)/superadmin/(protected)/actions.ts`):

| Action | Notes |
|---|---|
| Create store | One-click provisioning — see Store Creation Flow below |
| Edit store | Name, contact info, plan/expiry, custom domains |
| Suspend / Activate | Toggles `Store.status` — a suspended store's storefront and `/admin` both become unreachable until reactivated |
| Delete store | **Soft delete** — see Store Isolation below; reversible |
| Reset Store Admin password | Real panel action, one-time password reveal — see Testing Utilities above |
| View store details/status/domains/plan | Read-only block on the edit page |
| Search stores | By name, from the store list |

## Store Creation Flow

Clicking "Create store" (`createStore()` in the actions file above) does all
of the following in one call — no manual Firestore/Firebase Console work:

1. Generates a Firestore document ID (the Store ID) under `stores/`.
2. Validates the slug and any custom domains are not already taken
   (`isSlugTaken()`, `isDomainTaken()`).
3. Writes the `Store` doc (name, slug, contact info, generated
   `websiteUrl`/`adminUrl` under `NEXT_PUBLIC_ROOT_DOMAIN`, `cloudinaryFolder`,
   `status: "active"`).
4. Seeds a starter `siteSettings/general` doc so the storefront shows the
   new store's actual name/email from day one.
5. Seeds 5 starter `homepageSections` docs (hero, featured products,
   collections, new arrivals, newsletter) so the homepage isn't blank.
6. Creates the store's first Firebase Auth admin user with a generated
   temporary password and `{ role: "admin", tenantId: storeId }` claims.

Theme and navigation don't need seeding — `getActiveTheme()`/`useMenu()`
already fall back to safe defaults for a store with no theme/menu docs yet.

## Authentication

Two independent, parallel auth boundaries share the same session-cookie
mechanism (`admin_session`, set via `src/app/api/admin/session/route.ts`) but
check different custom claims:

- **Store Admin** — `{ role: "admin", tenantId: "<storeId>" }`. Checked by:
  the `(admin)/(protected)/layout.tsx` route guard (redirects to
  `/admin/login` if the claim is missing **or** `tenantId` doesn't match the
  store resolved for the current request's host — this is what stops a
  stale session from one store's admin from viewing another store's data),
  and `requireAdmin()` (the same cross-check, called at the top of every
  admin Server Action as defense-in-depth).
- **Super Admin** — `{ role: "superadmin" }`, no `tenantId`. Checked by
  `requireSuperAdmin()` and the `(superadmin)/.../layout.tsx` guard. Not
  tied to any store.

**Tenant resolution** (`src/lib/tenant/current.ts`) runs server-side (Node
runtime, not Edge) on every request that needs it: it checks the raw request
host against a store's custom `domains[]` first, then falls back to the
`x-tenant-slug` header `src/middleware.ts` sets from the subdomain (Edge
runtime, pure string parsing — no Firestore access there). A `DEV_TENANT_SLUG`
env var substitutes for the subdomain locally, where there's no wildcard DNS.
`requireCurrentTenant()` additionally rejects non-`"active"` stores, so a
suspended/deleted store's data becomes unreachable through every
tenant-scoped repository, `requireAdmin()`, and the image upload pipeline in
one place.

## Domain Strategy

Each store resolves on two kinds of host, in this priority order:

1. **Custom domain** — any exact hostname in the store's `domains[]` field
   (editable from `/superadmin`), e.g. `abcstore.com`, `www.abcstore.com`.
2. **Generated subdomain** — `{slug}.NEXT_PUBLIC_ROOT_DOMAIN`, always present
   from the moment a store is created, useful before a customer's own domain
   is ready.

**No code change is required to onboard a new domain** — only:

1. Add the domain to the store's `domains[]` in the Super Admin panel.
2. Point that domain's DNS at wherever this app is deployed, and add the
   domain in that hosting platform's dashboard (e.g. Vercel's Domains
   settings) — this is the same manual step any Next.js multi-domain
   deployment requires, and is outside what application code can automate.

## Store Isolation

Fully isolated under `stores/{storeId}/...` (products, orders, customers,
categories, brands, themes, homepage sections, site settings, menus, pages
+ sections, banners, testimonials, faqs, announcement bars) — every
repository function and admin Server Action for these goes through
`tenantCollection()`/`tenantDoc()` (`src/lib/firebase/tenant-scope.ts`), and
`firestore.rules` enforces the same boundary independently
(`isAdminOf(storeId)` checks the signed-in admin's own `tenantId` claim
against the store subtree being accessed).

Cloudinary assets are isolated by folder/public-ID prefix
(`src/lib/cloudinary/folders.ts`'s `buildPublicId(tenantSlug, ...)`) — all
stores share one Cloudinary account, but no store's public ID can collide
with another's.

**Known, intentional exceptions** (flat, not store-scoped):

- **`reviews`** — keyed by `productId` only. Not migrated because product
  IDs are non-enumerable Firestore auto-IDs (low practical exposure), and
  reviews weren't in the original isolation requirement. Candidate for a
  future phase.
- **legacy `users`** — superseded by the tenant-scoped `customers`
  collection; nothing in the app reads/writes it anymore. Kept locked down
  in `firestore.rules` only so no stale reference 404s.

## Folder Changes

No existing folder was renamed or moved. New folders added:

- `src/app/(superadmin)/superadmin/` — Super Admin panel (login + protected
  store CRUD), parallel to `(admin)/admin/`.
- `src/components/superadmin/` — Super Admin shell component.
- `src/lib/tenant/` — tenant resolution (`current.ts`, `constants.ts`).
- `src/middleware.ts` — Edge-runtime subdomain parsing (new file at the
  existing `src/` root, where Next.js requires middleware to live).

## Environment Variables

In addition to the existing Firebase/Cloudinary variables (see
`.env.example`):

| Variable | Notes |
|---|---|
| `DEV_TENANT_SLUG` | Local-dev fallback tenant slug (no wildcard DNS on localhost) |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Root domain new stores' subdomain/admin URLs are generated under, e.g. `yourdomain.com` → `{slug}.yourdomain.com` |

## Deployment Notes

- Deploy `firestore.rules` whenever it changes:
  `firebase deploy --only firestore:rules`.
- Set `NEXT_PUBLIC_ROOT_DOMAIN` in your hosting platform's environment
  config to your real root domain before creating production stores.
- For each store's custom domain, add it in your hosting platform's domain
  settings (e.g. Vercel) and point its DNS accordingly, then add the same
  domain to the store's `domains[]` in `/superadmin` — see Domain Strategy.
- Provision the Super Admin account once per environment with
  `npm run set-admin -- <email> <password> --superadmin` (see Super Admin
  above) — never commit real Super Admin credentials to any file.

## Changed Files

Repository-layer/action files were mechanically migrated from a flat
top-level Firestore collection to `tenantCollection()`/`tenantDoc()` (see
Store Isolation above) — the pattern is identical across all of them, so
individual line-level changes aren't enumerated here. Run `git status`/
`git diff` for the full list. Notable additions and fixes from this pass:

- `src/app/(admin)/admin/(protected)/layout.tsx` — added the tenant/`tenantId`
  cross-check that closes the cross-tenant admin read gap described above.
- `src/lib/tenant/current.ts` — added custom-domain resolution and the
  active-status gate.
- `src/types/store.ts`, `src/lib/firebase/repositories/stores.ts`,
  `src/app/(superadmin)/superadmin/(protected)/actions.ts` — `domains[]`,
  soft delete, reset-password, search.
- `src/lib/firebase/repositories/menus.ts`,
  `src/app/(admin)/admin/(protected)/menus/actions.ts` — fixed the
  admin/storefront menu divergence (both now read/write the same
  tenant-scoped document).
- `scripts/set-admin-claim.ts` — fixed the `superadmin` role-string mismatch
  and added `--tenant <slug>` so manually-provisioned admins get a correct
  `tenantId` claim.
- `firestore.rules` — moved `menus`/`banners`/`pages`/`testimonials`/`faqs`/
  `announcementBars` under `stores/{storeId}/...`.

## Super Admin Foundation

Builds out the Super Admin panel from a bare store list into the
foundation for selling multiple independent stores. Everything below is
additive — no existing Store Admin, storefront, or auth behavior changed.

### Role vocabulary

`src/types/role.ts` defines the platform's full role vocabulary:
`"super_admin" | "admin" | "manager" | "staff" | "customer"`, plus
`isSuperAdminRole()`/`isAdminRole()` guard helpers that wrap the exact claim
checks already used by `require-super-admin.ts`/`admin-auth.ts`. Only
`super_admin`/`admin` are enforced today; `manager`/`staff`/`customer` are
reserved for a future phase (no permission logic yet).

### Dashboard

`/superadmin` is now a dashboard (Total/Active/Disabled Stores widgets,
a Recent Stores list, Quick Actions), computed from a single
`getStores({ includeDeleted: true })` call — no extra reads per widget. The
full searchable store table + row actions (suspend/activate/delete/reset
password) moved to `/superadmin/stores`, otherwise unchanged.

### Store Creation Wizard

`/superadmin/new` now uses `StoreCreationWizard.tsx`, a 3-step, client-side
validated flow (Store Details → Owner Account → Review & Create) that calls
the same `createStore()` action as before. `StoreForm.tsx` still handles
editing an existing store, unchanged.

### Expanded automatic provisioning

`createStore()` now also seeds, inside the same rollback-guarded write path:
- `themeId` metadata on the Store doc (no new theme document — `getActiveTheme()`
  already falls back to `DEFAULT_THEME` when none is set).
- Default header/footer navigation (`stores/{id}/menus/header`, `/footer`).
- Two default draft CMS pages (`stores/{id}/pages`: Privacy Policy, Terms &
  Conditions).
- An optional `brandName` on the Store doc, used as `siteSettings/general`'s
  `storeName` when set (falls back to the store's legal `name`).

### Welcome email service (interface only, no SMTP)

`src/lib/email/` defines a `WelcomeEmailService` interface
(`sendWelcomeEmail({ storeName, storeUrl, adminUrl, email, temporaryPassword })`)
and a console-logging implementation, matching the existing
`src/lib/images/upload-service.ts` "service interface now, real integration
later" pattern. `createStore()` calls it once, best-effort, after the store
is fully committed — a failure here never blocks or rolls back store
creation. Swap `getWelcomeEmailService()`'s return value for a real provider
when ready; no other call site needs to change.

## Store Lifecycle Management

Full lifecycle management for an existing store, built entirely on the
Super Admin foundation above — no Firestore hierarchy change, no Store
Admin/CMS/Homepage Builder/Theme Builder/Products/Orders/Checkout changes.

### Archive / Restore (renamed from "delete")

`StoreStatus` is now `"active" | "suspended" | "archived"` — the previous
`"deleted"` value and `deleteStore()` action have been renamed to
`"archived"`/`archiveStore()` throughout (`types/store.ts`, `current.ts`,
`repositories/stores.ts`, `actions.ts`, list/detail UI), since archiving
already *was* the soft-delete behavior this task calls for ("never remove
tenant data"). New `restoreStore(id, status)` reverses it, restoring a store
to `"active"` or `"suspended"`.

### Store Details page

`/superadmin/{id}/edit` is now tabbed (`StoreDetailsTabs.tsx`):

| Tab | Contents |
|---|---|
| General | The existing store-info form, unchanged |
| Owner | Owner name/email/phone + Reset Password, Resend Welcome Email, Transfer Ownership |
| Theme | Read-only current theme metadata (still a single Default Theme — no picker) |
| Status | Status badge, Created/Last Updated, Activate/Suspend/Archive/Restore, Login As Store Owner, Clone Store, and the last 10 activity log entries |

### Ownership

- **Reset Store Owner Password** — unchanged, existing feature.
- **Resend Welcome Email** (`resendWelcomeEmail()`) — issues a fresh temp
  password (the original was never persisted, by design) and re-sends
  through the same `WelcomeEmailService` used at creation.
- **Transfer Ownership** (`transferOwnership()`) — strips the previous
  owner's admin claim and revokes their sessions immediately, then
  finds-or-creates a Firebase Auth user for the new owner with a fresh temp
  password and `{role:"admin", tenantId}` claim.

### Login As Store Owner (secure impersonation)

`POST /api/admin/impersonate/start` mints a Firebase custom token for the
target store's admin user (Super-Admin-only, verified server-side), and
stashes the Super Admin's own session cookie in a short-lived
`superadmin_return_session` cookie. The browser signs in with the custom
token exactly like a normal login (`signInWithCustomToken` → fresh ID token
→ the **existing, unchanged** `/api/admin/session` route) and lands on
`/admin`. A small banner (`ImpersonationBanner.tsx`, shown in the Store
Admin layout only when that stash cookie is present) offers **Return to
Super Admin**, which calls `POST /api/admin/impersonate/return` to restore
the original session — no re-authentication needed either direction.

### Store Clone

`cloneStore(sourceStoreId, { name, slug, ownerName, email })` provisions a
brand-new tenant (its own Auth user, its own Store doc — via the same
`provisionStoreShell()` helper `createStore()` now uses) and copies only:
`siteSettings/general`, all `homepageSections`, `menus/header` + `/footer`,
all `pages`, and the `themeId` field. It never reads or writes `products`,
`categories`, `brands`, `orders`, `customers`, or `reviews`.

### Activity Logs

New top-level `storeActivityLogs` collection (Admin-SDK-only, same posture
as `rateLimits`) records: `created`, `updated`, `suspended`, `activated`,
`archived`, `restored`, `ownership_changed`, `theme_changed`,
`password_reset`, `welcome_email_resent`, `cloned`, `impersonated` — one
write alongside each action's existing write, surfaced on the Store Details
page's Status tab via `getRecentActivity()`.

### Store List improvements

`/superadmin/stores` now supports a status filter (`active`/`suspended`/
`archived`/all) and simple in-memory pagination, alongside the existing
search — all still backed by the single existing `getStores()`/
`searchStores()` call, no added queries. The table also shows a Theme badge
and Created/Last Activity columns (`createdAt`/`updatedAt`, already present
on every fetched `Store`).

## Deployment Foundation

Architecture-only groundwork so every store is "production-ready" on paper
— no real deploy provider (Vercel/AWS/Firebase Hosting), no real DNS/SSL
checking, and no file uploads are wired up here. Everything below is
additive to the existing Super Admin/store-creation system; nothing in
Store Admin, CMS, Theme Builder, Homepage Builder, Products, Orders,
Checkout, or already-built Super Admin features was touched.

### Deployment Metadata

Every store gets a `stores/{id}/deployment/status` doc (same singleton-doc
shape as `siteSettings/general`) recording `deploymentStatus`,
`buildStatus`, `environmentStatus`, `productionUrl`, `previewUrl`,
`buildVersion`, and `lastDeployTime` — `src/types/deployment.ts` for the
shape, `src/lib/firebase/services/deployment-provisioner.ts` for the
initial values every store gets at creation (`not_deployed`/`idle`/
`development`, `productionUrl` = the store's own subdomain URL,
`previewUrl` a placeholder `preview-{slug}.{ROOT_DOMAIN}` string). Viewable
read-only on the Store Details page's new **Deployment** tab — there's no
"Deploy" button, since there's no real provider to trigger yet.

### Domain Management

`Store.domains` (the plain `string[]` `src/lib/tenant/current.ts` already
queries with `array-contains` for custom-domain resolution) is **unchanged
in shape** — DNS verification status, SSL status, primary-domain, and
redirect-target metadata instead live in a new, additive
`Store.domainSettings` map keyed by hostname (`src/types/domain-settings.ts`).
`src/lib/superadmin/domain-settings.ts`'s `syncDomainSettings()` keeps that
map reconciled with `domains[]` every time `createStore()`/`updateStore()`
writes it (new hostnames default to pending DNS/SSL, non-primary unless
they're the store's first custom domain; removed hostnames drop out of the
map) — one write, no extra round trip. A new `setPrimaryDomain()` action
and the Store Details page's new **Domains** tab let a Super Admin flag
which domain is primary. No real DNS lookup or certificate issuance happens
anywhere.

### Cloudinary Provisioning (metadata only)

`src/lib/firebase/services/cloudinary-provisioner.ts` writes
`stores/{id}/cloudinaryProvisioning/status` at creation — a record of the 7
asset-category folder paths (products, categories, cms, banners, brands,
logos, gallery) this store is provisioned for, reusing
`CLOUDINARY_FOLDERS` (`src/lib/cloudinary/folders.ts`) wherever a category
already maps to an existing admin image field. No Cloudinary API call, no
file upload — Cloudinary folders are created implicitly on first real
upload regardless, so this is purely a provisioning record.

### Theme Installer

The menus/CMS-pages/homepage-sections seeding that used to live inline in
`createStore()` is now `src/lib/firebase/services/theme-installer.ts`'s
`installDefaultTheme()` — same seed data, same behavior for the default
"Empty Store" template, just relocated into its own service (this is the
one internal refactor in this change, with no behavior difference for
existing stores).

### Store Templates

`StoreFormInput`/the creation wizard's Step 1 gain a **Template** choice:
**Empty Store** (today's existing default seeding, unchanged) or **Demo
Store**, which additionally seeds a handful of clearly-placeholder
`testimonials`/`faqs` docs and one extra homepage section — metadata only,
in normal tenant-scoped collections. Demo Store **never** inserts sample
`products`, `orders`, or `customers` — those collections stay completely
empty for both templates, per spec. `cloneStore()` doesn't take a
template — it keeps copying the source store's actual content as before,
but now also provisions fresh Cloudinary/Deployment metadata for the new
store (per-store infra, not content, so it's generated rather than copied).

## Store Settings Center

`/admin/settings` is now a tabbed Settings Center (14 tabs) instead of 5
stacked cards — the same `stores/{id}/siteSettings/{docId}` singleton-doc
pattern extended, not restructured. The 5 pre-existing tabs (General,
Shipping, Payments, Email, WhatsApp) keep their exact original fields and
`update*Settings()` actions; everything else is new.

**Deliberate reuse over duplication** (three places this overlapped with
existing settings):
- **SEO/Social**: `GeneralSettings.seoTitle`/`seoDescription` (existing,
  previously unused in the UI) now render on the new **SEO** tab;
  `socialLinks` (existing) gained `tiktok`/`linkedin` and now renders on the
  new **Social** tab (`twitter` field kept for compatibility, labeled "X").
  The **SEO** tab's Open Graph/Twitter Card/robots/canonical/sitemap fields
  are new (`SeoSettings`, `siteSettings/seo`).
- **Integrations**: Google Analytics/GTM/Meta Pixel are already owned by
  the existing `/admin/analytics/settings` page/doc (`AnalyticsSettings`) —
  the new **Integrations** tab only shows a read-only Configured/Not
  configured status for those (reusing the existing `getAnalyticsSettings()`)
  with a link over to edit them, plus read-only Cloudinary/Firebase status.
  It owns new, editable-but-not-connected fields itself: SMTP and reCAPTCHA
  (`IntegrationsSettings`, `siteSettings/integrations`).
- **Notifications**: the existing, detailed `WhatsAppSettings` (chat-button
  phone/message config) is untouched on its own **WhatsApp** tab. The new
  **Notifications** tab is a separate, simpler set of 4 channel-preference
  toggles (Email/Push/SMS/WhatsApp) for a future notification-dispatch
  system (`NotificationsSettings`, `siteSettings/notifications`).

**New tabs and their storage:**

| Tab | Type | Doc |
|---|---|---|
| Branding | `BrandingSettings` | `siteSettings/branding` |
| Localization | `LocalizationSettings` | `siteSettings/localization` |
| SEO | `SeoSettings` (+ existing General fields) | `siteSettings/seo` |
| Social | (existing `GeneralSettings.socialLinks`, extended) | `siteSettings/general` |
| Email Templates | `EmailTemplatesSettings` | `siteSettings/emailTemplates` |
| Integrations | `IntegrationsSettings` | `siteSettings/integrations` |
| Notifications | `NotificationsSettings` | `siteSettings/notifications` |
| Advanced | `AdvancedSettings` | `siteSettings/advanced` |

**Branding** is deliberately independent of the Theme Builder's `themes`
collection — it's basic brand-identity metadata (logo/favicon/loading-logo
URLs, primary/secondary color, font, border radius) for things like emails
and social previews, not the full visual theming system at `/admin/theme`.

**Email Templates** are subject-line + on/off metadata only — no HTML body
editor, no real sending (SMTP isn't connected).

**Backup** (new `src/types/backup-record.ts`, `stores/{id}/backupHistory/`
subcollection, `src/lib/firebase/services/backup-service.ts`) is
architecture only: "Request export"/"Request import" each queue a
`BackupRecord` with `status: "queued"` and nothing else — there is no real
export/import engine yet, matching the same "provisioner service, no real
integration" pattern already established by the Deployment Foundation work.

**Advanced** (maintenance mode, cache version, debug flag, theme rebuild
flag) is metadata only — none of these flags are wired to real behavior
(no storefront maintenance gate, no real cache-busting) in this pass.

## Default Theme Pack

Four installable default themes, selectable during Store Creation. Per the
existing architecture, **a theme is a curated bundle of seed data across
already-existing collections — no new rendering code, no new section
types, no new theme engine.** Every required section (announcement bar,
header/footer, mega navigation, hero banner, featured categories, featured
products, special offers, promo banner sections, brand slider,
testimonials, newsletter, Instagram gallery) maps onto a real,
already-wired `HomepageSectionType`/collection; FAQ maps onto the existing
CMS page-builder's `PageSectionType:"faq"`. Nothing about *how* any of
these render was touched — only what data gets seeded per theme.

### The four themes (`src/lib/themes/theme-presets.ts`)

| Theme | Suitable for |
|---|---|
| **Modern Commerce** | Electronics, Mobile, Computer, Accessories, Minimal, Premium |
| **Fashion Pro** | Clothing, Shoes, Beauty, Jewelry, Luxury |
| **Food Express** | Restaurant, Pizza, Burger, Bakery, Grocery |
| **Universal Premium** | Any ecommerce business (the safe default/fallback) |

Each preset supplies: a `Theme` override (colors/typography/buttons/header,
merged over the existing `DEFAULT_THEME`), an announcement bar, header +
footer navigation (including a real `megaMenu`-type item), the full
homepage section list (`hero`, `collections`, `featuredProducts`, `onSale`,
`promo` ×2, `brands`, `testimonials`, `socialGallery`, `newsletter`), a hero
banner + promo banners, starter testimonials/FAQs, and theme-flavored
Privacy/Terms/Refund copy.

### Installation (`src/lib/firebase/services/theme-installer.ts`)

`installDefaultTheme()` (previously seeding one hardcoded default) now
takes a `themeKey` alongside the existing `template` (Empty/Demo), looks up
the preset, and:
- Writes a **real, active** `stores/{id}/themes/{presetKey}` doc — previously
  `createStore()` only ever set the `DEFAULT_THEME.id` sentinel and never
  wrote an actual theme document; this is the one behavioral change, and
  it's exactly what the existing Theme Builder/`getActiveTheme()` already
  expect to read, so nothing there changes.
- Seeds `homepageSections`, `menus/header`+`footer`, `announcementBars`,
  `banners` (hero + promo), `testimonials`, and `faqs` from the preset,
  instead of the previous hardcoded 5-section/nav list.
- Seeds CMS pages `privacy`, `terms`, `refund` (content, published) and
  `faq` (one page + one `PageSectionType:"faq"` section) — reusing the
  existing CMS page-builder rendering path unchanged.

`createStore()` gained a `themeKey` input (default `"universal-premium"`);
the Store Creation Wizard's previously-disabled "Default Theme" dropdown
now offers the real 4 choices. `cloneStore()` is unaffected — it already
copies the *source* store's actual theme/content instead of installing a
preset.

### Fixed while wiring this up

The CMS pages theme installation seeds were previously created with slugs
`privacy-policy`/`terms-conditions`, but `src/app/privacy/page.tsx`/`terms/page.tsx`
query slugs `"privacy"`/`"terms"` — a pre-existing mismatch that meant
seeded legal-page content was never actually reachable at those routes.
Fixed as part of this change (now seeds `privacy`/`terms`/`refund` to match).

### New route

`src/app/refund/page.tsx` — added following the exact existing
Privacy/Terms pattern (`getPageBySlug("refund")`, render, "not published
yet" fallback). Neither existing Privacy nor Terms page was modified.

### Explicitly unchanged

About and Contact (Contact's real submission form stays as-is), the 404
page (`not-found.tsx` — already renders inside the root layout, so it
already inherits each store's active theme's CSS variables for free, with
no changes needed), the Theme Builder, Homepage Builder/CMS admin UIs,
Store Settings, Deployment Foundation, and Firestore hierarchy (every new
doc lands in an existing collection at its existing path).

## Enterprise Product & Inventory Management

Upgrades the Product module. A full read of the existing `Product` type/
repository/actions confirmed most of this list was **already fully
implemented, end-to-end**, before this pass: SKU, Barcode, Brand, Categories,
Product Labels (Featured/New/Sale/Best Seller + `badge`), Inventory
Tracking, Stock, Low Stock Threshold, Draft/Active/Archived, Product SEO,
Related Products, and — already fully wired — **Cross-Sell and Upsell**
(`crossSellProductIds`/`upsellProductIds` were already on `Product`, already
fetched on the product page, already editable in the form). Everything
below is what was genuinely missing, and every new piece mirrors an
existing pattern already in this codebase rather than inventing one.

### New fields (`src/types/product.ts`, additive only)

`costPrice`, `supplierId`, `collectionIds`, `reservedStock`,
`outOfStockBehavior` (`"hide" | "show_disabled" | "allow_backorder"`),
`scheduledPublishAt`, `frequentlyBoughtWithProductIds`. Profit margin and
available stock are **computed, not stored** (`src/lib/products/inventory-math.ts`),
so they can never go stale relative to price/stock. Per the "Do NOT modify
Orders/Checkout" constraint, `reservedStock`/`outOfStockBehavior`/
`scheduledPublishAt` are schema + admin UI only — not enforced by any
checkout/order flow yet.

### Suppliers & Collections (new entities, mirror `brands` exactly)

Two new tenant-scoped CRUD entities under `/admin/suppliers` and
`/admin/collections`, same repository/actions/form/soft-delete shape as
`brands`. Suppliers are **admin-only** (procurement contact info, never
storefront-facing). Collections are public-read like brands/categories,
with a storefront-ready `getProductsByCollectionId()` query — not yet wired
into a new browsing route (out of scope for the Product module).

### Auto SKU generator

`src/lib/firebase/services/sku-generator.ts` — a "Generate" button next to
the SKU field in the product form suggests a slug-derived, collision-checked
SKU; admins can still type their own.

### Product Duplication

`duplicateProduct()`, same field-by-field-copy shape as the existing
`duplicateBanner()`/`duplicateTestimonial()` — copies the product (and its
variants) as a new draft with a fresh slug and cleared SKU/barcode. A
"Duplicate" button was added to the products list row actions.

### Product Activity Log

Mirrors `storeActivityLogs` exactly, but **tenant-scoped**
(`stores/{id}/productActivityLogs`, not Super-Admin-global): records
created/updated/trashed/restored/permanently_deleted/stock_adjusted/duplicated,
one write alongside each existing action's write. Shown as a read-only
panel on the product edit page.

### Bulk Import / Export (architecture only, no engine)

Mirrors the Deployment Foundation's `BackupRecord`/`backup-service.ts`
pattern exactly: a new `/admin/products/bulk` page queues an
import/export request (`productBulkOperations`, status `"queued"`) and
shows history — no CSV parsing or real file I/O happens yet.

### Verified unchanged

Existing product create/edit/soft-delete/restore/permanently-delete/
stock-adjust all keep their original writes untouched (new fields/activity-
log writes are additive, alongside them, not replacing them). Storefront
product page, search, category pages, and homepage sections render
unchanged. Orders, Checkout, Super Admin, Store Settings, Deployment
Foundation, Theme Builder, Homepage Builder, and CMS were not touched.

## Enterprise Orders Management

Upgrades the Orders module. A full read of the existing `Order` type/
repository/actions confirmed `statusHistory` (with per-entry notes) and a
bare `trackingNumber` field were **already implemented** before this pass.
Everything below is what was genuinely missing, and every new piece mirrors
an existing pattern already in this codebase (most from the Enterprise
Product & Inventory Management pass above) rather than inventing one.

### New fields (`src/types/order.ts`, additive only)

`paymentStatusHistory` (Payment Timeline — a parallel array to the existing
`statusHistory`, same shape, appended alongside `updatePaymentStatus`'s
existing write, not a new collection), `internalNotes`/`customerNotes`
(append-only note arrays), `courierName`/`dispatchDate`/`deliveryDate`
(Shipment Information — `courierName` is a new field, never repurposing the
existing `trackingNumber`), `cancellationReason`/`cancelledAt`/`cancelledBy`
(Cancellation Workflow), `refundReason`/`refundAmount`/`refundedAt`/
`refundedBy` (Refund Workflow), `returnStatus`/`returnReason`/
`returnStatusHistory`/`returnRequestedAt`/`returnResolvedAt`/
`returnResolvedBy` (Return Workflow).

### Order Timeline & Order Analytics metadata (computed, not stored)

`src/lib/orders/order-timeline.ts` merges `statusHistory` +
`paymentStatusHistory` + `returnStatusHistory` + the new Order Activity Log
into one sorted view, rendered only. `src/lib/orders/order-analytics.ts`
computes order age, fulfillment duration, delivery duration, and a "stale"
flag from existing/new fields — mirrors `inventory-math.ts`'s "pure calc
kept out of Firestore" style. Nothing new is written for either.

### Cancellation / Refund / Return Workflows

`cancelOrder()`, `initiateRefund()`, and `updateReturnStatus()` in
`orders/actions.ts` are real, enforced order-lifecycle actions — they
guard against invalid transitions (e.g. cancelling an already-delivered
order, refunding more than the order total) and update order state. **They
never touch stock.** The stock decrement happens inside Checkout's
`createGuestOrder` transaction; symmetrically restoring it here would mean
the Orders module writing to `products`/`variants` docs, taking on
Inventory's write-responsibility rather than just avoiding its files — the
same precedent the previous pass set for `reservedStock`/
`outOfStockBehavior`. The admin UI carries an explicit note that stock
isn't auto-restored and should be adjusted manually on the Inventory page.

### Order Activity Log

Mirrors `productActivityLogs` exactly, tenant-scoped
(`stores/{id}/orderActivityLogs`): records status/payment/shipment/note/
cancellation/refund/return/document-queue actions, one write alongside each
existing action's write. Feeds the computed Order Timeline on the order
detail page.

### Invoice / Packing Slip / Shipping Label (architecture only, no engine)

Mirrors the Product module's Bulk Import/Export pattern: `requestOrderDocument()`
queues an `orderDocuments` record (`status: "queued"`) for one of
`"invoice" | "packing_slip" | "shipping_label"` — no PDF rendering engine
exists yet. The existing "Print invoice" `window.print()` button is
untouched; this is purely additive alongside it.

### Order Export (architecture only, no engine)

A new `/admin/orders/export` page queues an export request
(`orderBulkOperations`, status `"queued"`) and shows history — no CSV
generation happens yet. Store-wide rather than per-order, so (like the
Product module's bulk export) it isn't written to the per-order activity
log.

### Advanced Filters

`searchAdminOrders()` additively supports `paymentStatus`/`returnStatus`
equality filters, a `createdAt` date range (`dateFrom`/`dateTo`), and an
order-number prefix search — each paired with a new composite index (or, for
the order-number search, no new index at all, since its range field and
`orderBy` field are the same). Filters stay mutually exclusive rather than
combining, to avoid an index-combinatorics blowup. The existing
`orderStatus` filter and its index are untouched.

### Verified unchanged

Existing `updateOrderStatus`/`updatePaymentStatus`/`setTrackingNumber` keep
their original writes untouched (new fields/activity-log writes are
additive, alongside them, not replacing them); `OrderActions.tsx` (status/
payment selects, tracking save, print invoice) is byte-identical. Existing
checkout (`placeGuestOrder` → `createGuestOrder`) still creates orders
unchanged. No new code path writes to `products`/`variants`. Products,
Checkout, Theme Builder, CMS, Homepage Builder, Super Admin, Store
Creation, Inventory, and Deployment Foundation were not touched.

## Enterprise Payments & Finance Foundation

This is greenfield: before this pass there was no commission, ledger,
payout, or finance concept anywhere in the codebase - only order-scoped
scalar fields (`refundAmount`/`refundedAt`/`refundedBy`, a single
overwritable value with no history of multiple partial refunds), flat
manual/instructions-based `PaymentSettings` (no provider abstraction), and
revenue dashboards (`getOrderStats`/`getRevenueTrend`/`getSalesOverview`)
that summed `order.total` rather than netting out actual refund amounts.
Every new piece below mirrors one of two patterns already proven
elsewhere: tenant-scoped audit-log collections (`orderActivityLogs`) for
per-store data, or the genuinely global `storeActivityLogs` shape (root
collection, `storeId` field, Admin-SDK-only) for platform-wide data.

### Transaction Ledger

A new tenant-scoped `transactions` collection (`stores/{id}/transactions`)
is the source of truth for payment/refund history - append-only, so unlike
the existing single-scalar `refundAmount` field, multiple events over an
order's life are all individually recorded. It hooks into the *existing*
`updatePaymentStatus`/`initiateRefund` Server Actions (one additive
`logTransaction` call each, alongside their original unchanged writes) -
this was the only way to capture a "payment received" event without
touching Checkout's `createGuestOrder`. A `payment` transaction's
`commissionAmount` is computed once via the Commission Engine's settings
and stored at write time - a deliberate exception to "compute, don't
store": a ledger entry is a historical fact that must not change if the
store's commission rate is edited later.

### Commission Engine

A new "Commission" tab in the Settings Center (`CommissionSettings`:
`type: "percentage" | "fixed" | "none"` + `value`), store-level
configuration only, wired exactly like every other settings tab
(type → `getCommissionSettings()`/`updateCommissionSettings()` →
Settings page fetch → tab UI). `calculateCommission()`
(`src/lib/finance/commission.ts`) is a pure function applied to each
`payment` transaction.

### Store Financial Summary

A new `/admin/finance` page shows Gross Sales, Net Sales, Refunds,
Commission, Pending Balance, and Available Balance - all computed on read
from the Transaction Ledger + Payout records + Commission settings
(`getStoreFinancialSummary()`), nothing new stored. "Pending balance" is
payouts already requested and still processing; "available balance" is net
earnings not yet paid out or requested. The page also hosts the
Transaction Ledger table and a Finance Report request panel.

### Super Admin Financial Dashboard

A new `/superadmin/finance` page shows Total Platform Revenue, Total
Commission, Active Stores, Pending Payouts, Monthly Revenue, and a Top
Stores list - computed via a single `collectionGroup("transactions")` scan
across every store's ledger (`getPlatformFinancialDashboard()`), avoiding
an N+1 loop over every store. Active Stores reuses the existing
`status === "active"` filter with zero new code.

### Payout Architecture (architecture only, no payment transfer integration)

A new root-level `payouts` collection (mirrors `storeActivityLogs` exactly
- `storeId` field, Admin-SDK-only, denied to any client SDK in
`firestore.rules`) tracks `pending → processing → paid`/`failed` status.
Only a Super Admin action ever advances a payout's status (manual button
click); nothing here calls a real payment rail.

### Finance Reports (architecture only)

Mirrors the Order/Product bulk-export pattern exactly: requesting a report
from the `/admin/finance` page queues a `financeReports` record
(`status: "queued"`) with an optional period range - no report is actually
generated yet.

### Tax Metadata (architecture only)

A new "Tax" Settings tab (`taxId`, `taxJurisdiction`, `taxRegistered`) is
purely registration/jurisdiction metadata for a future invoicing phase.
`GeneralSettings.taxRatePercent`/`taxInclusive` remain the only fields
Checkout's real tax math reads - unchanged, and not duplicated here.

### Multi-payment Provider Architecture (architecture only, no live integrations)

`src/lib/payments/provider.ts` defines a `PaymentProvider` interface
(`initiatePayment`/`verifyPayment`/`refundPayment`); six stub
implementations (Stripe, PayPal, JazzCash, EasyPaisa, Bank Transfer, COD)
share one factory (`createStubProvider`) to avoid six near-identical
classes, each returning a clearly-labeled not-yet-implemented result. A
`PAYMENT_PROVIDERS` registry maps provider id → instance. This is
deliberately isolated scaffolding - never imported by Checkout or the
existing `PaymentMethod`/`PaymentSettings` types (verified by grep).

### Verified unchanged

`updateOrderStatus`/`setTrackingNumber`/etc. are untouched;
`updatePaymentStatus`/`initiateRefund` keep their exact original writes
and error behavior, with one additive `logTransaction` call each. Existing
checkout (`placeGuestOrder` → `createGuestOrder`) and `computeOrderTotals`
were not edited at all. No new code path writes to `products`/`variants`.
Products, Inventory, CMS, Theme Builder, Homepage Builder, Deployment
Foundation, Store Creation, and Checkout were not touched.

## Enterprise Platform Hardening

No new features, no Firestore hierarchy changes, no UI redesign. Three
audits (security, performance, code-quality/reliability) surveyed the
codebase; every fix below is additive/surgical and preserves existing
behavior for legitimate input.

### Files changed

`src/middleware.ts`; `src/lib/cloudinary/folders.ts`;
`src/lib/firebase/repositories/orders.ts`; `src/app/(admin)/admin/(protected)/products/actions.ts`;
`src/types/blog-post.ts`, `src/lib/firebase/repositories/blog-posts.ts`,
`src/app/(admin)/admin/(protected)/blog-posts/actions.ts`;
`src/types/analytics-event.ts`, `src/lib/firebase/repositories/analytics.ts`,
`src/app/api/analytics/track/route.ts`, `src/app/api/analytics/heartbeat/route.ts`;
`src/app/contact/actions.ts`; `src/lib/newsletter/actions.ts`;
`firestore.indexes.json`; `src/app/(superadmin)/superadmin/(protected)/actions.ts`;
`src/app/(admin)/admin/(protected)/customers/[id]/page.tsx`;
`src/lib/utils/slugify.ts` (new, replacing `src/lib/superadmin/slugify.ts`)
and its 9 consumers (`ProductForm`/`BrandForm`/`BlogPostForm`/`CategoryForm`/
`CollectionForm`/`PageForm`/`StoreForm`/`StoreCreationWizard`/`CloneStoreDialog`);
`src/app/product-detail-2/page.tsx`; `src/components/ModalDelete.tsx`;
`src/app/(admin)/admin/(protected)/error.tsx` (new),
`src/app/(superadmin)/superadmin/(protected)/error.tsx` (new).

### Security improvements

- **Tenant-slug header spoofing (critical):** `middleware.ts` forwarded a
  client-supplied `x-tenant-slug` header untouched whenever the request host
  wasn't recognized as one of the app's own subdomains (e.g. any custom
  domain) - letting an anonymous request, including guest checkout, hijack
  tenant resolution to a different store just by setting a header. Fixed by
  unconditionally clearing the header before any trusted value is set.
- **Upload path traversal:** the image-upload API's `subfolder` field flowed
  client-controlled and unsanitized into the Cloudinary storage path.
  `buildPublicId()` now strips anything outside `[a-zA-Z0-9-]`.
- **Unvalidated negative input:** `createGuestOrder` now rejects
  non-positive/non-integer cart quantities (previously a negative quantity
  reduced the order total and *increased* stock instead of decrementing
  it); `createProduct`/`updateProduct`/`adjustProductStock` now reject
  negative price/stock/threshold values server-side.
- **Cross-tenant data leaks (undisclosed - fixed):** blog posts, analytics
  events/sessions/visitors, contact-form submissions, and newsletter
  subscribers were all root-level Firestore collections with no tenant
  field - every store admin could see and, for blog posts, edit/delete
  every other store's data. Fixed by adding a `storeId` field at write time
  and filtering every read by it (collection paths unchanged - no
  hierarchy migration). `updateBlogPost`/`deleteBlogPost` also gained an
  explicit not-found guard so a foreign-tenant post id can no longer be
  mutated. (The separate, already-documented `reviews` cross-tenant
  trade-off was left as-is, per the accepted scope for this pass.)

### Performance improvements

- Added 8 missing composite indexes for `searchProducts`'s
  default/newest/rating/price sort branches (with and without a category
  filter) - these were live queries with no matching index, meaning an
  ordinary `/category/[slug]` or `/search` page visit would throw in
  production. Added `customers (role, createdAt)` (the existing index was
  declared for a dead `users` collection nothing reads/writes) for the
  admin Customers list, which had the same gap. Added indexes for the new
  `storeId`-filtered queries above.
- `normalizeAndValidateDomains` (Super Admin store domain validation): N+1
  sequential `isDomainTaken` calls in a loop → batched `Promise.all`.
- Customer detail page: folded a 3rd independent read into the existing
  `Promise.all` instead of awaiting it first.
- **Flagged, not changed:** `getStores()`/`getInventoryProducts()` do
  unbounded full-collection reads with no `.limit()`. A real fix needs
  either new pagination UI (out of scope - no redesign) or a silent cap
  (would undercount the Super Admin dashboard/hide inventory rows - a
  correctness regression). Left as a documented scalability risk for a
  dedicated follow-up.

### Code quality

- Consolidated 6 byte-identical inline `slugify()` implementations (product/
  brand/blog-post/category/collection/page forms) plus a 7th duplicate in
  `src/lib/superadmin/slugify.ts` into one shared `src/lib/utils/slugify.ts`,
  imported by all 9 call sites.
- Removed the dead `users` Firestore index (nothing reads/writes that
  collection) and two stray debug `console.log`s.

### Reliability

- Added `error.tsx` to both `(admin)/admin/(protected)` and
  `(superadmin)/superadmin/(protected)` - previously any thrown error in
  either app fell through to the root error page, replacing the entire
  screen including the nav shell. The new segment-level boundaries render
  inside the existing `AdminShell`/`SuperAdminShell` layout, so navigation
  stays usable after a page-level error.

### Verification completed

`npx tsc --noEmit` and `npm run build` both pass cleanly (94 routes
generated, no new warnings). Confirmed via grep that every write to the
four newly-scoped collections now stamps `storeId` and every read filters
by it; confirmed no `tenantCollection()`/`adminDb().collection()` call
changed its collection path (additive fields/filters only, no hierarchy
change). Checkout, product CRUD, order actions, settings, finance, theme,
homepage, CMS, deployment, and store creation all keep their exact existing
behavior for legitimate input - only invalid input is newly rejected.

## Enterprise Customer CRM

Before this pass, `Customer` was minimal (`{uid, email, displayName?, phone?,
role, totalSpend?, orderCount?, createdAt?}`, 3 read functions, no
`actions.ts`) - and two things were true of the actual running app that
shaped every decision below: **there is no working customer authentication
anywhere** (the storefront's login/signup pages are static UI templates with
zero Firebase Auth wiring), and **the `customers` collection has zero
writers today** - it's always empty in production. Wishlist is 100%
anonymous browser localStorage, never linked to a customer account. Per an
explicit scope decision, `lastLoginAt` and Wishlist Count are schema/display
only - no fake data, no new authentication system, no new always-empty
wishlist collection invented just to backfill a number. Everything else
below is built for real, operating on whatever customer records exist.

### Guest customers are computed, not stored

Because real registered accounts don't exist in practice yet, but guest
checkout does, and the task requires a "Guest" status, guest customers are
**virtual rows computed from Orders at read time** (grouped by `guestEmail`,
via `getGuestCustomers()`) - never written preemptively. A guest only gets a
real `customers/{email}` Firestore doc the first time an admin actually acts
on them (tags/notes/status/GDPR), via `getOrCreateCustomerDoc()`; merely
viewing a guest's profile (`resolveCustomerForDisplay()`) never writes
anything. The admin route id convention (`guest-<encoded email>`) stays
stable across that transition. This satisfies "compute on read where
possible" and "do not duplicate data" without any Checkout change.

### Customer Profile

Additive `Customer` fields: `status` (`active|blocked|deleted|guest`,
undefined treated as `active` for pre-existing docs), `tags: string[]`,
`internalNotes` (mirrors `Order.internalNotes`' append-only shape),
`lastLoginAt` (schema only, see above). Multiple addresses (existing
`customers/{uid}/addresses` subcollection) and registration date (existing
`createdAt`) already satisfied this requirement untouched.

### Customer Analytics (computed on read, `src/lib/customers/analytics.ts`)

Total Orders, Total Spend, Avg Order Value, Lifetime Value, and Last
Purchase are all derived from the customer's own orders in memory (spend
nets out each order's existing `refundAmount` - no Transaction Ledger query
needed). Total Reviews comes from a new read-only `getReviewsByUserId()`
in `reviews.ts`. Wishlist Count is `null` ("not trackable") rather than a
fake zero.

### Customer Timeline (`src/lib/customers/timeline.ts`)

Merges registration, one entry per order, payments/refunds (flattened
from each order's existing `paymentStatusHistory` - no new query), reviews,
and the new Customer Activity Log - mirrors `order-timeline.ts`'s exact
computed-not-stored style.

### Customer Segments (computed on read, `src/lib/customers/segments.ts`)

New, Returning, VIP, High Spender, Inactive, and Newsletter (checked
against the tenant-scoped `newsletterSubscribers` collection from the
Finance/Hardening passes) are all real, computed from analytics + a cheap
single-doc lookup. Abandoned Cart is **architecture only** per the task -
the type exists, detection always returns false (no server-side cart-
abandonment tracking exists yet).

### Customer Tags, Internal Notes, Customer Status

New `customers/actions.ts` (didn't exist before): `updateCustomerTags()`
(comma-separated input, mirrors `ProductForm`'s tag UI), `addCustomerNote()`
(mirrors `Order`'s `addInternalNote`), `updateCustomerStatus()`. All three
work identically for real and guest-derived customers (the same doc-id
string, whether a uid or an email) and log to the new Customer Activity Log.

### Customer Activity Log (mirrors `orderActivityLogs` exactly)

New tenant-scoped `customerActivityLogs` collection
(`{id, customerId, action, actorUid, meta?, createdAt?}`), feeds the
Timeline above.

### Export Architecture (CSV/Excel, architecture only)

New `/admin/customers/export` page mirrors `orders/export` exactly: a
`customerExportOperations` collection, `queueCustomerExport()` writes a
`"queued"` record only - no real file-generation engine.

### GDPR Foundation (architecture only)

New `gdprRequests` collection + `gdpr-service.ts`: `requestCustomerDataExport()`
queues a record only (no data package generated yet); `requestCustomerDeletion()`
queues a record **and** soft-deletes the customer's own profile
(`status: "deleted"`) - the customer's Orders/Reviews are legal/business
records and are explicitly not touched; `deactivateCustomer()` sets
`status: "blocked"`. All three log to the Activity Log and appear in a
GDPR history panel on the customer detail page.

### Verified unchanged

`getCustomers`/`getCustomerById`/`getCustomerAddresses`/`getCustomerCount`
keep their exact original signatures/behavior (only their internal
timestamp-handling was made consistent with every other repository via a
small `customerDocData()` helper - Customer uses `uid` not `id`, so
`docData()` couldn't be used directly). Only new, read-only functions were
added to `orders.ts`/`reviews.ts` - no Order/Review workflow logic changed.
Products, Checkout, Finance, Theme Builder, Homepage Builder, CMS, Super
Admin, and the Firestore hierarchy were not touched.

## Public SaaS Website

A new public marketing site for the platform itself (not any tenant's
store), living at `/platform/*` - reachable on any host, the same mechanism
already used by `/superadmin` (per `middleware.ts`'s own comment: "The Super
Admin app is reachable at /superadmin regardless of host").

### Why `/platform` and not the bare domain root

The task's page list (Home, About, Privacy, Terms, Contact, FAQ) collides
directly with existing *tenant storefront* routes at those same paths
(`src/app/about/page.tsx`, `/privacy`, `/terms`, `/contact`, `/faq`, and `/`
itself is the tenant homepage). Reusing them would silently replace every
store's own pages. `src/app/layout.tsx` is also the app's one and only root
layout - Next.js always wraps every route in it, so a marketing page can
never be technically separated from the storefront's chrome by nesting
alone. Both constraints are solved without touching tenant resolution or
store rendering at all: a new `/platform` route segment (§1), and a
precedented one-line suppression of the storefront chrome on that path (§2)
- the exact same pattern this codebase already used to hide `AnnouncementBar`/
`WhatsAppButton` on `/admin` routes.

### 1. New route group: `src/app/(marketing)/platform/`

Own nested `layout.tsx` renders a new, self-contained `MarketingHeader`/
`MarketingFooter` (`src/components/marketing/`) - no tenant/theme/menu
dependency. Pages: Home (`page.tsx`), Features, Themes (renders the real
`THEME_PRESETS` from `src/lib/themes/theme-presets.ts` - the actual 4
production themes, not duplicated data), Pricing (content only, no
billing), How It Works, FAQ, About, Privacy, Terms, Contact, Book a Demo,
and a Login Gateway (`/platform/login` - two links, `/admin/login` and
`/superadmin/login`, no auth logic of its own). Each page exports its own
`metadata` so it overrides the root layout's `{title:"Admin"}` no-tenant
default.

### 2. Storefront-chrome suppression (the only edits to shared files)

`AnnouncementBar.tsx`/`WhatsAppButton.tsx`: their existing `isAdminRoute`
check now also matches `/platform`. `SiteHeader.tsx`: one added line
(`if (pathname?.startsWith("/platform")) return null;`) next to its
existing `/home-2` check. `Footer.tsx`: one added `usePathname()` call +
the same early return. `layout.tsx`, `ClientProviders.tsx`, `middleware.ts`,
and `tenant/current.ts` were not touched at all.

### 3. Book a Demo → tenant-independent, CRM-ready architecture

New root-level `bookDemoRequests` collection (`src/types/book-demo-request.ts`,
`src/lib/firebase/repositories/book-demo-requests.ts`) - genuinely
tenant-independent (no `tenantCollection()`/`getCurrentTenant()` call
anywhere in the path, since this is about prospective platform customers,
not any existing store). `status` (`new|contacted|converted|archived`) and
`crmSynced: boolean` exist purely so a *future* CRM integration has fields
to update - nothing reads or syncs them yet, and no Super Admin UI was
added to view these (that would start the CRM integration this task
explicitly says not to build). `firestore.rules`: admin-SDK-only, same
posture as `storeActivityLogs`/`payouts`.

### Files changed

New: `src/app/(marketing)/platform/**` (12 pages + layout + Book Demo
actions/form), `src/components/marketing/MarketingHeader.tsx` +
`MarketingFooter.tsx`, `src/types/book-demo-request.ts`,
`src/lib/firebase/repositories/book-demo-requests.ts`. Modified (additive
one-liners only): `src/components/AnnouncementBar.tsx`,
`src/components/WhatsAppButton.tsx`, `src/app/SiteHeader.tsx`,
`src/shared/Footer/Footer.tsx`, `firestore.rules`.

### Verification

`npx tsc --noEmit` and `npm run build` both pass cleanly - all 12
`/platform/*` routes present in the build output alongside every existing
route unchanged (`/`, `/about`, `/contact`, `/faq`, `/privacy`, `/terms`,
`/admin/*`, `/superadmin/*`). Confirmed via `git diff` that `layout.tsx`,
`ClientProviders.tsx`, `middleware.ts`, and `tenant/current.ts` have zero
changes from this task, and that the 4 chrome-guard files each received
only a 1-4 line additive diff.

### Future integration points

A future CRM module would: read `bookDemoRequests` (add a Super Admin view/
repository getters), set `crmSynced`/`status` as leads are processed, and
optionally sync to an external CRM via a queued-job pattern (mirroring the
"architecture only" queue services already used elsewhere - `order-bulk-service.ts`,
`customer-export-service.ts`, `finance-report-service.ts`). None of that is
implemented here, per the task.

## Public SaaS Website — Routing Integration

Follow-up to the Public SaaS Website task above: the marketing site now
renders at `/` (the true root domain / localhost with no tenant resolved)
instead of only at `/platform`. Pure routing integration - no `/platform`
page, layout, or component was rebuilt or duplicated; `src/app/page.tsx`
now imports and reuses them directly.

### What changed

- **`src/app/page.tsx`**: the existing `PageHome` Server Component now
  calls `getCurrentTenant()` (the same non-throwing getter already used by
  `layout.tsx`) as its first step. If no tenant resolves, it returns
  `<PlatformLayout><PlatformHomePage /></PlatformLayout>` - both imported
  directly from `(marketing)/platform/layout.tsx` and `(marketing)/platform/page.tsx`,
  which are otherwise completely unmodified. If a tenant resolves, every
  existing line of the tenant storefront homepage runs exactly as before,
  now inside that branch - zero behavior change for tenant domains. A new
  `generateMetadata()` reuses the `/platform` page's own `metadata` export
  when there's no tenant (preserving real SEO title/description instead of
  the root layout's `{title:"Admin"}` no-tenant fallback), and defers to
  the existing tenant-based metadata logic otherwise.
- **`AnnouncementBar.tsx`, `WhatsAppButton.tsx`, `SiteHeader.tsx`,
  `Footer.tsx`**: each already suppressed itself on `/admin` and
  `/platform` routes (from the previous task). One more condition was
  added to each - `pathname === "/" && !tenantId` (tenant id read via the
  existing `useTenantId()` context hook) - so the storefront's cart/nav/
  WhatsApp/announcement-bar chrome doesn't wrap the marketing content when
  it renders at the bare root. This only changes behavior for "/" with no
  tenant; every tenant domain's "/" keeps its exact existing chrome
  (non-empty tenant id), and `/admin`/`/superadmin` are unaffected (neither
  condition changed for them).
- **`MarketingHeader.tsx`**: its "Home" nav link and logo link changed from
  `/platform` to `/` - the one piece of "routing indirection that only
  existed because pages were under /platform." Every other nav link
  (Features/Themes/Pricing/etc.) is unchanged, since those pages still
  live at their existing `/platform/...` paths.

### Not touched

`middleware.ts`, `src/lib/tenant/current.ts`, `ClientProviders.tsx`, every
`/platform/*` page and layout file, Store Admin, Super Admin, Firestore
rules/indexes, provisioning, deployment, theme installer. No new files
were created.

### Verification

`npx tsc --noEmit` and `npm run build` both pass cleanly - `/` and every
`/platform/*` route (still independently reachable) appear in the build
output unchanged in count, alongside `/admin/login` and `/superadmin/login`.
Confirmed via `git diff` that `middleware.ts`, `tenant/current.ts`, and both
`/platform` page/layout files have zero changes from this task. Live
browser verification of the no-tenant "/" branch wasn't performed in this
environment (no live Firestore data to resolve "no tenant" against
locally, since the dev fallback in `tenant/current.ts` resolves to the
first available store when `DEV_TENANT_SLUG` is unset) - this should be
smoke-tested against a real deployment before relying on it in production.

## Platform Domain vs. Tenant Domain Routing

Follow-up to the two Public SaaS Website tasks above: the platform/tenant
distinction now lives in `middleware.ts` itself (previously it lived only
in `src/app/page.tsx` checking tenant at render time), and every marketing
page is reachable at its bare path (`/features`, `/pricing`, `/themes`,
`/how-it-works`, `/faq`, `/about`, `/privacy`, `/terms`, `/contact`,
`/book-demo`, `/login`) instead of under a `/platform` prefix. No page,
layout, or component under `(marketing)/platform/` was moved, rebuilt, or
duplicated - middleware rewrites the bare path to the existing file.

### Platform domain flow

A request's host is now classified as the **platform domain** when it's
`NEXT_PUBLIC_ROOT_DOMAIN` itself, `www.` + that domain, or `localhost`/
`127.0.0.1` with no `DEV_TENANT_SLUG` configured - all pure string
comparison, no Firestore lookup (same Edge-safe constraint the existing
subdomain check already had). For those hosts, `middleware.ts` rewrites
`/` → `/platform` and `/{slug}` → `/platform/{slug}` for the known
marketing slugs above, entirely server-internally - the browser's address
bar and `usePathname()` still show the bare path. `/superadmin/*` is
unaffected (its existing host-independent bypass, untouched, still runs
first).

### Tenant domain flow

A request's host is the **tenant domain** case whenever the existing
subdomain check (`{slug}.ROOT_DOMAIN`) resolves a `slug` - completely
unchanged logic. That branch now returns immediately after setting the
tenant header, before any platform-domain check runs, so a tenant's `/`,
`/admin`, `/about`, `/privacy`, `/terms`, and `/contact` all keep resolving
to their existing tenant storefront/Store Admin pages exactly as before -
these routes were never touched. As an explicit safety net, a tenant domain
visiting `/platform/*` directly now redirects to `/` instead of rendering
the marketing site. A tenant's *custom* domain (e.g. a store's own
`glamix.com`) is unaffected by any of this new logic - middleware still
can't (and doesn't try to) look up `domains[]` at the Edge, so that
resolution continues exactly as before, server-side in `tenant/current.ts`.

### Chrome-suppression simplified

The 4 shared components that hide storefront chrome on the marketing site
(`AnnouncementBar`, `WhatsAppButton`, `SiteHeader`, `Footer`) previously
checked `pathname.startsWith("/platform")`, which stopped working once
URLs went bare (a middleware rewrite is invisible to the client's
`usePathname()`). They now check `!tenantId` (via the existing
`useTenantId()` context hook) instead - correct in every case, since no
tenant ever resolves on the platform domain regardless of which marketing
path was requested or whether it was rewritten. `/admin`'s pre-existing
check (only on `AnnouncementBar`/`WhatsAppButton`, which already had it) is
kept as-is; `/superadmin` was added defensively to all 4, since that path
is reachable on any host including a tenant's own domain.

### Files changed

`src/middleware.ts` (platform-domain detection + rewrite + tenant-domain
`/platform` redirect guard); `src/components/AnnouncementBar.tsx`,
`src/components/WhatsAppButton.tsx`, `src/app/SiteHeader.tsx`,
`src/shared/Footer/Footer.tsx` (guard condition simplified to `!tenantId`);
`src/components/marketing/MarketingHeader.tsx`,
`src/components/marketing/MarketingFooter.tsx`, and the 3 internal CTA
links in `(marketing)/platform/page.tsx`/`pricing/page.tsx`/`contact/page.tsx`
(hrefs updated from `/platform/...` to the new bare canonical paths - no
content/copy/structure changes).

### Not touched

`src/app/page.tsx`, `tenant/current.ts`, every `(marketing)/platform/*`
page/layout file's content, Store Admin, Super Admin, Firestore rules/
indexes, provisioning, and the theme installer.

### Verification

`npx tsc --noEmit` and `npm run build` both pass cleanly. `/features`,
`/pricing`, `/themes`, etc. correctly do **not** appear as new routes in
the build output (they're rewrites, not files) - only the existing
`/platform/*` routes remain, unchanged, alongside every tenant storefront
route (`/`, `/about`, `/contact`, `/faq`, `/privacy`, `/terms`), `/admin/*`,
and `/superadmin/*`. Confirmed via `git diff` that `tenant/current.ts`,
`src/app/page.tsx`, Store Admin/Super Admin files, Firestore rules/indexes,
and every `(marketing)/platform/*` page/layout file have zero content
changes from this task - only `middleware.ts`, the 4 chrome guards, and a
handful of `href` values changed. As with the prior two routing tasks, a
full live-domain smoke test (verifying the actual `NEXT_PUBLIC_ROOT_DOMAIN`
comparison and a real tenant subdomain/custom domain side by side) wasn't
possible in this sandboxed environment - recommend verifying against a
real deployment before relying on it in production.

## Enterprise Firestore Index Management & Graceful Query Recovery

Every Firestore query across the repository layer was audited against the
existing `firestore.indexes.json`. Most "enterprise module" collections
(Order/Product/Customer Activity Logs, Transactions, Payouts, Order
Documents, GDPR Requests, Blog Posts, Analytics, Store Activity Logs)
already had their composite index declared - the real gaps were in older
catalog/CMS repository functions. No business logic, filter behavior, or
UI changed anywhere in this pass - only two things were added: missing
index declarations, and a query wrapper that stops a missing/still-building
index from ever crashing a page.

### Generated indexes

New entries added to `firestore.indexes.json` (nothing existing was
changed or removed):

- `categories`, `brands`, `collections`: `isDeleted ASC, order ASC` - fixes
  `getAllXForAdmin(includeDeleted=false)`, which Firestore's leftmost-prefix
  rule blocked from using the existing `isActive+isDeleted+order` index
  (that query never filters on `isActive`).
- `products`: `isDeleted ASC, trackInventory ASC` (`getInventoryProducts`),
  `status ASC, isDeleted ASC, nameLower ASC` (`searchProductsByName`),
  `isDeleted ASC, status ASC, nameLower ASC` (admin search with both a
  status filter and a text search), `isDeleted ASC, categoryIds CONTAINS,
  updatedAt DESC` and `isDeleted ASC, brandId ASC, updatedAt DESC` (admin
  search filtered by category/brand).
- `products`: 8 new entries covering the storefront's `brandId`/`badge==sale`
  filters crossed with each of the 4 existing sort modes (default/newest/
  rating/price) - the realistic single-facet combinations. The `inStock`
  filter's interaction with sort was left alone: Firestore requires an
  inequality filter's field to be the first `orderBy`, and the current code
  combines `stock > 0` with sorts that orderBy a different field first -
  that's an invalid-query shape no index can fix (a pre-existing query
  construction issue, not a missing-index one, and out of scope as
  "business logic" for this pass).

Every other collection named in the task (Store/Order/Product Activity
Logs, Finance, Transactions, Analytics, Customers, Blog, Orders, Deployment,
Domains, Backup) already had a correct index declared. Notifications has no
query at all (`getNotificationsSettings()` is a single fixed-doc read) and
needs no index.

### Recovery strategy

New `src/lib/firebase/repositories/safe-query.ts` exports `safeQuery(label,
fallback, fn)` - runs `fn()`, and if it throws Firestore's
`FAILED_PRECONDITION` (missing or still-building composite index, detected
by gRPC code `9` or a `"requires an index"` message match), logs the error
and returns `fallback` instead of throwing. Any other error (permission-
denied, network, a genuinely malformed query) is rethrown untouched - only
the specific "missing index" failure mode is treated as recoverable.

Applied to every function across 22 repository files that runs a composite
query (2+ `where()` clauses, or `where()` + `orderBy()` on a different
field, or an `array-contains`/`array-contains-any` combined with anything)
- both already-indexed and previously-missing ones, since a newly deployed
index also needs real time to finish building before it's usable. Each
wrap is the same shape: the query-building logic (conditional `.where()`
branches) is untouched outside the wrapper; only the final `.get()`/
`.count().get()` + result-shaping is moved inside a `safeQuery(...)` call,
returning the function's own natural empty value (`[]`, `{items: [], total:
0, totalPages: 1}`, `null`, etc.). Simple single-field queries and plain
`.doc(id).get()` reads (the majority of every repository) are untouched -
Firestore auto-indexes those, so they can't throw this error.

### Error boundaries (resolved by construction)

Since a missing index can no longer throw past the repository layer, it
never reaches any page-level `error.tsx` (added in an earlier hardening
pass for `(admin)/(protected)` and `(superadmin)/(protected)`) in the first
place - the calling Server Component just receives an empty result and
renders its existing empty-state JSX (e.g. "No activity yet"). No page,
action, or component file needed to change for this requirement - it falls
out directly from the recovery strategy above.

### Affected files

New: `src/lib/firebase/repositories/safe-query.ts`. Modified (additive
`safeQuery` wrapping only, no logic changes): `store-activity-logs.ts`,
`order-activity-logs.ts`, `product-activity-logs.ts`,
`customer-activity-logs.ts`, `transactions.ts`, `payouts.ts`,
`order-documents.ts`, `gdpr-requests.ts`, `analytics.ts`, `blog-posts.ts`,
`homepage-sections.ts`, `banners.ts`, `testimonials.ts`, `faqs.ts`,
`page-sections.ts`, `orders.ts`, `products.ts`, `customers.ts`,
`reviews.ts`, `categories.ts`, `brands.ts`, `suppliers.ts`,
`collections.ts` (all under `src/lib/firebase/repositories/`), plus
`firestore.indexes.json`. No page, Server Action, or component file changed.

### Deployment instructions

Index declarations only take effect once deployed and built:

```bash
firebase deploy --only firestore:indexes
```

Newly created indexes take real time to finish building (visible as
"Building" in the Firebase console) before Firestore will actually serve
queries through them - until then, `safeQuery` is what keeps the affected
pages rendering with an empty state instead of erroring. Re-run the same
deploy command any time a new composite query is added elsewhere in the
app, and add the matching wrapped-query pattern from this pass for it.

## Platform UI & Architecture Polish

Production-quality pass over the Platform marketing website (`/` and its
public sub-pages, served on the root domain) plus a small set of
architecture-hardening fixes to the storefront-chrome suppression pattern.
No tenant resolution, authentication, Firestore hierarchy, Store Admin,
Super Admin, Products, Orders, Finance, CMS, Themes, or Deployment business
logic was touched.

### Architecture cleanup

- **`TopBar` suppression gap closed.** Every other chrome component
  (`AnnouncementBar`, `WhatsAppButton`, `SiteHeader`, `Footer`) already
  self-suppressed via a `usePathname()`/`useTenantId()` guard; `TopBar` was
  the one exception, suppressing only via its own `topBar?.enabled` data
  flag. That happened to be `false` in `DEFAULT_THEME` (so it was already
  inert on the platform domain), but gave no protection on a real tenant's
  `/superadmin` view. `TopBar` now also checks the same guard, restricted
  to `/superadmin` only (no new `/admin` behavior introduced, matching the
  precedent already set by `SiteHeader`/`Footer`).
- **De-duplicated the repeated guard condition.** `AnnouncementBar`,
  `WhatsAppButton`, `SiteHeader`, `Footer`, and now `TopBar` each rebuilt a
  near-identical `pathname?.startsWith(...) || !tenantId` expression. A new
  shared hook, `src/lib/tenant/useChromeSuppressed.ts`, centralizes this
  logic (`includeAdmin` opt-in per component, preserving each component's
  own pre-existing `/admin` behavior exactly).
- **`ClientProviders.tsx`'s render tree shape was deliberately left
  unchanged.** `src/app/layout.tsx` documents that conditionally omitting
  the Redux `Provider`/theme injection based on runtime state previously
  caused a real React/RSC reconciliation crash under a Server Action. The
  Platform site's own Book Demo form uses a Server Action, so this class of
  bug is directly reachable there too - `ClientProviders` renders the
  identical component tree for every request, tenant or not, and chrome
  suppression stays purely leaf-level (each component returning `null`),
  exactly as before.
- Verified no cross-layout rendering exists: the platform's own
  `(marketing)/platform/layout.tsx` only ever renders `MarketingHeader`/
  `MarketingFooter`; no platform page imports any storefront/admin
  component; `/admin` and `/superadmin` are unaffected by any change here.

### Marketing site redesign

The Platform home page (`src/app/(marketing)/platform/page.tsx`) is now a
composition of focused, reusable section components under
`src/components/marketing/`: `HeroSection`, `FeatureGrid`, `StatsBand`,
`DashboardPreview`, `ThemesTeaser`, `VideoPlaceholder`,
`TestimonialsSection`, `FaqTeaser`, `PricingTeaser`, `CallSchedulingSection`.
Notable content decisions, made to avoid fabricating data that doesn't
exist yet:

- **Statistics** are capability facts ("Multi-tenant", theme count pulled
  live from `THEME_PRESETS`, "2 dedicated admin panels", "Commission-based")
  rather than invented customer-count/SLA numbers.
- **The dashboard preview** is an abstract, `aria-hidden` CSS/div mockup
  (browser-chrome bar, sidebar skeleton, stat tiles, chart placeholder) -
  never a fabricated screenshot of the real product.
- **The video section** is an explicit, always-visible "coming soon"
  placeholder that links through to Book a Demo, not a dead end.
- **Testimonials** are explicitly labeled "Illustrative examples of what
  stores can expect on the platform," attributed to a role/persona icon
  rather than a fabricated named customer.
- `themes/page.tsx` now surfaces previously-unused `ThemePreset` fields
  (typography label row, ordered `homepageSections` chip list, one seed
  testimonial/FAQ per preset) instead of just color swatches.
- `pricing/page.tsx` restructured into a proper card layout with a
  highlighted "Commission-based" callout (still no invented number) and a
  no-fee checklist.
- `faq/page.tsx` (and a new homepage FAQ teaser) now use the existing,
  reusable `src/components/AccordionInfo.tsx` instead of an always-expanded
  static list; the shared question/answer data now lives in
  `src/lib/marketing/faq-data.ts` so the full page and the teaser can't
  drift apart.

### UX / SEO

- `src/app/(marketing)/platform/error.tsx` - platform-scoped error boundary
  (renders inside the platform layout, so header/footer stay visible).
- Every platform page's `metadata` export now includes `openGraph`,
  `twitter`, and `alternates.canonical`; `/privacy` and `/terms` are also
  marked `robots: { index: false }`.
- `src/app/layout.tsx` now sets `metadataBase` (scoped to the `!tenantId`
  branch only, via `src/lib/marketing/site-url.ts`) so relative canonical/
  OG URLs resolve correctly - no change to tenant-store metadata.
- `src/app/(marketing)/platform/opengraph-image.tsx` - one dynamic
  `ImageResponse`-based OG image shared across all platform pages.
- `src/app/sitemap.ts` / `src/app/robots.ts` (new, app-root Next.js
  conventions) - scoped strictly to the platform's own canonical URLs;
  tenant storefronts are a separate, unrelated SEO surface and are not
  enumerated here.
- JSON-LD: `Organization` schema in the platform layout (site-wide),
  `FAQPage` schema on `faq/page.tsx`.
- No `loading.tsx` was added: confirmed no platform page performs async
  data fetching that would benefit from one (documented as a
  considered-but-unnecessary item rather than added as dead code).

### Performance

- New marketing components that take array/list props (`FeatureGrid`,
  `ThemesTeaser`, `TestimonialsSection`) are wrapped in `React.memo`.
- `framer-motion` (already a project dependency, previously only used for
  the product-image lightbox) is reused for scroll-reveal/stagger
  animations - no new bundle weight added.
- No large images were introduced - the dashboard preview and video
  placeholder are pure CSS/`div` constructions; the one real image
  surface (`opengraph-image.tsx`) is server-rendered via `next/og`, never
  shipped to the client bundle.
- `ClientProviders`' tree shape is unchanged (see Architecture cleanup) -
  the one bundle-size lever this pass deliberately does not pull, for the
  documented RSC-reconciliation-safety reason.

### Firestore composite-index re-audit

This pass adds zero new Firestore reads (confirmed via `grep` across every
new/modified file) - the marketing site's only Firestore write,
`submitBookDemoRequest`, is untouched. The exhaustive composite-index audit
from the immediately preceding task already covers every repository query;
no new `firestore.indexes.json` entry was needed here.

### Verification steps

1. `npx tsc --noEmit` - clean.
2. `npm run build` - clean (109 routes generated, including new
   `/sitemap.xml`, `/robots.txt`, and `/platform/opengraph-image`).
3. Confirmed via `grep` that no leftover `pathname`/`tenantId` references
   remain in the components refactored to use `useChromeSuppressed`.
4. Confirmed via `git status` that this pass touched zero
   `src/lib/firebase/repositories/*` files.

### Remaining future enhancements

- Replace the illustrative testimonials and abstract dashboard mockup with
  real customer quotes and product screenshots once available.
- Replace the video placeholder with a real recorded walkthrough.
- Consider per-page dynamic OG images (currently one shared image across
  all platform pages) if per-page social preview differentiation becomes
  a priority.

## Store Launch Experience (First-Time Onboarding)

A first-run onboarding wizard for new Store Admins, built entirely as a new,
additive layer - no existing settings data model, business logic, or
admin/tenant architecture was changed. A Store Admin previously landed on
`/admin` right after login with no guidance; there is now a dedicated setup
wizard plus a dashboard prompt pointing to it until the store is launched.

### What it does

- **Welcome screen** → **Business Setup Wizard** (Brand Information, Logo/
  Favicon, Store Contact Information, Currency & Timezone, Shipping
  Configuration, Payment Configuration, Social Links, SEO Basics) →
  **Launch Checklist** with a computed **Store Health Status** panel and a
  **Launch Store** action. A **Dashboard Welcome Card** links into the
  wizard until launched, then disappears.
- Every step **reuses an existing repository/action - none of the settings
  logic is duplicated**: Brand/Contact/Currency/Social/SEO all call the
  existing `updateGeneralSettings` (`(admin)/settings/actions.ts`); Shipping
  calls the existing `updateShippingSettings`; Payment calls the existing
  `updatePaymentSettings`; Logo/Favicon calls the existing `updateTheme`
  (`(admin)/theme/actions.ts`) and reuses the existing `ImageUploader`
  component + Cloudinary upload pipeline unchanged.
- **Progress persistence & resume later**: a new tenant-scoped subcollection,
  `stores/{id}/onboarding/state` (one doc), mirrors the exact access pattern
  already used by `siteSettings` (`tenantCollection()` + `docData()` +
  `stripUndefined()` + a `DEFAULT_*` fallback constant). It records
  `completedSteps` and `currentStep`; reopening `/admin/onboarding` resumes
  exactly where the admin left off, and any completed step can be revisited
  from the step list.
- **Launch Store** sets `onboarding.launchedAt` only - it does not touch
  `Store.status` (already `"active"` from creation) or any tenant/business
  state, since there is no "unlaunched" state to transition out of.
- Steps are not sequentially gated - any completed step can be revisited,
  and "Launch Store" is always clickable regardless of checklist
  completion, matching common real-world SaaS onboarding UX.

### Files changed

New: `src/types/onboarding.ts`,
`src/lib/firebase/repositories/onboarding.ts`,
`src/app/(admin)/admin/(protected)/onboarding/page.tsx`,
`.../onboarding/OnboardingWizard.tsx`, `.../onboarding/actions.ts`
(`saveOnboardingStep`, `launchStore` - the only two new mutating
functions), `.../onboarding/health.ts` (`computeStoreHealth`, a pure,
storage-free completeness check), `.../onboarding/steps/*.tsx` (10 step
components + a shared `WizardStepShell`), `src/components/admin/OnboardingWelcomeCard.tsx`.

Modified (additive only): `src/app/(admin)/admin/(protected)/page.tsx` -
one new fetch (`getOnboardingProgress()`) added to the existing
`Promise.all`, and one new conditional card rendered above the existing
stat grid. No other line in that file changed.

Not touched: `Store` type/schema, tenant resolution, authentication,
`middleware.ts`, Products/Orders/Finance/CMS business logic, the Super
Admin provisioning flow, or any existing settings/theme repository or
action (only called, never modified).

### Verification

1. `npx tsc --noEmit` - clean.
2. `npm run build` - clean; `/admin/onboarding` generated alongside every
   existing route with no new errors.
3. Confirmed via diff that `(admin)/(protected)/page.tsx`'s only changes
   are the one new fetch and one new card - the stat grid, low-stock panel,
   revenue chart, and top-sellers list are byte-identical to before.
4. Confirmed no existing settings/theme action or repository file was
   modified - only imported and called from the new wizard steps.

## Enterprise Deployment & Domain Management Module

Rounds out the Super Admin's domain/deployment surface. Everything here
was previously "architecture only" per the codebase's own comments
(`Store.domains`/`domainSettings`, the single-snapshot `DeploymentMetadata`
doc, `setPrimaryDomain`) - this adds the missing capabilities without
touching tenant resolution, authentication, provisioning, URL generation,
or any Store Admin/Products/Orders/Finance/CMS/Themes business logic.

### Deployment Architecture

`src/lib/deployment/` mirrors the existing payments provider-registry
pattern (`src/lib/payments/provider.ts`/`provider-registry.ts`/
`stub-provider.ts`): a `DeploymentProvider` interface
(`verifyDomain(hostname)`, `triggerDeployment(storeId)`), a shared
`createStubDeploymentProvider(id, displayName)` factory, one-line concrete
stubs (`providers/vercel.ts`, `providers/cloudflare.ts`), a `DEPLOYMENT_PROVIDERS`
registry map, and `getActiveDeploymentProvider()` - a single swap point
(mirroring `getWelcomeEmailService()`) currently returning the Vercel stub.
Unlike the payments registry (zero consumers), this one is genuinely
exercised: the new `reverifyDomain`/`triggerDeployment` Super Admin actions
call through it and write the (clearly-labeled, not-yet-implemented) result
into Firestore - swapping in a real Vercel/Cloudflare integration later is
a change to `provider-registry.ts` alone, no caller changes.

Deployment logs are a new, minimal-read architecture:
`src/types/deployment-log.ts` + `src/lib/firebase/repositories/
deployment-logs.ts` (`logDeploymentEvent`/`getDeploymentLogs`), a
`stores/{id}/deploymentLogs` subcollection mirroring `deployment-
metadata.ts`'s direct-by-id access pattern - single `orderBy("createdAt",
"desc").limit(n)` query, no composite index needed. Deployment *status
history* reuses the existing root-level `storeActivityLogs` audit trail
instead of a second collection - `StoreActivityAction` gained four
additive members (`domain_removed`, `domain_reverified`,
`primary_domain_changed`, `deployment_status_changed`).

Deployment and domain health are pure, zero-read computed functions
(`src/lib/deployment/health.ts`) derived from data already fetched for the
page - no new stored field.

### Domain Management

- **Wildcard subdomain support** - unchanged, reuses the existing
  `getPlatformBaseUrl()`/`buildTenantUrl()` platform-URL architecture as-is;
  `src/lib/deployment/dns-instructions.ts` documents the wildcard DNS
  record a platform operator needs (`getWildcardDnsInstructions`).
- **Custom domain DNS guidance** - `getCustomDomainDnsInstructions(hostname,
  platformBaseUrl)`, a pure CNAME-record suggestion, shown in a new
  expandable "DNS setup" block per domain.
- **Domain verification/SSL status, primary switching** - unchanged fields
  (`DomainSetting.dnsStatus`/`sslStatus`/`isPrimary`), still architecture-
  only for the actual check; `setPrimaryDomain` (existing, behavior
  unchanged) now also writes a `primary_domain_changed` activity entry.
- **Domain removal** (new) - `removeDomain(storeId, hostname)` reuses
  `syncDomainSettings` (already drops entries for hostnames no longer
  present) rather than duplicating that reconciliation, and auto-promotes
  the first remaining domain to primary if the removed one was primary.
- **Domain re-verification** (new) - `reverifyDomain(storeId, hostname)`
  calls the active deployment provider's `verifyDomain()` and persists the
  result.
- **Domain health** (new) - `computeDomainHealth()` badge
  (healthy/degraded/unhealthy/unknown) per domain.

### Files Changed

New: `src/lib/deployment/provider.ts`, `stub-provider.ts`,
`provider-registry.ts`, `providers/vercel.ts`, `providers/cloudflare.ts`,
`dns-instructions.ts`, `health.ts`; `src/types/deployment-log.ts`;
`src/lib/firebase/repositories/deployment-logs.ts`;
`src/lib/superadmin/activity-labels.ts`; `(superadmin)/(protected)/
DomainManagementPanel.tsx`, `DeploymentPanel.tsx`.

Modified (additive only): `src/types/store-activity-log.ts` (4 new union
members), `(superadmin)/(protected)/actions.ts` (3 new exports -
`removeDomain`, `reverifyDomain`, `triggerDeployment` - plus one added line
in the existing `setPrimaryDomain`), `StoreDetailsTabs.tsx` (inline
Domains/Deployment tab JSX replaced with the two new panel components,
`ACTIVITY_LABELS` moved to the new shared file to avoid a circular import),
`[id]/edit/page.tsx` (one new `getDeploymentLogs` fetch, `getRecentActivity`
limit bumped from 10 to 20).

Not touched: `middleware.ts`, tenant resolution, authentication,
`deployment-provisioner.ts` (initial-snapshot provisioning, unrelated to
ongoing management), `base-url.ts`/`tenant-url.ts` (consumed, not
modified), Store Admin, onboarding, Products/Orders/Finance/CMS/Themes,
Firestore rules/hierarchy.

### Verification

1. `npx tsc --noEmit` - clean.
2. `npm run build` - clean; `/superadmin/[id]/edit` builds with the two new
   panels, no new composite index required (confirmed the `deploymentLogs`
   query is a single-field `orderBy`, same shape as already-indexed
   patterns).
3. Confirmed `DEPLOYMENT_PROVIDERS`/`getActiveDeploymentProvider()` are
   actually called (by `reverifyDomain`/`triggerDeployment`), unlike the
   payments registry's zero consumers.
4. Confirmed `removeDomain`/`reverifyDomain`/`triggerDeployment`/
   `setPrimaryDomain` all start with `requireSuperAdmin()` and call
   `revalidateStoreList()`, matching every existing action in the file.

### Future Integration Points

- Swap `getActiveDeploymentProvider()` to a real Vercel or Cloudflare
  implementation (`src/lib/deployment/providers/*.ts`) - no caller changes
  needed anywhere else.
- Wire a real DNS/SSL check into `DeploymentProvider.verifyDomain()` and a
  real deploy trigger into `triggerDeployment()` - both already flow their
  results into `domainSettings`/`deploymentLogs`/`storeActivityLogs`.
- A future webhook from a real provider can call `logDeploymentEvent()`
  directly to stream real build/deploy log lines into the same
  architecture already rendered by `DeploymentPanel.tsx`.