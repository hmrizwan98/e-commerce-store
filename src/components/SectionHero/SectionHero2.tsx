"use client";

import React, { FC, useState } from "react";
import backgroundLineSvg from "@/images/Moon.svg";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Next from "@/shared/NextPrev/Next";
import Prev from "@/shared/NextPrev/Prev";
import useInterval from "react-use/lib/useInterval";
import useBoolean from "react-use/lib/useBoolean";
import Image from "next/image";
import { HERO2_DEMO_DATA, Hero2DataType } from "./data";
import { safeImageSrc } from "@/utils/safeImageSrc";

export interface SectionHero2Props {
  className?: string;
  data?: Hero2DataType[];
}

let TIME_OUT: NodeJS.Timeout | null = null;

const SectionHero2: FC<SectionHero2Props> = ({
  className = "",
  data: DATA = HERO2_DEMO_DATA,
}) => {
  // =================
  const [indexActive, setIndexActive] = useState(0);
  const [isRunning, toggleIsRunning] = useBoolean(true);

  useInterval(
    () => {
      handleAutoNext();
    },
    isRunning ? 5500 : null
  );
  //

  const handleAutoNext = () => {
    setIndexActive((state) => {
      if (state >= DATA.length - 1) {
        return 0;
      }
      return state + 1;
    });
  };

  const handleClickNext = () => {
    setIndexActive((state) => {
      if (state >= DATA.length - 1) {
        return 0;
      }
      return state + 1;
    });
    handleAfterClick();
  };

  const handleClickPrev = () => {
    setIndexActive((state) => {
      if (state === 0) {
        return DATA.length - 1;
      }
      return state - 1;
    });
    handleAfterClick();
  };

  const handleAfterClick = () => {
    toggleIsRunning(false);
    if (TIME_OUT) {
      clearTimeout(TIME_OUT);
    }
    TIME_OUT = setTimeout(() => {
      toggleIsRunning(true);
    }, 1000);
  };
  // =================

  const renderItem = (index: number) => {
    const isActive = indexActive === index;
    const item = DATA[index];
    if (!isActive) {
      return null;
    }
    const textAlign = item.textAlign ?? "left";
    const alignClass = textAlign === "center" ? "items-center text-center mx-auto" : textAlign === "right" ? "items-end text-end ms-auto" : "";
    const overlayOpacity = item.overlayOpacity ?? 0;
    return (
      <div
        className={`nc-SectionHero2Item ${item.animation !== "none" ? "nc-SectionHero2Item--animation" : ""} flex flex-col-reverse lg:flex-col relative overflow-hidden ${className}`}
        key={index}
      >
        <div className="absolute bottom-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 z-20 flex justify-center">
          {DATA.map((_, index) => {
            const isActive = indexActive === index;
            return (
              <div
                key={index}
                onClick={() => {
                  setIndexActive(index);
                  handleAfterClick();
                }}
                className={`relative px-1 py-1.5 cursor-pointer`}
              >
                <div
                  className={`relative w-20 h-1 shadow-sm rounded-md bg-white`}
                >
                  {isActive && (
                    <div
                      className={`nc-SectionHero2Item__dot absolute inset-0 bg-slate-900 rounded-md ${
                        isActive ? " " : " "
                      }`}
                    ></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Prev
          className="absolute start-1 sm:start-5 top-3/4 sm:top-1/2 sm:-translate-y-1/2 z-10 !text-slate-700"
          btnClassName="w-12 h-12 hover:border-slate-400 dark:hover:border-slate-400"
          svgSize="w-6 h-6"
          onClickPrev={handleClickPrev}
        />
        <Next
          className="absolute end-1 sm:end-5 top-3/4 sm:top-1/2 sm:-translate-y-1/2 z-10 !text-slate-700"
          btnClassName="w-12 h-12 hover:border-slate-400 dark:hover:border-slate-400"
          svgSize="w-6 h-6"
          onClickNext={handleClickNext}
        />

        {/* BG */}
        <div className="absolute inset-0 bg-[#E3FFE6]">
          {/* Local decorative SVG - plain img, not next/image (which blocks SVG optimization by default). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="absolute inset-0 w-full h-full object-contain"
            src={backgroundLineSvg.src}
            alt=""
          />
        </div>

        {item.overlayColor && overlayOpacity > 0 && (
          <div
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{ backgroundColor: item.overlayColor, opacity: overlayOpacity }}
          />
        )}

        <div className="relative container pb-0 pt-14 sm:pt-20 lg:py-44">
          <div
            className={`relative z-[1] w-full max-w-3xl space-y-8 sm:space-y-14 nc-SectionHero2Item__left flex flex-col ${alignClass}`}
          >
            <div className="space-y-5 sm:space-y-6" style={item.textColor ? { color: item.textColor } : undefined}>
              {item.badgeText && (
                <span className="inline-block px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold tracking-wide">
                  {item.badgeText}
                </span>
              )}
              <span className="nc-SectionHero2Item__subheading block text-base md:text-xl text-slate-700 font-medium">
                {item.subHeading}
              </span>
              <h2 className="nc-SectionHero2Item__heading font-semibold text-3xl sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl !leading-[114%] text-slate-900">
                {item.heading}
              </h2>
              {item.description && (
                <p className="text-slate-700 text-base md:text-lg max-w-xl">{item.description}</p>
              )}
              {(item.offerText || item.discountText) && (
                <div className="flex flex-wrap items-center gap-3">
                  {item.discountText && (
                    <span className="text-lg md:text-xl font-bold text-primary-700">{item.discountText}</span>
                  )}
                  {item.offerText && <span className="text-sm md:text-base text-slate-600">{item.offerText}</span>}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <ButtonPrimary
                className="nc-SectionHero2Item__button dark:bg-slate-900"
                sizeClass="py-3 px-6 sm:py-5 sm:px-9"
                href={item.btnLink}
              >
                <span>{item.btnText}</span>
                <span>
                  <svg className="w-5 h-5 ms-2.5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 22L20 20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </ButtonPrimary>
              {item.btnText2 && item.btnLink2 && (
                <ButtonPrimary
                  className="!bg-transparent !text-slate-900 border border-slate-900 dark:!text-white dark:border-white"
                  sizeClass="py-3 px-6 sm:py-5 sm:px-9"
                  href={item.btnLink2}
                >
                  <span>{item.btnText2}</span>
                </ButtonPrimary>
              )}
            </div>
          </div>
          <div className="mt-10 lg:mt-0 lg:absolute end-0 rtl:-end-28 bottom-0 top-0 w-full max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
            <Image
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-full object-contain object-right-bottom nc-SectionHero2Item__image"
              src={typeof item.image === "string" ? safeImageSrc(item.image) : item.image}
              alt={item.heading}
              priority
            />
          </div>
        </div>
      </div>
    );
  };

  return <>{DATA.map((_, index) => renderItem(index))}</>;
};

export default SectionHero2;
