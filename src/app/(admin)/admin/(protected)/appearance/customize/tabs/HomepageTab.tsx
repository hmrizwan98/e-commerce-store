"use client";

import React from "react";
import HomepageSections, { type PickerOption } from "../../../homepage/HomepageSections";
import type { HomepageSection } from "@/types/homepage-section";

export interface HomepageTabProps {
  sections: HomepageSection[];
  categoryOptions: PickerOption[];
  productOptions: PickerOption[];
}

/**
 * Embeds the same, already-live homepage builder used at /admin/homepage -
 * this is the real system src/app/page.tsx renders from (getActiveHomepageSections()).
 * The theme engine's own theme.homepage.sections field is unrelated dead code
 * (SectionRegistry.tsx is imported nowhere) and is intentionally not used here.
 */
export default function HomepageTab({ sections, categoryOptions, productOptions }: HomepageTabProps) {
  return <HomepageSections sections={sections} categoryOptions={categoryOptions} productOptions={productOptions} />;
}
