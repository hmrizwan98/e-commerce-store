'use client';
import React, { FC } from 'react';
import NcImage from '@/shared/NcImage/NcImage';
import { _getImgRd, _getTitleRd } from '@/contains/fakeData';
import PostCardMeta from '@/components/PostCardMeta/PostCardMeta';
import Link from 'next/link';

export interface Card13Props {
  className?: string;
}

const Card13: FC<Card13Props> = ({ className = '' }) => {
  return (
    <div className={`nc-Card13 relative flex ${className}`} data-nc-id="Card13">
      <div className="flex flex-col h-full py-2">
        <h2 className={`nc-card-title block font-semibold text-base`}>
          <Link
            href={'/blog-single'}
            className="capitalize line-clamp-2"
            title={'title'}>
            {_getTitleRd()}
          </Link>
        </h2>
        <span className="hidden my-3 sm:block text-slate-500 dark:text-slate-400 ">
          <span className="line-clamp-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt
            dolorem voluptatibus numquam ut pariatur officiis?
          </span>
        </span>
        <span className="block mt-4 text-sm sm:hidden text-slate-500 ">
          May 20, 2021 · 2 min read
        </span>
        <div className="hidden mt-auto sm:block">
          <PostCardMeta />
        </div>
      </div>

      <Link
        href={'/blog-single'}
        className={`block relative h-full flex-shrink-0 w-2/5 sm:w-1/3 ml-3 sm:ml-5`}>
        <NcImage
          alt=""
          src={_getImgRd()}
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
