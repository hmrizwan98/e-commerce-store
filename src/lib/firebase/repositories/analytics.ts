import "server-only";
import { adminDb } from "../admin";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import { getProductsByIds } from "./products";
import { getCategories } from "./categories";
import { getBrands } from "./brands";
import { getCurrentTenant, requireCurrentTenant } from "@/lib/tenant/current";
import { requestMemo } from "@/lib/request-cache";
import type {
  AnalyticsEvent,
  AnalyticsEventType,
  AnalyticsEventDevice,
  AnalyticsEventGeo,
  Visitor,
} from "@/types/analytics-event";
import type { Order } from "@/types/order";

const EVENTS = "analyticsEvents";
const ACTIVE_SESSIONS = "activeSessions";
const VISITORS = "visitors";
const ORDERS = "orders";
const PRODUCTS = "products";

export interface DateRange {
  start: number;
  end: number;
}

// --- Raw fetch ---

/** EVENTS/ACTIVE_SESSIONS/VISITORS are root-level collections (not tenant-scoped by
 * path) - storeId is the tenant-isolation boundary, filtered here since this is the
 * sole choke point every exported analytics function in this file goes through. */
async function fetchEvents(range: DateRange): Promise<AnalyticsEvent[]> {
  const tenant = await getCurrentTenant();
  if (!tenant) return [];
  return requestMemo(`fetchEvents:${tenant.id}:${range.start}:${range.end}`, () =>
    safeQuery("fetchEvents", [], async () => {
      const snap = await adminDb()
        .collection(EVENTS)
        .where("storeId", "==", tenant.id)
        .where("createdAt", ">=", range.start)
        .where("createdAt", "<=", range.end)
        .get();
      return snap.docs.map((d) => docData<AnalyticsEvent>(d)).filter((e): e is AnalyticsEvent => e !== null);
    })
  );
}

/**
 * All-time (no date filter) - used for catalog-health checks ("never viewed",
 * "never purchased") which are about the product's whole lifetime, not a
 * selected period. Same full-collection-scan trade-off already used by
 * getOrderStats/getTopSellingProducts elsewhere in this codebase.
 */
async function fetchAllEventsOfType(type: AnalyticsEventType): Promise<AnalyticsEvent[]> {
  const tenant = await getCurrentTenant();
  if (!tenant) return [];
  return safeQuery("fetchAllEventsOfType", [], async () => {
    const snap = await adminDb()
      .collection(EVENTS)
      .where("storeId", "==", tenant.id)
      .where("type", "==", type)
      .select("productId")
      .get();
    return snap.docs.map((d) => docData<AnalyticsEvent>(d)).filter((e): e is AnalyticsEvent => e !== null);
  });
}

/** Orders live at stores/{storeId}/orders (see orders.ts) - not a root-level
 * collection, so this must go through tenantCollection() like every other
 * order read, rather than adminDb().collection(ORDERS) which points at an
 * always-empty root collection no order is ever written to. */
async function fetchOrders(range: DateRange): Promise<Order[]> {
  const tenant = await requireCurrentTenant();
  return requestMemo(`fetchOrders:${tenant.id}:${range.start}:${range.end}`, () =>
    safeQuery("fetchOrders", [], async () => {
      const col = await tenantCollection(ORDERS);
      const snap = await col
        .where("createdAt", ">=", range.start)
        .where("createdAt", "<=", range.end)
        .get();
      return snap.docs.map((d) => docData<Order>(d)).filter((o): o is Order => o !== null);
    })
  );
}

async function fetchAllOrders(): Promise<Order[]> {
  return safeQuery("fetchAllOrders", [], async () => {
    const col = await tenantCollection(ORDERS);
    const snap = await col
      .select("guestEmail", "userId", "total", "createdAt", "guestName", "items")
      .get();
    return snap.docs.map((d) => docData<Order>(d)).filter((o): o is Order => o !== null);
  });
}

// --- Shared helpers ---

function groupBySession(events: AnalyticsEvent[]): Map<string, AnalyticsEvent[]> {
  const map = new Map<string, AnalyticsEvent[]>();
  for (const e of events) {
    const arr = map.get(e.sessionId);
    if (arr) arr.push(e);
    else map.set(e.sessionId, [e]);
  }
  return map;
}

