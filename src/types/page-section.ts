export type PageSectionType =
  | "hero"
  | "richText"
  | "imageText"
  | "cta"
  | "banner"
  | "faq"
  | "testimonials"
  | "newsletter"
  | "productGrid"
  | "categoryGrid"
  | "divider";

export interface PageSectionConfig {
  heading?: string;
  subHeading?: string;
  /** Rich text / HTML body - used by "richText" and as the paragraph under imageText/cta/hero. */
  body?: string;
  image?: string;
  imagePosition?: "left" | "right";
  buttonText?: string;
  buttonHref?: string;
  limit?: number;
}

export interface PageSection {
  id: string;
  type: PageSectionType;
  title: string;
  order: number;
  isActive: boolean;
  config: PageSectionConfig;
  createdAt?: number;
  updatedAt?: number;
}
