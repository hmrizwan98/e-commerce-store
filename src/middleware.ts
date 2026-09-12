import { NextRequest, NextResponse } from "next/server";
import {
  TENANT_SLUG_HEADER,
  TENANT_CUSTOM_DOMAIN_HEADER,
  IS_ADMIN_HOST_HEADER,
  IS_SUPER_ADMIN_HOST_HEADER,
  FRONTSTORE_PREVIEW_HEADER,
  FRONTSTORE_COOKIE,
} from "@/lib/tenant/constants";
import { normalizeHostname, parseHost } from "@/lib/tenant/hostname";

/**
 * Public marketing site slugs that exist as real files under
 * src/app/(marketing)/platform/* - rewritten to their /platform/... path only
 * on the platform's own domain (webriiz.com / www.webriiz.com).
 */
const PLATFORM_ROUTE_SLUGS = new Set([
  "features",
  "pricing",
  "themes",
  "how-it-works",
  "faq",
  "about",
  "privacy",
  "terms",
  "contact",
  "book-demo",
  "login",
]);

export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);

  // Clean incoming client headers to prevent header forgery
  requestHeaders.delete(TENANT_SLUG_HEADER);
  requestHeaders.delete(TENANT_CUSTOM_DOMAIN_HEADER);
  requestHeaders.delete(IS_ADMIN_HOST_HEADER);
  requestHeaders.delete(IS_SUPER_ADMIN_HOST_HEADER);

  const pathname = req.nextUrl.pathname;

  // Path-based tenant preview: /store/{slug} or /frontstore/{slug}
  const isStorePath = pathname.startsWith("/store/") || pathname === "/store";
  const isFrontstorePath = pathname.startsWith("/frontstore/") || pathname === "/frontstore";

  if (isStorePath || isFrontstorePath) {
    const basePath = isStorePath ? "/store" : "/frontstore";
    if (pathname === basePath) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      const res = NextResponse.redirect(url);
      res.cookies.delete(FRONTSTORE_COOKIE);
      return res;
    }

    const segments = pathname.split("/").filter(Boolean); // ["store", "<slug>", ...rest]
    const previewSlug = segments[1];
    const rest = "/" + segments.slice(2).join("/");

    requestHeaders.set(TENANT_SLUG_HEADER, previewSlug);
    requestHeaders.set(FRONTSTORE_PREVIEW_HEADER, "1");

    const url = req.nextUrl.clone();
    url.pathname = rest;
    const res = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    res.cookies.set(FRONTSTORE_COOKIE, previewSlug, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 6,
      path: "/",
    });
    res.headers.set("X-Robots-Tag", "index, follow");
    return res;
  }

  // Parse hostname against platform root domain
  const rawHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const hostname = normalizeHostname(rawHost);
  const rootDomain = normalizeHostname(process.env.NEXT_PUBLIC_ROOT_DOMAIN || (process.env.NODE_ENV === "production" ? "webriiz.com" : undefined));

  let parsed = parseHost(hostname, rootDomain);

  // Development environment DEV_TENANT_SLUG override for plain localhost
  if (
    parsed.type === "marketing" &&
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_TENANT_SLUG?.trim()
  ) {
    parsed = { type: "tenant-storefront", slug: process.env.DEV_TENANT_SLUG.trim() };
  }

  // 1. Super Admin Host (superadmin.webriiz.com)
  if (parsed.type === "superadmin") {
    requestHeaders.set(IS_SUPER_ADMIN_HOST_HEADER, "1");

    // Strip duplicate /superadmin prefix from URL bar if present on superadmin subdomain
    if (pathname.startsWith("/superadmin")) {
      const cleanPath = pathname.slice(11) || "/";
      const url = req.nextUrl.clone();
      url.pathname = cleanPath;
      return NextResponse.redirect(url);
    }

    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/superadmin";
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    if (!pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
      const url = req.nextUrl.clone();
      url.pathname = `/superadmin${pathname}`;
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 2. Tenant Store Admin Host — Platform Subdomain (admin.{slug}.webriiz.com)
  if (parsed.type === "tenant-admin" && parsed.slug) {
    requestHeaders.set(TENANT_SLUG_HEADER, parsed.slug);
    requestHeaders.set(IS_ADMIN_HOST_HEADER, "1");

    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    if (!pathname.startsWith("/admin") && !pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
      const url = req.nextUrl.clone();
      url.pathname = `/admin${pathname}`;
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 3. Custom Domain Store Admin Host (admin.glamix.pk)
  if (parsed.type === "custom-admin" && parsed.customDomain) {
    requestHeaders.set(TENANT_CUSTOM_DOMAIN_HEADER, parsed.customDomain);
    requestHeaders.set(IS_ADMIN_HOST_HEADER, "1");

    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    if (!pathname.startsWith("/admin") && !pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
      const url = req.nextUrl.clone();
      url.pathname = `/admin${pathname}`;
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 4. Platform Tenant Storefront Host ({slug}.webriiz.com)
  if (parsed.type === "tenant-storefront" && parsed.slug) {
    requestHeaders.set(TENANT_SLUG_HEADER, parsed.slug);

    if (pathname.startsWith("/platform")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Direct /admin visits on storefront host -> redirect to dedicated Store Admin host if rootDomain is configured
    if ((pathname === "/admin" || pathname.startsWith("/admin/")) && rootDomain && !hostname.includes("localhost")) {
      const adminUrl = new URL(req.url);
      adminUrl.hostname = `admin.${parsed.slug}.${rootDomain}`;
      return NextResponse.redirect(adminUrl);
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 5. Custom Domain Storefront Host (glamix.pk)
  if (parsed.type === "custom-storefront" && parsed.customDomain) {
    requestHeaders.set(TENANT_CUSTOM_DOMAIN_HEADER, parsed.customDomain);

    if (pathname.startsWith("/platform")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Direct /admin visits on custom storefront host -> redirect to admin.customDomain
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const adminUrl = new URL(req.url);
      adminUrl.hostname = `admin.${parsed.customDomain}`;
      return NextResponse.redirect(adminUrl);
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 6. Platform Marketing Host (webriiz.com / www.webriiz.com / local dev without slug)
  if (pathname.startsWith("/superadmin")) {
    if (rootDomain && !hostname.includes("localhost")) {
      const cleanPath = pathname.slice(11) || "/";
      const superAdminUrl = new URL(cleanPath, `https://superadmin.${rootDomain}`);
      return NextResponse.redirect(superAdminUrl);
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const firstSegment = pathname === "/" ? "" : pathname.slice(1).split("/")[0];
  if (pathname === "/" || PLATFORM_ROUTE_SLUGS.has(firstSegment)) {
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? "/platform" : `/platform/${firstSegment}`;
    const res = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    if (pathname === "/") {
      res.cookies.delete(FRONTSTORE_COOKIE);
    }
    res.headers.set("X-Robots-Tag", "index, follow");
    return res;
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
