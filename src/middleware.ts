import { NextRequest, NextResponse } from "next/server";
import { TENANT_SLUG_HEADER, FRONTSTORE_PREVIEW_HEADER, FRONTSTORE_COOKIE } from "@/lib/tenant/constants";

/**
 * Reserved subdomains that are never a tenant - the Super Admin app lives on
 * one of these (e.g. admin.domain.com) and its own layout gates access via
 * requireSuperAdmin(), so no tenant lookup should be attempted for it.
 */
const RESERVED_SUBDOMAINS = new Set(["www", "admin", "app", "superadmin"]);

/**
 * Public marketing site slugs that exist as real files under
 * src/app/(marketing)/platform/* - rewritten to their /platform/... path only
 * on the platform's own domain (see isPlatformDomain below). Reuses those
 * files as-is; nothing here duplicates or moves a page.
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

/**
 * Pure string parsing only - no Firestore calls here (Edge runtime). The
 * actual slug -> Store lookup happens server-side in src/lib/tenant/current.ts.
 */
export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);

  // Never forward a client-supplied tenant-slug header - it must only ever be
  // set below, from server-resolved logic. Without this, a request to a
  // custom domain (or any host shape this middleware doesn't recognize as
  // one of our own {slug}.ROOT_DOMAIN subdomains) would carry the client's
  // own forged header straight through to src/lib/tenant/current.ts, which
  // checks this header before its legitimate domains[] lookup.
  requestHeaders.delete(TENANT_SLUG_HEADER);

  // The Super Admin app is reachable at /superadmin regardless of host (a
  // reserved production subdomain still serves this same route path) - never
  // attach a tenant to it, including in local dev where DEV_TENANT_SLUG would
  // otherwise apply to every path on localhost.
  if (req.nextUrl.pathname.startsWith("/superadmin")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Path-based tenant preview: /store/{slug} (or legacy /frontstore/{slug})
  // Lets a tester preview/test any tenant's storefront AND admin panel by URL path,
  // resolving tenant via TENANT_SLUG_HEADER without requiring wildcard DNS.
  const isStorePath = req.nextUrl.pathname.startsWith("/store/") || req.nextUrl.pathname === "/store";
  const isFrontstorePath = req.nextUrl.pathname.startsWith("/frontstore/") || req.nextUrl.pathname === "/frontstore";

  if (isStorePath || isFrontstorePath) {
    const basePath = isStorePath ? "/store" : "/frontstore";
    if (req.nextUrl.pathname === basePath) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      const res = NextResponse.redirect(url);
      res.cookies.delete(FRONTSTORE_COOKIE);
      return res;
    }

    const segments = req.nextUrl.pathname.split("/").filter(Boolean); // ["store", "<slug>", ...rest]
    const tenantSlug = segments[1];
    const rest = "/" + segments.slice(2).join("/");

    requestHeaders.set(TENANT_SLUG_HEADER, tenantSlug);
    requestHeaders.set(FRONTSTORE_PREVIEW_HEADER, "1");

    const url = req.nextUrl.clone();
    url.pathname = rest;
    const res = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    res.cookies.set(FRONTSTORE_COOKIE, tenantSlug, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 6,
      path: "/",
    });
    res.headers.set("X-Robots-Tag", "noindex");
    return res;
  }

  const hostHeader = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const hostname = hostHeader.split(":")[0].toLowerCase();
  const parts = hostname.split(".");

  let slug: string | null = null;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    slug = process.env.DEV_TENANT_SLUG?.trim() || null;
  } else {
    const isLocalhostSubdomain = parts.length === 2 && parts[1] === "localhost";
    if (parts.length > 2 || isLocalhostSubdomain) {
      const subdomain = parts[0];
      if (!RESERVED_SUBDOMAINS.has(subdomain)) {
        slug = subdomain;
      }
    }
  }

  // When request did NOT resolve a tenant by subdomain, and a path preview cookie is present,
  // transparently bounce plain internal relative links back under /store/{slug}/ prefix.
  if (!slug) {
    const previewSlug = req.cookies.get(FRONTSTORE_COOKIE)?.value;
    if (previewSlug) {
      requestHeaders.set(TENANT_SLUG_HEADER, previewSlug);
      if (!req.nextUrl.pathname.startsWith("/api") && !req.nextUrl.pathname.startsWith("/superadmin")) {
        const url = req.nextUrl.clone();
        url.pathname = `/store/${previewSlug}${req.nextUrl.pathname}`;
        return NextResponse.redirect(url);
      }
    }
  }

  if (slug) {
    // Tenant domain - existing resolution, unchanged. Extra safety: a tenant
    // domain must never render the marketing site, even via a direct
    // /platform/* URL (the rewrite below never fires for this branch at all,
    // since it returns first - this only guards someone linking/bookmarking
    // the literal /platform path against a tenant's own host).
    requestHeaders.set(TENANT_SLUG_HEADER, slug);
    if (req.nextUrl.pathname.startsWith("/platform")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // No tenant subdomain matched. If this is the platform's own domain (its
  // bare root domain, www, or local dev with no DEV_TENANT_SLUG configured),
  // rewrite the public marketing paths to the existing /platform/* routes -
  // reusing them, not duplicating them. A registered tenant custom domain
  // (e.g. glamix.com) also reaches here, since middleware can't look up
  // domains[] in Firestore at the Edge - that lookup still happens
  // server-side in tenant/current.ts, unchanged - it simply won't match
  // isPlatformDomain below and falls through with no rewrite, exactly as
  // before this change.
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").trim().toLowerCase();
  const isPlatformDomain =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    (!!rootDomain && (hostname === rootDomain || hostname === `www.${rootDomain}`));

  if (isPlatformDomain) {
    const pathname = req.nextUrl.pathname;
    const segment = pathname === "/" ? "" : pathname.slice(1);
    if (pathname === "/" || PLATFORM_ROUTE_SLUGS.has(segment)) {
      const url = req.nextUrl.clone();
      url.pathname = pathname === "/" ? "/platform" : `/platform/${segment}`;
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
