"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export interface ProductGalleryProps {
  activeImage: string;
  thumbnails: string[];
  alt: string;
  clickable?: boolean;
  className?: string;
  mainImageClassName?: string;
  /** "grid" (default): main image + 2 tiles below. "thumbnails": main image with a strip of
   * ALL product images (vertical on desktop, horizontal on phones) and prev/next arrows. */
  layout?: "grid" | "thumbnails";
  /** All product images - used by the "thumbnails" layout. */
  images?: string[];
}

/**
 * Shared by the real ProductDetailClient and all 3 themed PDP variants.
 * `activeImage` comes from useProductOptions (variant selection) and always
 * wins - a manually-clicked thumbnail is a purely local, presentational
 * override that resets the moment the selected variant's image changes, so
 * it can never visually contradict the currently-selected variant's real
 * price/stock.
 */
export default function ProductGallery({
  activeImage,
  thumbnails,
  alt,
  clickable = true,
  className = "",
  mainImageClassName = "",
  layout = "grid",
  images = [],
}: ProductGalleryProps) {
  const [manualImage, setManualImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    setManualImage(undefined);
  }, [activeImage]);

  const displayedImage = manualImage ?? activeImage;

  if (layout === "thumbnails") {
    const all = images.length ? (images.includes(activeImage) ? images : [activeImage, ...images]) : [activeImage];
    const index = Math.max(0, all.indexOf(displayedImage));
    const go = (delta: number) => setManualImage(all[(index + delta + all.length) % all.length]);
    const canBrowse = clickable && all.length > 1;
    return (
      <div className={`flex flex-col-reverse lg:flex-row gap-3 lg:gap-4 ${className}`}>
        {all.length > 1 && (
          <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto lg:max-h-[640px] lg:w-20 shrink-0 pb-1 lg:pb-0 lg:pr-1">
            {all.map((src, i) => (
              <button
                key={src + i}
                type="button"
                disabled={!clickable}
                aria-label={`Show image ${i + 1} of ${all.length}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => clickable && setManualImage(src)}
                className={`relative shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden bg-[var(--surface,#f5f5f4)] border-2 transition ${
                  i === index ? "border-[var(--heading,#0f172a)]" : "border-transparent opacity-70 hover:opacity-100"
                } ${clickable ? "cursor-pointer" : "cursor-default"}`}
              >
                <Image fill sizes="80px" src={src} className="object-cover" alt={`${alt} - image ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
        {/* w-full on phones (a column flex-1 would collapse to 0 height); self-start on desktop so
            the thumbnail column can't stretch it out of square. */}
        {/* aspect-ratio via style: this project's @tailwindcss/aspect-ratio plugin disables
            Tailwind's own aspect-square utility. */}
        <div
          className={`relative w-full lg:w-auto lg:flex-1 lg:self-start rounded-2xl overflow-hidden bg-[var(--surface,#f5f5f4)] ${mainImageClassName}`}
          style={{ aspectRatio: "1 / 1" }}
        >
          <Image fill priority sizes="(max-width: 1024px) 100vw, 50vw" src={displayedImage} className="object-cover" alt={alt} />
          {canBrowse && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-slate-800 hover:bg-white"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-slate-800 hover:bg-white"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
              <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px]">
                {index + 1} / {all.length}
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

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
