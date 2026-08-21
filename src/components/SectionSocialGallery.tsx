"use client";

import React, { FC } from "react";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import Heading from "@/components/Heading/Heading";
import { safeImageSrc } from "@/utils/safeImageSrc";

import collection1 from "@/images/collections/1.png";
import collection2 from "@/images/collections/2.png";
import collection3 from "@/images/collections/3.png";
import collection4 from "@/images/collections/4.png";
import collection5 from "@/images/collections/5.png";
import collection6 from "@/images/collections/6.png";

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

const DEFAULT_GALLERY: SocialGalleryItem[] = [
  { image: collection1.src, href: "#" },
  { image: collection2.src, href: "#" },
  { image: collection3.src, href: "#" },
  { image: collection4.src, href: "#" },
  { image: collection5.src, href: "#" },
  { image: collection6.src, href: "#" },
];

const SectionSocialGallery: FC<SectionSocialGalleryProps> = ({
  className = "",
  heading = "Follow us on Instagram",
  subHeading = "Tag us @GlamixStore to be featured on our page",
  data = [],
}) => {
  const displayItems = data && data.length ? data : DEFAULT_GALLERY;

  return (
    <div className={`nc-SectionSocialGallery relative ${className}`}>
      <Heading desc={subHeading}>{heading}</Heading>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5">
        {displayItems.map((item, index) => {
          const tileContent = (
            <div className="relative w-full h-0 rounded-2xl overflow-hidden aspect-w-1 aspect-h-1 bg-slate-100 dark:bg-slate-800 group shadow-sm hover:shadow-xl transition-all duration-300">
              <NcImage
                alt="Social photo"
                containerClassName="absolute inset-0"
                src={safeImageSrc(item.image)}
                className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
              />
              {/* Instagram Hover Badge Overlay */}
              <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-lg transform group-hover:scale-110 transition-transform">
                  <svg
                    className="w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
              </div>
            </div>
          );

          return item.href ? (
            <Link
              key={index}
              href={item.href as any}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="block"
            >
              {tileContent}
            </Link>
          ) : (
            <div key={index}>{tileContent}</div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionSocialGallery;
