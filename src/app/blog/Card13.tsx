import React, { FC } from 'react';
import NcImage from '@/shared/NcImage/NcImage';
import { _getImgRd, _getTitleRd } from '@/contains/fakeData';
import PostCardMeta from '@/components/PostCardMeta/PostCardMeta';
import Link from 'next/link';
import type { BlogPost } from '@/types/blog-post';
import { safeImageSrc } from '@/utils/safeImageSrc';

export interface Card13Props {
  className?: string;
  post?: BlogPost;
}

const Card13: FC<Card13Props> = ({ className = '', post }) => {
  const title = post?.title ?? _getTitleRd();
  const image = post?.coverImage ?? _getImgRd();
  const excerpt = post?.excerpt;
  const publishedAt = post?.publishedAt;

  return (
    <div className={`nc-Card13 relative flex ${className}`} data-nc-id="Card13">
      <div className="flex flex-col h-full py-2">
        <h2 className={`nc-card-title block font-semibold text-base`}>
          <Link
            href={'/blog-single'}
            className="capitalize line-clamp-2"
            title={title}>
            {title}
          </Link>
        </h2>
        <span className="hidden my-3 sm:block text-slate-500 dark:text-slate-400 ">
          <span className="line-clamp-2">
            {excerpt ?? (
              <>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt
                dolorem voluptatibus numquam ut pariatur officiis?
              </>
            )}
          </span>
        </span>
        {publishedAt ? (
          <>
            <span className="block mt-4 text-sm sm:hidden text-slate-500 ">
              {new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="hidden mt-auto sm:block text-sm text-slate-500 dark:text-slate-400">
              {new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </>
        ) : (
          <>
            <span className="block mt-4 text-sm sm:hidden text-slate-500 ">
              May 20, 2021 · 2 min read
            </span>
            <div className="hidden mt-auto sm:block">
              <PostCardMeta />
            </div>
          </>
        )}
      </div>

      <Link
        href={'/blog-single'}
        className={`block relative h-full flex-shrink-0 w-2/5 sm:w-1/3 ml-3 sm:ml-5`}>
        <NcImage
          alt={title}
          src={safeImageSrc(image)}
          containerClassName="absolute inset-0"
          className="object-cover w-full h-full rounded-xl sm:rounded-3xl"
          sizes="400px"
          fill
        />
      </Link>
    </div>
  );
};

export default Card13;
