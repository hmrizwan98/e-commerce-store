import React, { FC } from 'react';
import NcImage from '@/shared/NcImage/NcImage';
import SocialsShare from '@/shared/SocialsShare/SocialsShare';
import { imgHigtQualitys, _getTitleRd } from '@/contains/fakeData';
import Link from 'next/link';
import type { BlogPost } from '@/types/blog-post';
import { safeImageSrc } from '@/utils/safeImageSrc';

export interface Card12Props {
  className?: string;
  post?: BlogPost;
  showDate?: boolean;
  showReadMore?: boolean;
  readMoreText?: string;
}

const Card12: FC<Card12Props> = ({
  className = 'h-full',
  post,
  showDate = true,
  showReadMore = true,
  readMoreText = 'Read Article',
}) => {
  const title = post?.title ?? _getTitleRd();
  const image = post?.coverImage ?? imgHigtQualitys[0];
  const excerpt = post?.excerpt;
  const publishedAt = post?.publishedAt;
  const postHref = (post?.slug ? `/blog/${post.slug}` : '/blog-single') as any;

  return (
    <div className={`nc-Card12 group relative flex flex-col h-full ${className}`}>
      {/* Immersive Cover Image Container */}
      <Link
        href={postHref}
        className="relative block w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 shadow-xs group-hover:shadow-lg transition-shadow duration-500"
      >
        <NcImage
          src={safeImageSrc(image)}
          containerClassName="absolute inset-0"
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </Link>

      <SocialsShare className="absolute hidden md:grid gap-[5px] right-6 top-6 opacity-0 z-10 group-hover:opacity-100 transition-all duration-300 bg-white/90 dark:bg-slate-900/90 p-1.5 rounded-full shadow-lg backdrop-blur-md" />

      {/* Content Area */}
      <div className="flex flex-col flex-1 mt-5 sm:mt-6 justify-between">
        <div>
          {showDate && publishedAt && (
            <span className="block text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-2">
              {new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}

          <h2 className="nc-card-title block font-extrabold text-slate-900 dark:text-slate-100 text-xl sm:text-2xl lg:text-3xl leading-tight group-hover:text-sky-600 transition-colors">
            <Link href={postHref} className="line-clamp-2" title={title}>
              {title}
            </Link>
          </h2>

          {excerpt && (
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
              {excerpt}
            </p>
          )}
        </div>

        {showReadMore && (
          <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <Link
              href={postHref}
              className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 transition-colors inline-flex items-center gap-1.5"
            >
              <span>{readMoreText || 'Read Article'}</span>
              <span className="group-hover:translate-x-1.5 transition-transform duration-300">&rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card12;