function round(n: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

export interface BreakdownItem {
  label: string;
  count: number;
  percent: number;
}

function breakdown(items: string[]): BreakdownItem[] {
  const counts = new Map<string, number>();
  items.forEach((label) => counts.set(label, (counts.get(label) ?? 0) + 1));
  const total = items.length || 1;
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count, percent: round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

// --- Visitors / sessions ---

export interface VisitorOverview {
  totalVisitors: number;
  uniqueVisitors: number;
  returningVisitors: number;
  newVisitors: number;
  pageViews: number;
  sessions: number;
  avgSessionDurationSeconds: number;
  bounceRate: number;
}

export async function getVisitorOverview(range: DateRange): Promise<VisitorOverview> {
  const events = await fetchEvents(range);
  const pageViews = events.filter((e) => e.type === "page_view");
  const bySession = groupBySession(pageViews);
  const sessions = bySession.size;

  let totalDuration = 0;
  let sessionsWithDuration = 0;
  let bounced = 0;
  bySession.forEach((evs) => {
    const sorted = [...evs].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
    if (sorted.length === 1) bounced += 1;
    else {
      totalDuration += (sorted[sorted.length - 1].createdAt ?? 0) - (sorted[0].createdAt ?? 0);
      sessionsWithDuration += 1;
    }
  });

  const visitorIds = Array.from(new Set(pageViews.map((e) => e.visitorId)));
  const visitorRefs = visitorIds.map((id) => adminDb().collection(VISITORS).doc(id));
  const visitorDocs = visitorRefs.length ? await adminDb().getAll(...visitorRefs) : [];
  let returningVisitors = 0;
  visitorDocs.forEach((doc) => {
    const v = docData<Visitor>(doc);
    if (v && v.firstSeenAt < range.start) returningVisitors += 1;
  });

  return {
    totalVisitors: sessions,
    uniqueVisitors: visitorIds.length,
    returningVisitors,
    newVisitors: visitorIds.length - returningVisitors,
    pageViews: pageViews.length,
    sessions,
    avgSessionDurationSeconds: sessionsWithDuration ? Math.round(totalDuration / sessionsWithDuration / 1000) : 0,
    bounceRate: sessions ? round((bounced / sessions) * 100) : 0,
  };
}

// --- Funnel / conversion ---

export interface FunnelOverview {
  productViews: number;
  productClicks: number;
  addToCart: number;
  checkoutStarted: number;
  orders: number;
  revenue: number;
  conversionRate: number;
  wishlistAdds: number;
  compareAdds: number;
  searchCount: number;
  newsletterSignups: number;
}

export async function getFunnelOverview(range: DateRange): Promise<FunnelOverview> {
  const [events, orders] = await Promise.all([fetchEvents(range), fetchOrders(range)]);
  const count = (type: AnalyticsEventType) => events.filter((e) => e.type === type).length;
  const sessions = new Set(events.filter((e) => e.type === "page_view").map((e) => e.sessionId)).size;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);

  return {
    productViews: count("product_view"),
    productClicks: count("product_click"),
    addToCart: count("add_to_cart"),
    checkoutStarted: count("checkout_start"),
    orders: orders.length,
    revenue,
    conversionRate: sessions ? round((orders.length / sessions) * 100) : 0,
    wishlistAdds: count("wishlist_add"),
    compareAdds: count("compare_add"),
    searchCount: count("search"),
    newsletterSignups: count("newsletter_signup"),
  };
}

// --- Trend (daily buckets - the Daily/Weekly/Monthly/Yearly/Custom filters all just pick the range;
// the UI rolls these daily points up into weeks/months for longer ranges) ---

export interface TrendPoint {
  date: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  productViews: number;
  orders: number;
  revenue: number;
}

export async function getTrend(range: DateRange): Promise<TrendPoint[]> {
  const [events, orders] = await Promise.all([fetchEvents(range), fetchOrders(range)]);
  const dayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);

  const days = new Map<string, TrendPoint>();
  for (let t = range.start; t <= range.end; t += 24 * 60 * 60 * 1000) {
    const key = dayKey(t);
    days.set(key, { date: key, visitors: 0, sessions: 0, pageViews: 0, productViews: 0, orders: 0, revenue: 0 });
  }

  const sessionsPerDay = new Map<string, Set<string>>();
  const visitorsPerDay = new Map<string, Set<string>>();

  events.forEach((e) => {
    if (!e.createdAt) return;
    const key = dayKey(e.createdAt);
    const point = days.get(key);
    if (!point) return;
    if (e.type === "page_view") {
      point.pageViews += 1;
      if (!sessionsPerDay.has(key)) sessionsPerDay.set(key, new Set());
      if (!visitorsPerDay.has(key)) visitorsPerDay.set(key, new Set());
      sessionsPerDay.get(key)!.add(e.sessionId);
      visitorsPerDay.get(key)!.add(e.visitorId);
    }
    if (e.type === "product_view") point.productViews += 1;
  });

  sessionsPerDay.forEach((set, key) => {
    const p = days.get(key);
    if (p) p.sessions = set.size;
  });
  visitorsPerDay.forEach((set, key) => {
    const p = days.get(key);
    if (p) p.visitors = set.size;
  });

  orders.forEach((o) => {
    if (!o.createdAt) return;
    const point = days.get(dayKey(o.createdAt));
    if (!point) return;
    point.orders += 1;
    point.revenue += o.total;
  });

  return Array.from(days.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// --- Devices ---

export interface DeviceBreakdown {
  devices: BreakdownItem[];
  browsers: BreakdownItem[];
  operatingSystems: BreakdownItem[];
  screenSizes: BreakdownItem[];
}

function bucketScreenWidth(width?: number): string {
  if (!width) return "Unknown";
  if (width < 480) return "< 480px";
  if (width < 768) return "480–767px";
  if (width < 1024) return "768–1023px";
  if (width < 1440) return "1024–1439px";
  return "1440px+";
}

export async function getDeviceBreakdown(range: DateRange): Promise<DeviceBreakdown> {
  const events = (await fetchEvents(range)).filter((e) => e.type === "page_view");
  return {
    devices: breakdown(events.map((e) => e.device.type)),
    browsers: breakdown(events.map((e) => e.device.browser)),
    operatingSystems: breakdown(events.map((e) => e.device.os)),
    screenSizes: breakdown(events.map((e) => bucketScreenWidth(e.device.screenWidth))),
  };
}

// --- Locations ---

export interface LocationBreakdown {
  countries: BreakdownItem[];
  cities: BreakdownItem[];
  regions: BreakdownItem[];
  languages: BreakdownItem[];
  timezones: BreakdownItem[];
}

export async function getLocationBreakdown(range: DateRange): Promise<LocationBreakdown> {
  const events = (await fetchEvents(range)).filter((e) => e.type === "page_view");
  return {
    countries: breakdown(events.map((e) => e.geo.country)),
    cities: breakdown(events.map((e) => e.geo.city)),
    regions: breakdown(events.map((e) => e.geo.region)),
    languages: breakdown(events.map((e) => e.geo.language ?? "Unknown")),
    timezones: breakdown(events.map((e) => e.geo.timezone ?? "Unknown")),
  };
}

// --- Traffic sources ---

const SOURCE_HOST_MAP: Record<string, string> = {
  "facebook.com": "Facebook",
  "m.facebook.com": "Facebook",
  "l.facebook.com": "Facebook",
  "instagram.com": "Instagram",
  "tiktok.com": "TikTok",
  "linkedin.com": "LinkedIn",
  "twitter.com": "Twitter/X",
  "x.com": "Twitter/X",
  "t.co": "Twitter/X",
  "pinterest.com": "Pinterest",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "google.com": "Organic Search",
  "bing.com": "Organic Search",
  "yahoo.com": "Organic Search",
  "duckduckgo.com": "Organic Search",
};

function classifySource(event: Pick<AnalyticsEvent, "referrer" | "utmSource" | "utmMedium">): string {
  const medium = event.utmMedium?.toLowerCase();
  if (medium === "email") return "Email";
  if (medium && ["cpc", "ppc", "paid", "ads", "paid-social"].includes(medium)) return "Paid Ads";
  if (event.utmSource) {
    const source = event.utmSource.toLowerCase();
    const known = Object.entries(SOURCE_HOST_MAP).find(([host]) => source.includes(host.split(".")[0]));
    if (known) return known[1];
    return event.utmSource.charAt(0).toUpperCase() + event.utmSource.slice(1);
  }
  if (!event.referrer) return "Direct";
  try {
    const host = new URL(event.referrer).hostname.replace(/^www\./, "");
    return SOURCE_HOST_MAP[host] ?? "Referral";
  } catch {
    return "Referral";
  }
}

export async function getTrafficSources(range: DateRange): Promise<BreakdownItem[]> {
  const events = (await fetchEvents(range)).filter((e) => e.type === "page_view");
  const bySession = groupBySession(events);
  const sourcePerSession: string[] = [];
  bySession.forEach((evs) => {
    const first = [...evs].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0))[0];
    sourcePerSession.push(classifySource(first));
  });
  return breakdown(sourcePerSession);
}

