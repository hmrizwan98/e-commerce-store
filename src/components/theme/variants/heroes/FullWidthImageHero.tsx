"use client";

import React, { FC, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useInterval from "react-use/lib/useInterval";
import useBoolean from "react-use/lib/useBoolean";
import Next from "@/shared/NextPrev/Next";
import Prev from "@/shared/NextPrev/Prev";
import type { Hero2DataType } from "@/components/SectionHero/data";
import type { ThemeBanner } from "@/types/theme";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { getObjectPositionClass } from "@/lib/banners/position";

export interface FullWidthImageHeroProps {
  className?: string;
  data?: Hero2DataType[];
  banner?: ThemeBanner;
}

let TIME_OUT: NodeJS.Timeout | null = null;

const FullWidthImageHero: FC<FullWidthImageHeroProps> = ({
  className = "",
  data: DATA = [],
  banner,
}) => {
  const [indexActive, setIndexActive] = useState(0);
  const [isRunning, toggleIsRunning] = useBoolean(true);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // The merchant's own slides only (Store Admin → Hero Slides) - no demo slides, no stock photos.
  const slides = DATA.filter((item) => {
    const raw = typeof item.image === "string" ? item.image : (item.image as any)?.src;
    return Boolean(raw);
  });

  useInterval(
    () => {
      handleAutoNext();
    },
    isRunning && slides.length > 1 ? 5000 : null
  );

  const handleAutoNext = () => {
    setIndexActive((state) => (state >= slides.length - 1 ? 0 : state + 1));
  };

  const handleClickNext = () => {
    setIndexActive((state) => (state >= slides.length - 1 ? 0 : state + 1));
    handleAfterClick();
  };

  const handleClickPrev = () => {
    setIndexActive((state) => (state === 0 ? slides.length - 1 : state - 1));
    handleAfterClick();
  };

  const handleAfterClick = () => {
    toggleIsRunning(false);
    if (TIME_OUT) {
      clearTimeout(TIME_OUT);
    }
    TIME_OUT = setTimeout(() => {
      toggleIsRunning(true);
    }, 1500);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        handleClickNext();
      } else {
        handleClickPrev();
      }
    }
  };

  if (!slides.length) {
    return null;
  }

  const heightPx = banner?.heightPx ?? 480;
  const fit = banner?.imageFit ?? "full";
  const rounded = banner?.rounded === true;
  // "cover": fixed height (merchant's Banner Height), crops to fill. "full": no fixed height -
  // all slides share one grid cell and the banner is as tall as the tallest image, so the whole
  // image is visible (it used to crop text that is part of the banner image).
  const hasAnyMobileImage = slides.some((s) => Boolean(s.imageMobile));
  const coverContainerClass = hasAnyMobileImage
    ? "h-[400px] sm:h-[460px] md:h-[var(--hero-h-desktop,500px)]"
    : "aspect-[16/9] sm:aspect-[21/9] md:aspect-auto md:h-[var(--hero-h-desktop,500px)] min-h-[220px]";

  const renderImage = (src: string, extraClass: string, sizes: string, index: number, alt: string, bgPosClass: string) =>
    fit === "cover" ? (
      <Image
        fill
        sizes={sizes}
        className={`${extraClass} w-full h-full object-cover ${bgPosClass}`}
        src={src}
        alt={alt}
        priority={index === 0}
        loading={index === 0 ? "eager" : "lazy"}
        fetchPriority={index === 0 ? "high" : "low"}
      />
    ) : (
      <Image
        width={0}
        height={0}
        sizes={sizes}
        style={{ width: "100%", height: "auto" }}
        className={`${extraClass} block`}
        src={src}
        alt={alt}
        priority={index === 0}
        loading={index === 0 ? "eager" : "lazy"}
        fetchPriority={index === 0 ? "high" : "low"}
      />
    );

  return (
    <div className={rounded ? "container" : ""}>
    <div
      className={`relative w-full overflow-hidden group select-none ${
        rounded ? "rounded-2xl md:rounded-3xl" : ""
      } ${fit === "cover" ? "bg-slate-900" : ""} ${className}`}
      style={{
        ["--hero-h-desktop" as any]: `${heightPx}px`,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div className={fit === "cover" ? `relative w-full ${coverContainerClass} overflow-hidden` : "grid w-full"}>
        {slides.map((item, index) => {
          const isActive = indexActive === index;
          const rawDesktop = typeof item.image === "string" ? item.image : (item.image as any)?.src;
          const desktopSrc = safeImageSrc(rawDesktop);
          const rawMobile = item.imageMobile;
          const mobileSrc = rawMobile ? safeImageSrc(rawMobile) : null;
          const href = item.btnLink || (item as any).href || undefined;
          const bgPosClass = getObjectPositionClass(item.backgroundPosition);
          const alt = item.heading || "Hero slide";

          const content = mobileSrc ? (
            <>
              {/* Phones (< md): the dedicated mobile image; tablet/desktop: the desktop image. */}
              {renderImage(mobileSrc, "md:hidden", "(max-width: 768px) 100vw, 1px", index, alt, bgPosClass)}
              {renderImage(desktopSrc, "hidden md:block", "100vw", index, alt, bgPosClass)}
            </>
          ) : (
            renderImage(desktopSrc, "", "100vw", index, alt, bgPosClass)
          );

          const slideClass =
            fit === "cover"
              ? `absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                  isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0 pointer-events-none"
                }`
              : `[grid-area:1/1] self-center w-full transition-opacity duration-700 ease-in-out ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`;

          return (
            <div key={(item as any).id ?? index} className={slideClass} aria-hidden={!isActive}>
              {href ? (
                <Link href={href} className={`block w-full relative cursor-pointer ${fit === "cover" ? "h-full" : ""}`} tabIndex={isActive ? 0 : -1}>
                  {content}
                </Link>
              ) : (
                <div className={`w-full relative ${fit === "cover" ? "h-full" : ""}`}>
                  {content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (Shown if > 1 slide) */}
      {slides.length > 1 && (
        <>
          <Prev
            className="absolute start-2 sm:start-5 top-1/2 -translate-y-1/2 z-20 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            btnClassName="w-8 h-8 sm:w-11 sm:h-11 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-900 shadow-md"
            svgSize="w-4 h-4 sm:w-5 sm:h-5"
            onClickPrev={handleClickPrev}
          />
          <Next
            className="absolute end-2 sm:end-5 top-1/2 -translate-y-1/2 z-20 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            btnClassName="w-8 h-8 sm:w-11 sm:h-11 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-900 shadow-md"
            svgSize="w-4 h-4 sm:w-5 sm:h-5"
            onClickNext={handleClickNext}
          />

          {/* Bottom Pagination Dots */}
          <div className="absolute bottom-3 sm:bottom-4 inset-x-0 z-20 flex justify-center items-center gap-1.5 sm:gap-2">
            {slides.map((_, index) => {
              const isActive = indexActive === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setIndexActive(index);
                    handleAfterClick();
                  }}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-6 sm:w-8 bg-white shadow-md"
                      : "w-2 sm:w-2.5 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
    </div>
  );
};

export default FullWidthImageHero;
