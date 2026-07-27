import React, { FC } from "react";
import Link from "next/link";
import type { Route } from "next";
import NcImage from "@/shared/NcImage/NcImage";
import Heading from "@/components/Heading/Heading";
import { safeImageSrc } from "@/utils/safeImageSrc";

export interface SocialGalleryItem {
  image: string;
  href?: string;
}

export interface SectionSocialGalleryProps {
  className?: string;
  heading?: string;
  subHeading?: string;
  data?: SocialGalleryItem[];
}

const SectionSocialGallery: FC<SectionSocialGalleryProps> = ({
  className = "",
  heading = "Follow us on Instagram",
  subHeading = "",
  data = [],
}) => {
  return (
    <div className={`nc-SectionSocialGallery ${className}`}>
      <Heading desc={subHeading}>{heading}</Heading>
      {data.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
          {data.map((item, index) => {
            const tile = (
              <div className="relative w-full h-0 rounded-xl overflow-hidden aspect-w-1 aspect-h-1 bg-neutral-100 dark:bg-neutral-800 group">
                <NcImage
                  alt=""
                  containerClassName="absolute inset-0"
                  src={safeImageSrc(item.image)}
                  className="object-cover w-full h-full"
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                />
                <span className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/10 transition-opacity" />
              </div>
            );
            return item.href ? (
              <Link key={index} href={item.href as Route} className="block">
                {tile}
              </Link>
            ) : (
              <div key={index}>{tile}</div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-neutral-500 dark:text-neutral-400">
          Social gallery not configured yet
        </div>
      )}
    </div>
  );
};

export default SectionSocialGallery;
