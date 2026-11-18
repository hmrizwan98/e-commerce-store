import { redirect } from "next/navigation";

/**
 * Kept as a safe redirect so old links and bookmarks keep working.
 * The old Theme Editor wrote the legacy `themes` collection, which the storefront ignores once a
 * store has published theme settings (every current store). Theme settings - including logos,
 * favicon, Apple touch icon and loading logo - are edited in the Theme Customizer.
 */
export default function LegacyThemeEditorRedirect() {
  redirect("/admin/appearance/customize");
}
