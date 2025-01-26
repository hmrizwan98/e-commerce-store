'use client';
import React, { FC } from 'react';
import NcImage from '@/shared/NcImage/NcImage';
import SocialsShare from '@/shared/SocialsShare/SocialsShare';
import { imgHigtQualitys, _getTitleRd } from '@/contains/fakeData';
import PostCardMeta from '@/components/PostCardMeta/PostCardMeta';
import Link from 'next/link';

export interface Card12Props {
  className?: string;
}

const Card12: FC<Card12Props> = ({ className = 'h-full' }) => {
  return (
    <div className={`nc-Card12 group relative flex flex-col ${className}`}>
      <Link
        href={'/blog-single'}
        className="relative flex-grow flex-shrink-0 block w-full h-0 overflow-hidden aspect-w-4 aspect-h-3 rounded-3xl">
        <NcImage
          src={imgHigtQualitys[0]}
          containerClassName="absolute inset-0"
          alt={'title'}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </Link>

      <SocialsShare className="absolute hidden md:grid gap-[5px] right-4 top-4 opacity-0 z-[-1] group-hover:z-10 group-hover:opacity-100 transition-all duration-300" />

      <div className="flex flex-col pr-10 mt-8 ">
        <h2
          className={`nc-card-title block font-semibold text-neutral-900 dark:text-neutral-100 transition-colors text-lg sm:text-2xl`}>
          <Link
            href={'/blog-single'}
            className="capitalize line-clamp-2"
            title={'title'}>
            {_getTitleRd()}
          </Link>
        </h2>
        <span className="hidden mt-4 sm:block text-neutral-500 dark:text-neutral-400">
          <span className="line-clamp-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati
            vero perspiciatis ullam ea? Nihil accusamus similique debitis
            tempore mollitia? Aperiam.
          </span>
        </span>
        <PostCardMeta className="mt-5" />
      </div>
    </div>
  );
};

export default Card12;