// --- Products ---

export interface ProductStat {
  productId: string;
  name: string;
  count: number;
  revenue?: number;
}

async function topProductsByEventType(type: AnalyticsEventType, range: DateRange, limit = 10): Promise<ProductStat[]> {
  const events = (await fetchEvents(range)).filter((e) => e.type === type && e.productId);
  const counts = new Map<string, number>();
  events.forEach((e) => counts.set(e.productId!, (counts.get(e.productId!) ?? 0) + 1));
  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  const products = await getProductsByIds(top.map(([id]) => id), top.length);
  const nameById = new Map(products.map((p) => [p.id, p.name]));
  return top.map(([productId, count]) => ({
    productId,
    name: nameById.get(productId) ?? "(deleted product)",
    count,
  }));
}

export async function getMostViewedProducts(range: DateRange, limit = 10) {
  return topProductsByEventType("product_view", range, limit);
}

export async function getMostAddedToCartProducts(range: DateRange, limit = 10) {
  return topProductsByEventType("add_to_cart", range, limit);
}

export async function getMostWishlistedProducts(range: DateRange, limit = 10) {
  return topProductsByEventType("wishlist_add", range, limit);
}

export async function getMostComparedProducts(range: DateRange, limit = 10) {
  return topProductsByEventType("compare_add", range, limit);
}

