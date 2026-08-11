"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export interface ProductGalleryProps {
  activeImage: string;
  thumbnails: string[];
  alt: string;
  clickable?: boolean;
  className?: string;
  mainImageClassName?: string;
}

/**
 * Shared by the real ProductDetailClient and all 3 themed PDP variants.
 * `activeImage` comes from useProductOptions (variant selection) and always
 * wins - a manually-clicked thumbnail is a purely local, presentational
 * override that resets the moment the selected variant's image changes, so
 * it can never visually contradict the currently-selected variant's real
 * price/stock.
 */
export default function ProductGallery({ activeImage, thumbnails, alt, clickable = true, className = "", mainImageClassName = "" }: ProductGalleryProps) {
  const [manualImage, setManualImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    setManualImage(undefined);
  }, [activeImage]);

  const displayedImage = manualImage ?? activeImage;

  return (
    <div className={className}>
      <div className={`aspect-w-16 aspect-h-16 relative ${mainImageClassName}`}>
        <Image
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          src={displayedImage}
          className="w-full rounded-2xl object-cover"
          alt={alt}
        />
      </div>
      {thumbnails.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-3 sm:gap-6 sm:mt-6 xl:gap-8 xl:mt-8">
          {thumbnails.map((src, index) => (
            <button
              key={index}
              type="button"
              disabled={!clickable}
              className={`aspect-w-11 xl:aspect-w-10 2xl:aspect-w-11 aspect-h-16 relative ${
                clickable ? "cursor-pointer" : "cursor-default"
              } ${displayedImage === src ? "ring-2 ring-primary-6000 rounded-2xl" : ""}`}
              onClick={() => clickable && setManualImage(src)}
            >
              <Image sizes="(max-width: 640px) 100vw, 33vw" fill src={src} className="w-full rounded-2xl object-cover" alt={alt} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
