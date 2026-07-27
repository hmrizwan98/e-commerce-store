export type CmsPageStatus = "draft" | "published" | "archived";

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  /** Derived from status ("published" -> true) - this is what getPageBySlug actually gates on. */
  isActive: boolean;
  status?: CmsPageStatus;
  createdAt?: number;
  updatedAt?: number;
}
