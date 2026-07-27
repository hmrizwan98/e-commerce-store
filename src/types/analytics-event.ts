export type AnalyticsEventType =
  | "page_view"
  | "product_view"
  | "product_click"
  | "category_view"
  | "brand_view"
  | "search"
  | "wishlist_add"
  | "wishlist_remove"
  | "compare_add"
  | "compare_remove"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout_start"
  | "payment_success"
  | "order_success"
  | "newsletter_signup"
  | "not_found";

export type DeviceType = "desktop" | "mobile" | "tablet";

export interface AnalyticsEventDevice {
  type: DeviceType;
  browser: string;
  os: string;
  screenWidth?: number;
  screenHeight?: number;
}

export interface AnalyticsEventGeo {
  // Country/city/region require an IP-geolocation provider, which this
  // project doesn't have configured - they resolve to "Unknown" until one is
  // wired into src/lib/analytics/geo.ts. Language/timezone are real (captured
  // client-side via navigator.language / Intl).
  country: string;
  city: string;
  region: string;
  language?: string;
  timezone?: string;
}

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  sessionId: string;
  visitorId: string;
  path: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  productId?: string;
  categoryId?: string;
  brandId?: string;
  searchQuery?: string;
  value?: number;
  device: AnalyticsEventDevice;
  geo: AnalyticsEventGeo;
  createdAt?: number;
}

export interface ActiveSession {
  sessionId: string;
  visitorId: string;
  path: string;
  device: AnalyticsEventDevice;
  geo: AnalyticsEventGeo;
  referrer?: string;
  lastSeenAt: number;
}

export interface Visitor {
  visitorId: string;
  firstSeenAt: number;
  lastSeenAt: number;
}
