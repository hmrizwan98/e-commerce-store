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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Blog Posts</h1>
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

      {(nextHref || prevHref) && (
        <div className="flex items-center justify-end gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono">
          <Link
            href={prevHref ?? "#"}
            aria-disabled={!prevHref}
            className={`px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-medium ${
              !prevHref ? "pointer-events-none opacity-40" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            Previous
          </Link>
          <Link
            href={nextHref ?? "#"}
            aria-disabled={!nextHref}
            className={`px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-medium ${
              !nextHref ? "pointer-events-none opacity-40" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
