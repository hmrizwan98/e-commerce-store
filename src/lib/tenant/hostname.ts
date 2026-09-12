/**
 * Normalizes hostnames consistently:
 * - lowercase
 * - remove protocol (http://, https://)
 * - remove trailing slash and path components
 * - handle ports safely in development (e.g. localhost:3000 -> localhost)
 */
export function normalizeHostname(rawHost: string | null | undefined): string {
  if (!rawHost) return "";
  let host = rawHost.trim().toLowerCase();
  if (host.includes("://")) {
    host = host.split("://")[1];
  }
  if (host.includes("/")) {
    host = host.split("/")[0];
  }
  if (host.includes(":")) {
    host = host.split(":")[0];
  }
  return host;
}

export type HostType =
  | "marketing"
  | "superadmin"
  | "tenant-admin"
  | "tenant-storefront"
  | "custom-admin"
  | "custom-storefront";

export interface ParsedHost {
  type: HostType;
  slug?: string;
  customDomain?: string;
}

/**
 * Parses a normalized hostname against platform rootDomain & reserved subdomains.
 */
export function parseHost(hostname: string, rootDomainInput?: string): ParsedHost {
  const normHost = normalizeHostname(hostname);
  const rootDomain = normalizeHostname(rootDomainInput || process.env.NEXT_PUBLIC_ROOT_DOMAIN || (process.env.NODE_ENV === "production" ? "webriiz.com" : undefined));

  if (!normHost || normHost === "localhost" || normHost === "127.0.0.1") {
    return { type: "marketing" };
  }

  // 1. Check Super Admin host (superadmin.webriiz.com or superadmin.localhost)
  if (
    (rootDomain && normHost === `superadmin.${rootDomain}`) ||
    normHost === "superadmin.localhost" ||
    normHost === "superadmin.127.0.0.1"
  ) {
    return { type: "superadmin" };
  }

  // 2. Check Platform Subdomains (*.webriiz.com or *.localhost)
  const isPlatformSubdomain =
    (rootDomain && normHost.endsWith(`.${rootDomain}`) && normHost !== rootDomain && normHost !== `www.${rootDomain}`) ||
    (normHost.endsWith(".localhost") && normHost !== "localhost") ||
    (normHost.endsWith(".127.0.0.1") && normHost !== "127.0.0.1");

  if (isPlatformSubdomain) {
    let sub = "";
    if (rootDomain && normHost.endsWith(`.${rootDomain}`)) {
      sub = normHost.slice(0, -rootDomain.length - 1);
    } else if (normHost.endsWith(".localhost")) {
      sub = normHost.slice(0, -".localhost".length);
    } else if (normHost.endsWith(".127.0.0.1")) {
      sub = normHost.slice(0, -".127.0.0.1".length);
    }

    if (sub.startsWith("admin.")) {
      const slug = sub.slice(6);
      if (slug && slug !== "www" && slug !== "superadmin") {
        return { type: "tenant-admin", slug };
      }
    } else if (sub === "www") {
      return { type: "marketing" };
    } else if (sub === "superadmin") {
      return { type: "superadmin" };
    } else {
      return { type: "tenant-storefront", slug: sub };
    }
  }

  // 3. Marketing root domain
  if (
    (rootDomain && (normHost === rootDomain || normHost === `www.${rootDomain}`)) ||
    normHost.endsWith(".vercel.app")
  ) {
    return { type: "marketing" };
  }

  // 4. Custom Domains (e.g. admin.glamix.pk vs glamix.pk)
  if (normHost.startsWith("admin.")) {
    const customDomain = normHost.slice(6);
    if (customDomain) {
      return { type: "custom-admin", customDomain };
    }
  }

  return { type: "custom-storefront", customDomain: normHost };
}
