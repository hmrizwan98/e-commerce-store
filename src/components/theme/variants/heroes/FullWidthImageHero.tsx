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
  const mobileHeightPx = banner?.mobileHeightPx;
  const fit = banner?.imageFit ?? "full";
  const rounded = banner?.rounded === true;
  const isCover = fit === "cover";
  const hasAnyMobileImage = slides.some((s) => Boolean(s.imageMobile));

  // Single slide default mode: keeps native aspect ratio without forcing container height
  const isNaturalSingleSlide = slides.length === 1 && !isCover && !banner?.heightPx && !banner?.mobileHeightPx;

  // Responsive container height classes:
  // - On desktop: md:h-[var(--hero-h-desktop,480px)]
  // - On mobile: custom mobileHeightPx or adaptive heights
  const mobileHeightClass = mobileHeightPx
    ? "h-[var(--hero-h-mobile)]"
    : hasAnyMobileImage
    ? "h-[400px] sm:h-[460px]"
    : isCover
    ? "aspect-[16/9] sm:aspect-[21/9]"
    : "h-[320px] sm:h-[400px]";

  const containerHeightClass = isNaturalSingleSlide
    ? "w-full"
    : `relative w-full overflow-hidden ${mobileHeightClass} md:aspect-auto md:h-[var(--hero-h-desktop,480px)] min-h-[240px]`;

  const renderSlideContent = (
    src: string,
    extraClass: string,
    sizes: string,
    index: number,
    alt: string,
    bgPosClass: string
  ) => {
    if (isNaturalSingleSlide) {
      return (
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
    }

    if (isCover) {
      return (
        <div className={`relative w-full h-full overflow-hidden ${extraClass}`}>
          <Image
            fill
            sizes={sizes}
            className={`w-full h-full object-cover ${bgPosClass}`}
            src={src}
            alt={alt}
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "low"}
          />
        </div>
      );
    }

    // Contain Mode: Complete image uncropped + ambient color-matched background so no gaps
    return (
      <div className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950/80 ${extraClass}`}>
        {/* Ambient blurred backdrop fills aspect differences seamlessly */}
        <Image
          fill
          sizes="10vw"
          className="w-full h-full object-cover scale-110 blur-2xl opacity-35 dark:opacity-25 pointer-events-none select-none filter"
          src={src}
          alt=""
          aria-hidden="true"
        />
        {/* Uncropped, unstretched full image */}
        <div className="relative w-full h-full flex items-center justify-center z-[2]">
          <Image
            fill
            sizes={sizes}
            className={`w-full h-full object-contain ${bgPosClass} drop-shadow-md`}
            src={src}
            alt={alt}
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "low"}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={rounded ? "container" : ""}>
      <div
        className={`relative w-full overflow-hidden group select-none ${
          rounded ? "rounded-2xl md:rounded-3xl" : ""
        } ${isNaturalSingleSlide ? "" : "bg-slate-900"} ${className}`}
        style={{
          ["--hero-h-desktop" as any]: `${heightPx}px`,
          ["--hero-h-mobile" as any]: mobileHeightPx ? `${mobileHeightPx}px` : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides Container */}
        <div className={containerHeightClass}>
          {slides.map((item, index) => {
            const isActive = indexActive === index;
            const rawDesktop = typeof item.image === "string" ? item.image : (item.image as any)?.src;
            const desktopSrc = safeImageSrc(rawDesktop);
            const rawMobile = item.imageMobile;
            const mobileSrc = rawMobile ? safeImageSrc(rawMobile) : null;
            const href = item.btnLink || (item as any).href || undefined;
            const bgPosClass = getObjectPositionClass(item.backgroundPosition || banner?.imagePosition);
            const alt = item.heading || "Hero slide";

            const content = mobileSrc ? (
              <>
                {/* Phones (< md): dedicated mobile image */}
                {renderSlideContent(mobileSrc, "md:hidden", "(max-width: 768px) 100vw, 1px", index, alt, bgPosClass)}
                {/* Tablet / Desktop (>= md): desktop image */}
                {renderSlideContent(desktopSrc, "hidden md:block", "100vw", index, alt, bgPosClass)}
              </>
            ) : (
              renderSlideContent(desktopSrc, "block", "100vw", index, alt, bgPosClass)
            );

            const slideClass = isNaturalSingleSlide
              ? `[grid-area:1/1] self-center w-full transition-opacity duration-700 ease-in-out ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`
              : `absolute inset-0 w-full h-full [grid-area:1/1] transition-opacity duration-700 ease-in-out ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`;

            return (
              <div key={(item as any).id ?? index} className={slideClass} aria-hidden={!isActive}>
                {href ? (
                  <Link
                    href={href}
                    className={`block w-full h-full relative cursor-pointer`}
                    tabIndex={isActive ? 0 : -1}
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="w-full h-full relative">{content}</div>
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