/** Shared by getMostPurchasedProducts/getHighestRevenueProducts - returns every
 * product sold in range, unranked and unsliced, so each caller can sort by its
 * own metric (quantity vs revenue) without one caller's ranking truncating the
 * set before the other ever sees it. */
async function aggregateProductStats(range: DateRange): Promise<ProductStat[]> {
  const orders = await fetchOrders(range);
  const counts = new Map<string, { count: number; revenue: number; name: string }>();
  orders.forEach((o) =>
    o.items.forEach((item) => {
      const existing = counts.get(item.productId);
      if (existing) {
        existing.count += item.quantity;
        existing.revenue += item.lineTotal;
      } else {
        counts.set(item.productId, { count: item.quantity, revenue: item.lineTotal, name: item.name });
      }
    })
  );
  return Array.from(counts.entries()).map(([productId, v]) => ({
    productId,
    name: v.name,
    count: v.count,
    revenue: v.revenue,
  }));
}

export async function getMostPurchasedProducts(range: DateRange, limit = 10): Promise<ProductStat[]> {
  const stats = await aggregateProductStats(range);
  return stats.sort((a, b) => b.count - a.count).slice(0, limit);
}

export async function getHighestRevenueProducts(range: DateRange, limit = 10): Promise<ProductStat[]> {
  const stats = await aggregateProductStats(range);
  return stats.sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0)).slice(0, limit);
}

export interface CatalogHealth {
  neverViewedCount: number;
  neverViewedProducts: { productId: string; name: string }[];
  neverPurchasedCount: number;
  neverPurchasedProducts: { productId: string; name: string }[];
}

