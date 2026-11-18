import { redirect } from "next/navigation";

/**
 * Kept as a safe redirect so old links and bookmarks keep working.
 * This builder edited theme.homepage.sections, which the storefront never reads, and saved a
 * page-load snapshot of the whole draft (overwriting newer Customizer changes). Homepage sections
 * are edited in the Theme Customizer.
 */
export default function LegacyHomepageBuilderRedirect() {
  redirect("/admin/appearance/customize");
}
