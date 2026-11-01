import React from "react";
import { renderSection } from "@/app/HomeContent";
import { extraPageSections } from "@/lib/theme/page-sections";
import type { SystemThemeConfig } from "@/lib/theme/theme-types";
import type { HomepageSection } from "@/types/homepage-section";

/** Sections the admin added to a page in the Customizer (e.g. the product page), rendered with
 * the homepage section renderer below the page content, in editor order. */
export default async function ExtraPageSections({ sections, theme }: { sections?: HomepageSection[]; theme: SystemThemeConfig }) {
  const list = extraPageSections(sections);
  if (!list.length) return null;
  const rendered = (await Promise.all(list.map((sec) => renderSection(sec, theme)))).filter(Boolean);
  if (!rendered.length) return null;
  return (
    <div className="container relative my-16 space-y-16 lg:my-24 lg:space-y-24">
      {rendered.map((el, i) => (
        <React.Fragment key={i}>{el}</React.Fragment>
      ))}
    </div>
  );
}
