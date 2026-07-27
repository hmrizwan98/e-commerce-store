export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImage: string;
  publishedAt: number;
  isActive: boolean;
  order: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: number;
  updatedAt?: number;
}
