import React, { FC } from 'react';
import NcImage from '@/shared/NcImage/NcImage';
import { _getImgRd, _getTitleRd } from '@/contains/fakeData';
import Link from 'next/link';
import type { BlogPost } from '@/types/blog-post';
import { safeImageSrc } from '@/utils/safeImageSrc';

export interface Card13Props {
  className?: string;
  post?: BlogPost;
  showDate?: boolean;
}

const Card13: FC<Card13Props> = ({ className = '', post, showDate = true }) => {
  const title = post?.title ?? _getTitleRd();
  const image = post?.coverImage ?? _getImgRd();
  const excerpt = post?.excerpt;
  const publishedAt = post?.publishedAt;
  const postHref = (post?.slug ? `/blog/${post.slug}` : '/blog-single') as any;

  return (
    <div
      className={`nc-Card13 group relative flex items-center justify-between gap-5 sm:gap-6 py-4 sm:py-5 border-b border-slate-200/70 dark:border-slate-800/70 last:border-b-0 transition-colors ${className}`}
      data-nc-id="Card13"
    >
      {/* Left Text Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          {showDate && (
            <span className="block text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">
              {publishedAt
                ? new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recent Article'}
            </span>
          )}

          <h3 className="nc-card-title block font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-snug group-hover:text-sky-600 transition-colors">
            <Link href={postHref} className="line-clamp-2" title={title}>
              {title}
            </Link>
          </h3>

          {excerpt && (
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
              {excerpt}
            </p>
          )}
        </div>
      </div>

      {/* Right Image Container */}
      <Link
        href={postHref}
        className="relative w-28 sm:w-36 md:w-40 aspect-[4/3] flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xs group-hover:shadow-md transition-shadow duration-300"
      >
        <NcImage
          alt={title}
          src={safeImageSrc(image)}
          containerClassName="absolute inset-0"
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
          sizes="200px"
          fill
        />
      </Link>
    </div>
  );
};

export default Card13;