/** All-time catalog health check, capped to a sample of 25 for display - counts are exact, the lists are a preview. */
export async function getCatalogHealth(): Promise<CatalogHealth> {
  const [viewEvents, allOrders, allProducts] = await Promise.all([
    fetchAllEventsOfType("product_view"),
    fetchAllOrders(),
    safeQuery("getCatalogHealth:products", [] as { productId: string; name: string }[], async () => {
      const col = await tenantCollection(PRODUCTS);
      const snap = await col
        .where("isDeleted", "==", false)
        .where("status", "==", "active")
        .select("name")
        .get();
      return snap.docs.map((d) => ({ productId: d.id, name: (d.data().name as string) ?? "(unnamed)" }));
    }),
  ]);

  const viewedIds = new Set(viewEvents.map((e) => e.productId).filter(Boolean));
  const purchasedIds = new Set(allOrders.flatMap((o) => o.items.map((i) => i.productId)));

  const neverViewed = allProducts.filter((p) => !viewedIds.has(p.productId));
  const neverPurchased = allProducts.filter((p) => !purchasedIds.has(p.productId));

  return {
    neverViewedCount: neverViewed.length,
    neverViewedProducts: neverViewed.slice(0, 25),
    neverPurchasedCount: neverPurchased.length,
    neverPurchasedProducts: neverPurchased.slice(0, 25),
  };
}

export async function getTopCategories(range: DateRange, limit = 10): Promise<BreakdownItem[]> {
  const events = (await fetchEvents(range)).filter((e) => e.type === "category_view" && e.categoryId);
  const categories = await getCategories();
  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  return breakdown(events.map((e) => nameById.get(e.categoryId!) ?? "(deleted category)")).slice(0, limit);
}

export async function getTopBrands(range: DateRange, limit = 10): Promise<BreakdownItem[]> {
  const events = (await fetchEvents(range)).filter((e) => e.type === "brand_view" && e.brandId);
  const brands = await getBrands();
  const nameById = new Map(brands.map((b) => [b.id, b.name]));
  return breakdown(events.map((e) => nameById.get(e.brandId!) ?? "(deleted brand)")).slice(0, limit);
}

// --- Customers ---

export interface CustomerStat {
  email: string;
  name?: string;
  orderCount: number;
  totalSpent: number;
  firstOrderAt: number;
  lastOrderAt: number;
}

export interface CustomerAnalytics {
  newCustomers: number;
  returningCustomers: number;
  totalCustomers: number;
  avgOrderValue: number;
  avgCustomerLifetimeValue: number;
  repeatPurchaseRate: number;
  topSpenders: CustomerStat[];
}

export async function getCustomerAnalytics(range: DateRange): Promise<CustomerAnalytics> {
  const allOrders = await fetchAllOrders();
  const byEmail = new Map<string, CustomerStat>();

  allOrders.forEach((o) => {
    const email = o.guestEmail ?? o.userId ?? "unknown";
    const at = o.createdAt ?? 0;
    const existing = byEmail.get(email);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += o.total;
      existing.firstOrderAt = Math.min(existing.firstOrderAt, at);
      existing.lastOrderAt = Math.max(existing.lastOrderAt, at);
    } else {
      byEmail.set(email, { email, name: o.guestName, orderCount: 1, totalSpent: o.total, firstOrderAt: at, lastOrderAt: at });
    }
  });

  const ordersInRange = allOrders.filter((o) => o.createdAt && o.createdAt >= range.start && o.createdAt <= range.end);
  const emailsInRange = new Set(ordersInRange.map((o) => o.guestEmail ?? o.userId ?? "unknown"));

  let newCustomers = 0;
  let returningCustomers = 0;
  emailsInRange.forEach((email) => {
    const stat = byEmail.get(email);
    if (!stat) return;
    if (stat.firstOrderAt >= range.start) newCustomers += 1;
    else returningCustomers += 1;
  });

  const totalCustomers = byEmail.size;
  const repeatCustomers = Array.from(byEmail.values()).filter((c) => c.orderCount > 1).length;
  const avgOrderValue = ordersInRange.length
    ? round(ordersInRange.reduce((s, o) => s + o.total, 0) / ordersInRange.length, 2)
    : 0;
  const avgCustomerLifetimeValue = totalCustomers
    ? round(Array.from(byEmail.values()).reduce((s, c) => s + c.totalSpent, 0) / totalCustomers, 2)
    : 0;

  return {
    newCustomers,
    returningCustomers,
    totalCustomers,
    avgOrderValue,
    avgCustomerLifetimeValue,
    repeatPurchaseRate: totalCustomers ? round((repeatCustomers / totalCustomers) * 100) : 0,
    topSpenders: Array.from(byEmail.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10),
  };
}

