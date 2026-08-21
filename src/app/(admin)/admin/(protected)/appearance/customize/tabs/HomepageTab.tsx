"use client";

import React from "react";
import HomepageSections, { type PickerOption } from "../../../homepage/HomepageSections";
import type { HomepageSection } from "@/types/homepage-section";

export interface HomepageTabProps {
  sections: HomepageSection[];
  categoryOptions: PickerOption[];
  productOptions: PickerOption[];
  brandOptions?: PickerOption[];
  testimonialOptions?: PickerOption[];
  onSectionsChange?: (sections: HomepageSection[]) => void;
}

export default function HomepageTab({ sections, categoryOptions, productOptions, brandOptions, testimonialOptions, onSectionsChange }: HomepageTabProps) {
  return (
    <HomepageSections
      sections={sections}
      categoryOptions={categoryOptions}
      productOptions={productOptions}
      brandOptions={brandOptions}
      testimonialOptions={testimonialOptions}
      onSectionsChange={onSectionsChange}
    />
  );
}
