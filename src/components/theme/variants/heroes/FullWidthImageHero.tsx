"use client";

import React, { FC, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useInterval from "react-use/lib/useInterval";
import useBoolean from "react-use/lib/useBoolean";
import Next from "@/shared/NextPrev/Next";
import Prev from "@/shared/NextPrev/Prev";
import type { Hero2DataType } from "@/components/SectionHero/data";
import type { ThemeBanner } from "@/types/theme";
import { safeImageSrc } from "@/utils/safeImageSrc";

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

  const slides = DATA.length > 0 ? DATA : [];

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

  if (!slides.length) {
    return null;
  }

  const heightPx = banner?.heightPx ?? 480;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 bg-slate-900 group ${className}`}
      style={{ minHeight: `${Math.min(heightPx, 300)}px` }}
    >
      {/* Slides Container */}
      <div className="relative w-full h-[260px] sm:h-[380px] md:h-[480px] lg:h-[560px] overflow-hidden">
        {slides.map((item, index) => {
          const isActive = indexActive === index;
          const imgSrc = typeof item.image === "string" ? safeImageSrc(item.image) : item.image;
          const href = item.btnLink || (item as any).href || undefined;

          return (
            <div
              key={(item as any).id ?? index}
              className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0 pointer-events-none"
              }`}
            >
              {href ? (
                <Link href={href} className="block w-full h-full relative cursor-pointer">
                  <Image
                    fill
                    sizes="100vw"
                    className="w-full h-full object-cover object-center"
                    src={imgSrc}
                    alt="Hero slide"
                    priority={index === 0}
                  />
                </Link>
              ) : (
                <div className="w-full h-full relative">
                  <Image
                    fill
                    sizes="100vw"
                    className="w-full h-full object-cover object-center"
                    src={imgSrc}
                    alt="Hero slide"
                    priority={index === 0}
                  />
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
            className="absolute start-3 sm:start-5 top-1/2 -translate-y-1/2 z-20 opacity-90 group-hover:opacity-100 transition-opacity"
            btnClassName="w-10 h-10 sm:w-12 sm:h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-900 shadow-md"
            svgSize="w-5 h-5 sm:w-6 sm:h-6"
            onClickPrev={handleClickPrev}
          />
          <Next
            className="absolute end-3 sm:end-5 top-1/2 -translate-y-1/2 z-20 opacity-90 group-hover:opacity-100 transition-opacity"
            btnClassName="w-10 h-10 sm:w-12 sm:h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-900 shadow-md"
            svgSize="w-5 h-5 sm:w-6 sm:h-6"
            onClickNext={handleClickNext}
          />

          {/* Bottom Pagination Dots */}
          <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center items-center gap-2">
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
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-8 bg-white shadow-md"
                      : "w-2.5 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default FullWidthImageHero;
