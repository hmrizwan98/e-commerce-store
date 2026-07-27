import type { PageSectionType } from "@/types/page-section";

export interface PageSectionMeta {
  icon: string;
  label: string;
  description: string;
  accent: string;
  border: string;
  /** Which config fields this section type's card should show when expanded. */
  fields: Array<"heading" | "subHeading" | "body" | "image" | "imagePosition" | "buttonText" | "buttonHref" | "limit">;
}

export const PAGE_SECTION_META: Record<PageSectionType, PageSectionMeta> = {
  hero: {
    icon: "🖼️",
    label: "Hero Banner",
    description: "A large banner with heading, text, image and a button.",
    accent: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    border: "border-l-blue-400",
    fields: ["heading", "subHeading", "image", "buttonText", "buttonHref"],
  },
  richText: {
    icon: "📝",
    label: "Rich Text",
    description: "A plain HTML/rich-text content block.",
    accent: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
    border: "border-l-slate-400",
    fields: ["heading", "body"],
  },
  imageText: {
    icon: "🖼️",
    label: "Image + Text",
    description: "An image next to a heading and paragraph.",
    accent: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
    border: "border-l-pink-400",
    fields: ["heading", "body", "image", "imagePosition", "buttonText", "buttonHref"],
  },
  cta: {
    icon: "🎯",
    label: "Call To Action",
    description: "A heading, short text, and a button.",
    accent: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
    border: "border-l-orange-400",
    fields: ["heading", "body", "buttonText", "buttonHref"],
  },
  banner: {
    icon: "🎯",
    label: "Custom Banner",
    description: "A full-width image banner with overlay text and a link.",
    accent: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
    border: "border-l-orange-400",
    fields: ["heading", "subHeading", "image", "buttonText", "buttonHref"],
  },
  faq: {
    icon: "❓",
    label: "FAQ",
    description: "Your published FAQs, managed in Content -> FAQs.",
    accent: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    border: "border-l-indigo-400",
    fields: ["heading"],
  },
  testimonials: {
    icon: "❤️",
    label: "Testimonials",
    description: "Approved customer reviews, managed in Content -> Testimonials.",
    accent: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    border: "border-l-purple-400",
    fields: ["heading"],
  },
  newsletter: {
    icon: "✉️",
    label: "Newsletter",
    description: "An email subscription signup block.",
    accent: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    border: "border-l-indigo-400",
    fields: ["heading", "subHeading"],
  },
  productGrid: {
    icon: "🔲",
    label: "Product Grid",
    description: "A grid of featured products.",
    accent: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    border: "border-l-green-400",
    fields: ["heading", "limit"],
  },
  categoryGrid: {
    icon: "📦",
    label: "Category Grid",
    description: "A row of category cards.",
    accent: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    border: "border-l-green-400",
    fields: ["heading", "subHeading"],
  },
  divider: {
    icon: "➖",
    label: "Spacer / Divider",
    description: "Blank vertical space between sections.",
    accent: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
    border: "border-l-neutral-400",
    fields: [],
  },
};

export const PAGE_SECTION_TYPES = Object.keys(PAGE_SECTION_META) as PageSectionType[];
