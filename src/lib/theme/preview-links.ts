/**
 * Where a click inside the Theme Customizer preview should go.
 *
 * The preview iframe runs on the STORE ADMIN host (admin-{slug}.… / admin.<custom domain>),
 * where "/" is the admin dashboard and storefront paths like /product/x don't exist. So a
 * storefront link must never be followed inside the iframe:
 * - pages the preview can render with the draft theme (home, collection, product, cart) switch
 *   the preview to that page;
 * - every other storefront page opens on the public storefront in a new tab;
 * - admin / super admin paths are blocked.
 * Pure (no DOM) so it can be unit-tested.
 */
export type PreviewSurface = "home" | "collection" | "product" | "cart";

export type PreviewLinkAction =
  | { kind: "surface"; surface: PreviewSurface; productSlug?: string }
  | { kind: "storefront"; url: string }
  | { kind: "external"; url: string }
  | { kind: "blocked" }
  | { kind: "default" };

export function resolvePreviewLink(href: string | null | undefined, adminOrigin: string, storefrontOrigin: string): PreviewLinkAction {
  if (!href) return { kind: "default" };
  const raw = href.trim();
  if (!raw || raw.startsWith("#") || /^(mailto|tel|sms|javascript):/i.test(raw)) {
    return raw.toLowerCase().startsWith("javascript:") ? { kind: "blocked" } : { kind: "default" };
  }

  let url: URL;
  try {
    url = new URL(raw, adminOrigin);
  } catch {
    return { kind: "blocked" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return { kind: "blocked" };

  const storefront = safeUrl(storefrontOrigin);
  const sameAdminHost = url.origin === new URL(adminOrigin).origin;
  const sameStorefrontHost = storefront ? url.origin === storefront.origin : false;
  if (!sameAdminHost && !sameStorefrontHost) return { kind: "external", url: url.toString() };

  // Path-based tenant links (/store/{slug}/...) are local-dev only - strip the prefix.
  let path = url.pathname.replace(/^\/store\/[^/]+/, "") || "/";
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

  if (/^\/(admin|superadmin)(\/|$)/.test(path) || path.startsWith("/api/")) return { kind: "blocked" };

  if (path === "/" || path === "/home") return { kind: "surface", surface: "home" };
  if (path === "/collection") return { kind: "surface", surface: "collection" };
  if (path === "/cart") return { kind: "surface", surface: "cart" };
  const product = path.match(/^\/product\/([^/]+)$/);
  if (product) return { kind: "surface", surface: "product", productSlug: decodeURIComponent(product[1]) };

  if (!storefront) return { kind: "blocked" };
  return { kind: "storefront", url: `${storefront.origin}${path}${url.search}${url.hash}` };
}

function safeUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/**
 * The public storefront origin for the admin host the editor runs on:
 * admin-{slug}.root → {slug}.root, admin.<custom domain> → <custom domain>. Works for every
 * tenant and custom domain (and *.localhost in development). null if the host isn't an admin host.
 */
export function storefrontOriginFromAdminHost(host: string | null | undefined, protocol: "http" | "https"): string | null {
  if (!host) return null;
  const h = host.trim().toLowerCase();
  const [name, port] = h.split(":");
  let storefrontName: string | null = null;
  if (name.startsWith("admin-")) storefrontName = name.slice("admin-".length);
  else if (name.startsWith("admin.")) storefrontName = name.slice("admin.".length);
  if (!storefrontName || (!storefrontName.includes(".") && storefrontName !== "localhost")) return null;
  return `${protocol}://${storefrontName}${port ? `:${port}` : ""}`;
}
