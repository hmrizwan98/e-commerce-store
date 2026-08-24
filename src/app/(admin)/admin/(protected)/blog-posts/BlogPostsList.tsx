import React from "react";
import Link from "next/link";
import BlogPostRowActions from "./BlogPostRowActions";
import type { BlogPost } from "@/types/blog-post";

const BlogPostsList: React.FC<{ posts: BlogPost[] }> = ({ posts }) => {
  if (!posts.length) {
    return (
      <div className="text-center py-16 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-700 shadow-xl shadow-slate-900/5 space-y-4">
        <div className="text-4xl">📝</div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No blog posts yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Create engaging articles to share news, updates, and product guides with your customers.
          </p>
        </div>
        <Link
          href={"/admin/blog-posts/new" as any}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-primary-6000 text-white text-sm font-semibold shadow-lg shadow-primary-500/20 hover:scale-105 transition-all"
        >
          + Add your first post
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xl shadow-slate-900/5 flex flex-wrap items-center gap-5 hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
        >
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
            {post.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                {post.title.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Link href={`/admin/blog-posts/${post.id}/edit` as any} className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {post.title}
              </Link>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                  post.isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                {post.isActive ? "● Published" : "○ Draft"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              /{post.slug} · {new Date(post.publishedAt).toLocaleDateString()}
            </p>
            {post.excerpt && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-1 max-w-xl leading-relaxed">{post.excerpt}</p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href={`/admin/blog-posts/${post.id}/edit` as any}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
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
