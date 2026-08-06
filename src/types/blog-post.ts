export interface BlogPost {
  id: string;
  // Root-level collection (not tenant-scoped by path) - storeId is the tenant-isolation
  // boundary, filtered on every read. See src/lib/firebase/repositories/blog-posts.ts.
  storeId?: string;
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
