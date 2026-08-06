import React from "react";
import Link from "next/link";
import BlogPostRowActions from "./BlogPostRowActions";
import type { BlogPost } from "@/types/blog-post";

const BlogPostsList: React.FC<{ posts: BlogPost[] }> = ({ posts }) => {
  if (!posts.length) {
    return (
      <div className="text-center py-12 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl">
        <p className="text-sm text-neutral-500">No blog posts yet.</p>
        <Link
          href={"/admin/blog-posts/new" as any}
          className="inline-block mt-3 px-4 py-2 text-sm rounded-full bg-primary-6000 text-white font-medium"
        >
          + Add your first post
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center gap-4"
        >
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
            {post.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm font-semibold">
                {post.title.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/admin/blog-posts/${post.id}/edit` as any} className="font-semibold hover:underline">
                {post.title}
              </Link>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  post.isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                    : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                }`}
              >
                {post.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              /{post.slug} · {new Date(post.publishedAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-1 max-w-md">{post.excerpt}</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link href={`/admin/blog-posts/${post.id}/edit` as any} className="text-sm font-medium hover:underline">
              Edit
            </Link>
            <BlogPostRowActions id={post.id} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogPostsList;
