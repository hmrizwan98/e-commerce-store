/**
 * P2 storefront content against the LOCAL Firestore emulator only (never production): the same
 * query functions the storefront uses (src/lib/firebase/repositories/storefront-queries.ts),
 * with fixtures shaped like the three real stores (Glamix, Hafiz Traderz, Zyvora Hub).
 *
 * Run (emulator must be running, e.g. `firebase emulators:start --only firestore --project demo-p0`):
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8086 npx tsx --require ./scripts/stub-server-only.cjs --test scripts/test-p2-emulator.ts
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";

const host = process.env.FIRESTORE_EMULATOR_HOST;
const project = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "demo-p0";
if (!host || !/^(127\.0\.0\.1|localhost):\d+$/.test(host) || project !== "demo-p0") {
  console.error("REFUSING TO RUN: needs FIRESTORE_EMULATOR_HOST=127.0.0.1:<port> and project demo-p0. This test writes data.");
  process.exit(1);
}

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";
import {
  queryPublicBlogPosts,
  queryPublicBlogPostBySlug,
  queryPublicTestimonials,
  queryPublishedPageBySlug,
  queryLiveBanners,
} from "../src/lib/firebase/repositories/storefront-queries";

let db: Firestore;
const run = Date.now().toString(36);
const GLAMIX = `glamix-${run}`;
const HAFIZ = `hafiz-${run}`;
const ZYVORA = `zyvora-${run}`;
const DAY = 86_400_000;
const NOW = Date.now();

before(async () => {
  if (!getApps().length) initializeApp({ projectId: "demo-p0" });
  db = getFirestore();

  const posts = db.collection("blogPosts");
  const post = (storeId: string, slug: string, extra: Record<string, unknown>) =>
    posts.add({ storeId, slug, title: `T ${slug}`, excerpt: "e", coverImage: "https://res.cloudinary.com/x/y.jpg", order: 0, ...extra });
  await post(GLAMIX, "published-old", { isActive: true, publishedAt: NOW - 3 * DAY });
  await post(GLAMIX, "published-new", { isActive: true, publishedAt: NOW - DAY });
  await post(GLAMIX, "draft", { isActive: false, publishedAt: NOW - DAY });
  await post(GLAMIX, "scheduled", { isActive: true, publishedAt: NOW + 5 * DAY });
  await post(HAFIZ, "hafiz-only", { isActive: true, publishedAt: NOW - DAY });
  await post(HAFIZ, "published-new", { isActive: true, publishedAt: NOW - DAY, title: "Hafiz post with the same slug" });

  for (const storeId of [GLAMIX, HAFIZ, ZYVORA]) {
    const t = db.collection("stores").doc(storeId).collection("testimonials");
    // The installer sample every real store has today.
    await t.add({ clientName: "Jordan Smith", content: "Great products and excellent customer service.", rating: 5, order: 0, isActive: true, createdAt: Timestamp.now() });
  }
  await db.collection("stores").doc(HAFIZ).collection("testimonials").add({ clientName: "Ayesha Khan", content: "Order arrived in two days.", rating: 4, order: 1, isActive: true });
  await db.collection("stores").doc(HAFIZ).collection("testimonials").add({ clientName: "Inactive Person", content: "Hidden", order: 2, isActive: false });

  // Real stores have faq/privacy/terms/refund pages but no "about" page.
  for (const storeId of [GLAMIX, HAFIZ, ZYVORA]) {
    const pages = db.collection("stores").doc(storeId).collection("pages");
    for (const slug of ["faq", "privacy", "terms", "refund"]) await pages.add({ slug, title: slug, content: "<p>x</p>", isActive: true, status: "published" });
  }
  await db.collection("stores").doc(ZYVORA).collection("pages").add({ slug: "about", title: "About Zyvora", content: "<p>Real</p>", isActive: true, status: "published" });
  await db.collection("stores").doc(HAFIZ).collection("pages").add({ slug: "about", title: "Draft About", content: "x", isActive: false, status: "draft" });

  const banners = (s: string) => db.collection("stores").doc(s).collection("banners");
  await banners(GLAMIX).add({ placement: "hero", title: "Sample", imageDesktop: "https://images.unsplash.com/photo-1", isActive: true, order: 0 });
  await banners(GLAMIX).add({ placement: "promo1", title: "Promo one", imageDesktop: "https://res.cloudinary.com/p1.jpg", isActive: true, order: 0 });
  await banners(GLAMIX).add({ placement: "promo2", title: "Expired", imageDesktop: "https://res.cloudinary.com/p2.jpg", isActive: true, order: 0, endDate: NOW - DAY });
  await banners(GLAMIX).add({ placement: "promo2", title: "Off", imageDesktop: "https://res.cloudinary.com/p2b.jpg", isActive: false, order: 1 });
});

test("blog: only published + date reached, newest first, one store only", async () => {
  const g = await queryPublicBlogPosts(db, GLAMIX);
  assert.deepEqual(g.map((p) => p.slug), ["published-new", "published-old"]);
  assert.deepEqual((await queryPublicBlogPosts(db, GLAMIX, 1)).map((p) => p.slug), ["published-new"]);
  assert.deepEqual((await queryPublicBlogPosts(db, HAFIZ)).map((p) => p.slug).sort(), ["hafiz-only", "published-new"]);
  assert.deepEqual(await queryPublicBlogPosts(db, ZYVORA), [], "store without posts -> empty (no demo)");
  assert.deepEqual(await queryPublicBlogPosts(db, ""), []);
});

test("blog slugs resolve per store; drafts, future posts and other stores' posts are not found", async () => {
  assert.equal((await queryPublicBlogPostBySlug(db, GLAMIX, "published-new"))?.title, "T published-new");
  assert.equal((await queryPublicBlogPostBySlug(db, HAFIZ, "published-new"))?.title, "Hafiz post with the same slug", "same slug, different store");
  assert.equal(await queryPublicBlogPostBySlug(db, GLAMIX, "draft"), null);
  assert.equal(await queryPublicBlogPostBySlug(db, GLAMIX, "scheduled"), null);
  assert.equal(await queryPublicBlogPostBySlug(db, GLAMIX, "hafiz-only"), null, "tenant isolation");
  assert.equal(await queryPublicBlogPostBySlug(db, ZYVORA, "nope"), null);
  // Once the scheduled date arrives it becomes public.
  assert.equal((await queryPublicBlogPostBySlug(db, GLAMIX, "scheduled", NOW + 6 * DAY))?.slug, "scheduled");
});

test("testimonials: unchanged installer samples hidden, real active ones shown, per store", async () => {
  assert.deepEqual(await queryPublicTestimonials(db, GLAMIX), [], "Glamix today: only the sample -> section hidden");
  assert.deepEqual(await queryPublicTestimonials(db, ZYVORA), []);
  assert.deepEqual((await queryPublicTestimonials(db, HAFIZ)).map((t) => t.clientName), ["Ayesha Khan"]);
  // Editing the sample makes it a real testimonial.
  const snap = await db.collection("stores").doc(GLAMIX).collection("testimonials").get();
  await snap.docs[0].ref.update({ content: "Lovely jewellery, quick delivery to Karachi." });
  assert.deepEqual((await queryPublicTestimonials(db, GLAMIX)).map((t) => t.clientName), ["Jordan Smith"]);
  // The record itself was only edited by the test fixture flow - never deleted.
  assert.equal((await db.collection("stores").doc(ZYVORA).collection("testimonials").get()).size, 1);
});

test("about page: published 'about' only, per store", async () => {
  assert.equal(await queryPublishedPageBySlug(db, GLAMIX, "about"), null, "no page -> 404 + link hidden");
  assert.equal(await queryPublishedPageBySlug(db, HAFIZ, "about"), null, "draft about page stays hidden");
  assert.equal((await queryPublishedPageBySlug(db, ZYVORA, "about"))?.title, "About Zyvora");
  assert.equal((await queryPublishedPageBySlug(db, GLAMIX, "privacy"))?.slug, "privacy");
});

test("banners: per placement, active + scheduled only, sample banners NOT hidden", async () => {
  assert.deepEqual((await queryLiveBanners(db, GLAMIX, "hero")).map((b) => b.title), ["Sample"], "seed/sample banners stay visible (decision)");
  assert.deepEqual((await queryLiveBanners(db, GLAMIX, "promo1")).map((b) => b.title), ["Promo one"]);
  assert.deepEqual(await queryLiveBanners(db, GLAMIX, "promo2"), [], "expired + inactive -> no promo block");
  assert.deepEqual(await queryLiveBanners(db, HAFIZ, "promo1"), [], "tenant isolation");
});
