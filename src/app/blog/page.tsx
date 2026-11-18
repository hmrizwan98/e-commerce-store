import React from 'react';
import type { Metadata } from 'next';
import SectionMagazine5 from './SectionMagazine5';
import Card13 from './Card13';
import BgGlassmorphism from '@/components/BgGlassmorphism/BgGlassmorphism';
import { getActiveBlogPosts } from '@/lib/firebase/repositories/blog-posts';
import { getGeneralSettings } from '@/lib/firebase/repositories/site-settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const general = await getGeneralSettings().catch(() => null);
  return { title: general?.storeName ? `Blog | ${general.storeName}` : 'Blog' };
}

/** The store's own published posts (Store Admin → Blog Posts) - this store only, newest first. */
export default async function BlogPage() {
  const posts = await getActiveBlogPosts();
  const featured = posts.slice(0, 4);
  const more = posts.slice(4);

  return (
    <div className="relative overflow-hidden nc-BlogPage">
      <BgGlassmorphism />
      <div className="container relative pt-12 pb-16 lg:pb-28 space-y-12">
        <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-neutral-100">Blog</h1>
        {posts.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400">No articles have been published yet.</p>
        ) : (
          <>
            <SectionMagazine5 posts={featured} />
            {more.length > 0 && (
              <div className="grid md:grid-cols-2 gap-x-12">
                {more.map((post) => (
                  <Card13 key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
