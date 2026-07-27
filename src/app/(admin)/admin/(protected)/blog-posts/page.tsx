import React from "react";
import Link from "next/link";
import { getAllBlogPostsForAdmin } from "@/lib/firebase/repositories/blog-posts";
import BlogPostsList from "./BlogPostsList";

export const dynamic = "force-dynamic";

export default async function AdminBlogPostsPage() {
  const posts = await getAllBlogPostsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Blog Posts ({posts.length})</h1>
          <p className="text-sm text-neutral-500 mt-1">Posts shown in the homepage &quot;Latest blog&quot; section and the blog page.</p>
        </div>
        <Link
          href={"/admin/blog-posts/new" as any}
          className="px-4 py-2 rounded-full bg-primary-6000 text-white text-sm font-medium"
        >
          + Add post
        </Link>
      </div>

      <BlogPostsList posts={posts} />
    </div>
  );
}
