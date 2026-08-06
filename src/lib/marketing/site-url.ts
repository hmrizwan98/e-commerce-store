const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "yourdomain.com";

/** The Platform marketing site's own canonical origin - distinct from any tenant's domain. */
export const PLATFORM_SITE_URL = `https://${ROOT_DOMAIN}`;
