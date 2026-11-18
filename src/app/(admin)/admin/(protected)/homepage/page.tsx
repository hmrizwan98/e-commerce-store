import { redirect } from "next/navigation";

/**
 * Kept as a safe redirect so old links and bookmarks keep working.
 * Homepage sections are edited in the Theme Customizer (Page Sections) - the one editor whose
 * Publish is conflict-safe. This old editor wrote the live sections directly, which a later
 * Customizer publish could overwrite. (Its components/actions stay: the Customizer reuses them.)
 */
export default function LegacyHomepageEditorRedirect() {
  redirect("/admin/appearance/customize");
}
