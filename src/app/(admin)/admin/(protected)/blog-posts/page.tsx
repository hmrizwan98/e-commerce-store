import React from "react";
import Link from "next/link";
import { getBlogPostsPageForAdmin, type BlogPostsPageCursor } from "@/lib/firebase/repositories/blog-posts";
import BlogPostsList from "./BlogPostsList";

export const dynamic = "force-dynamic";

/** Stack of {order,id} cursors, one per page already visited - Next pushes the current
 * page's last post onto it, Previous pops the last entry off. Encoded as plain,
 * URL-safe values (not a serialized DocumentSnapshot, which can't cross a Server
 * Component page boundary). */
function parseCursorStack(raw?: string): BlogPostsPageCursor[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => {
      const [orderStr, id] = entry.split("_");
      return { order: Number(orderStr), id };
    })
    .filter((c): c is BlogPostsPageCursor => Number.isFinite(c.order) && !!c.id);
}

function serializeCursorStack(stack: BlogPostsPageCursor[]): string {
  return stack.map((c) => `${c.order}_${c.id}`).join(",");
}

function blogPostsHref(cursorStack: BlogPostsPageCursor[]) {
  return cursorStack.length
    ? ({ pathname: "/admin/blog-posts", query: { cursor: serializeCursorStack(cursorStack) } } as any)
    : ("/admin/blog-posts" as any);
}

export default async function AdminBlogPostsPage({
  searchParams,
}: {
  searchParams: { cursor?: string };
}) {
  const cursorStack = parseCursorStack(searchParams.cursor);
  const startAfter = cursorStack.length ? cursorStack[cursorStack.length - 1] : undefined;

  const { posts, hasMore } = await getBlogPostsPageForAdmin({ startAfter });
  const lastPost = posts.length ? posts[posts.length - 1] : undefined;

  const nextHref =
    hasMore && lastPost ? blogPostsHref([...cursorStack, { order: lastPost.order, id: lastPost.id }]) : undefined;
  const prevHref = cursorStack.length ? blogPostsHref(cursorStack.slice(0, -1)) : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-wider mb-2">
            📝 Editorial & News
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Blog Posts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Posts shown in the homepage &quot;Latest blog&quot; section and the blog directory.</p>
        </div>
        <Link
          href={"/admin/blog-posts/new" as any}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-primary-6000 hover:bg-primary-700 text-white text-sm font-semibold shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02]"
        >
          + Add post
        </Link>
      </div>

      <BlogPostsList posts={posts} />

      {(nextHref || prevHref) && (
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg text-xs font-medium">
          <Link
            href={prevHref ?? "#"}
            aria-disabled={!prevHref}
            className={`px-4 py-2 rounded-full border border-slate-200/80 dark:border-slate-700/80 font-semibold transition-all ${
              !prevHref ? "pointer-events-none opacity-40" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            }`}
          >
            ← Previous
          </Link>
          <Link
            href={nextHref ?? "#"}
            aria-disabled={!nextHref}
            className={`px-4 py-2 rounded-full border border-slate-200/80 dark:border-slate-700/80 font-semibold transition-all ${
              !nextHref ? "pointer-events-none opacity-40" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            }`}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}
