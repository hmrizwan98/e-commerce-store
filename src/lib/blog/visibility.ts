import type { BlogPost } from "@/types/blog-post";

/**
 * A blog post is public only when the merchant marked it Active (Store Admin → Blog Posts)
 * and its published date has arrived. Drafts / inactive posts are never shown, and a post
 * dated in the future stays hidden until that date.
 */
export function isPublicBlogPost(post: Pick<BlogPost, "isActive" | "publishedAt"> | null | undefined, now = Date.now()): boolean {
  if (!post || post.isActive !== true) return false;
  return !post.publishedAt || post.publishedAt <= now;
}

/** Plain-text post body -> paragraphs (the admin editor is a plain textarea; never HTML). */
export function blogParagraphs(content: string | undefined | null): string[] {
  return (content ?? "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
