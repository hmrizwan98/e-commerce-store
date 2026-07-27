export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  order: number;
  isDeleted?: boolean;
  deletedAt?: number | null;
  createdAt?: number;
  updatedAt?: number;
}
