export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string | null;
  order: number;
  productCount?: number;
  isActive: boolean;
  showInNav: boolean;
  showOnHomepage: boolean;
  seoTitle?: string;
  seoDescription?: string;
  isDeleted?: boolean;
  deletedAt?: number | null;
  createdAt?: number;
  updatedAt?: number;
}