// --- Sales ---

export interface SalesOverview {
  revenue: number;
  orders: number;
  tax: number;
  shipping: number;
  refunds: number;
  avgOrderValue: number;
  avgBasketSize: number;
}

export async function getSalesOverview(range: DateRange): Promise<SalesOverview> {
  const orders = await fetchOrders(range);
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const tax = orders.reduce((s, o) => s + (o.tax ?? 0), 0);
  const shipping = orders.reduce((s, o) => s + o.shippingCost, 0);
  const refunds = orders.filter((o) => o.paymentStatus === "refunded").reduce((s, o) => s + o.total, 0);
  return {
    revenue,
    orders: orders.length,
    tax,
    shipping,
    refunds,
    avgOrderValue: orders.length ? round(revenue / orders.length, 2) : 0,
    avgBasketSize: orders.length
      ? round(orders.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0) / orders.length, 1)
      : 0,
  };
}

// --- SEO ---

export interface SeoAnalytics {
  topLandingPages: BreakdownItem[];
  topExitPages: BreakdownItem[];
  topSearchQueries: BreakdownItem[];
  notFoundPages: BreakdownItem[];
}

export async function getSeoAnalytics(range: DateRange): Promise<SeoAnalytics> {
  const events = await fetchEvents(range);
  const pageViews = events.filter((e) => e.type === "page_view");
  const bySession = groupBySession(pageViews);

  const landingPaths: string[] = [];
  const exitPaths: string[] = [];
  bySession.forEach((evs) => {
    const sorted = [...evs].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
    landingPaths.push(sorted[0].path);
    exitPaths.push(sorted[sorted.length - 1].path);
  });

  const searchQueries = events.filter((e) => e.type === "search" && e.searchQuery).map((e) => e.searchQuery!);
  const notFoundPaths = events.filter((e) => e.type === "not_found").map((e) => e.path);

  return {
    topLandingPages: breakdown(landingPaths).slice(0, 15),
    topExitPages: breakdown(exitPaths).slice(0, 15),
    topSearchQueries: breakdown(searchQueries).slice(0, 15),
    notFoundPages: breakdown(notFoundPaths).slice(0, 15),
  };
}

// --- Realtime ---

export interface RealtimeSession {
  sessionId: string;
  visitorId: string;
  path: string;
  device: AnalyticsEventDevice;
  geo: AnalyticsEventGeo;
  referrer?: string;
  lastSeenAt: number;
}

const ACTIVE_WINDOW_MS = 60_000;

export async function getRealtimeActiveSessions(): Promise<RealtimeSession[]> {
  const tenant = await getCurrentTenant();
  if (!tenant) return [];
  return safeQuery("getRealtimeActiveSessions", [], async () => {
    const since = Date.now() - ACTIVE_WINDOW_MS;
    const snap = await adminDb()
      .collection(ACTIVE_SESSIONS)
      .where("storeId", "==", tenant.id)
      .where("lastSeenAt", ">=", since)
      .get();
    return snap.docs
      .map((d) => d.data() as RealtimeSession)
      .sort((a, b) => b.lastSeenAt - a.lastSeenAt);
  });
}

export async function getActiveUserCount(): Promise<number> {
  const sessions = await getRealtimeActiveSessions();
  return new Set(sessions.map((s) => s.visitorId)).size;
}

export async function getNewsletterSubscriberCount(): Promise<number> {
  const tenant = await getCurrentTenant();
  if (!tenant) return 0;
  const snap = await adminDb()
    .collection("newsletterSubscribers")
    .where("storeId", "==", tenant.id)
    .count()
    .get();
  return snap.data().count;
}
