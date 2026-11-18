import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import NcImage from '@/shared/NcImage/NcImage';
import { getBlogPostBySlug } from '@/lib/firebase/repositories/blog-posts';
import { blogParagraphs } from '@/lib/blog/visibility';
import { safeImageSrc } from '@/utils/safeImageSrc';

export const dynamic = 'force-dynamic';

/** Only this store's published posts resolve (drafts/inactive/future-dated -> 404). */
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPostBySlug(decodeURIComponent(params.slug));
  if (!post) return { title: 'Article not found' };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  return {
    title,
    description,
    openGraph: { title, description, type: 'article', ...(post.coverImage ? { images: [post.coverImage] } : {}) },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(decodeURIComponent(params.slug));
  if (!post) notFound();
  const paragraphs = blogParagraphs(post.content);

  return (
    <article className="container py-12 lg:py-20">
      <div className="max-w-screen-md mx-auto space-y-6">
        <Link href="/blog" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
          &larr; All articles
        </Link>
        {post.publishedAt ? (
          <p className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        ) : null}
        <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">{post.title}</h1>
        {post.excerpt && <p className="text-lg text-neutral-500 dark:text-neutral-400">{post.excerpt}</p>}
      </div>
      {post.coverImage && (
        <div className="relative max-w-screen-lg mx-auto my-10 aspect-[16/9] rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <NcImage src={safeImageSrc(post.coverImage)} alt={post.title} fill containerClassName="absolute inset-0" className="object-cover" sizes="(max-width: 1024px) 100vw, 1024px" />
        </div>
      )}
      {/* Plain text from the admin textarea - rendered as text (React escapes it), never as HTML. */}
      <div className="max-w-screen-md mx-auto space-y-5 text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">{p}</p>
        ))}
      </div>
    </article>
  );
}
