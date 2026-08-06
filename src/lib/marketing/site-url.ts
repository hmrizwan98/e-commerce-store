import { getPlatformBaseUrl } from "@/lib/platform/base-url";

/** The Platform marketing site's own canonical origin - distinct from any tenant's domain. */
export const PLATFORM_SITE_URL = getPlatformBaseUrl();
