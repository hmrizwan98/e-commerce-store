import React, { FC } from "react";
import { StaticImageData } from "next/image";
import NcImage from "@/shared/NcImage/NcImage";
import { safeImageSrc } from "@/utils/safeImageSrc";

export interface HowItWorkItem {
  id: number | string;
  img?: StaticImageData | string;
  imgDark?: StaticImageData | string;
  icon?: string;
  title?: string;
  desc?: string;
  badge?: string;
}

export interface SectionHowItWorkProps {
  className?: string;
  data?: HowItWorkItem[];
}


const SectionHowItWork: FC<SectionHowItWorkProps> = ({
  className = "",
  data = [],
}) => {
  // The merchant's own steps (Customizer → How It Works) only; none -> nothing rendered.
  const itemList = data;
  const count = itemList.length;

  // Compute dynamic grid layout classes based on item count
  const getGridClass = () => {
    if (count === 1) return "grid-cols-1 max-w-md mx-auto";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-6 sm:gap-10";
    if (count === 3) return "grid-cols-1 sm:grid-cols-3 max-w-5xl mx-auto gap-6 sm:gap-10";
    if (count === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8";
    if (count === 5) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-5 sm:gap-6";
  };

  if (!itemList.length) return null;

  return (
    <div className={`nc-SectionHowItWork relative ${className}`}>
      <div className={`grid ${getGridClass()} relative z-10`}>
        {itemList.map((item: HowItWorkItem, index: number) => {
          const imgSrc = item.img ? (typeof item.img === "string" ? safeImageSrc(item.img) : item.img) : null;
          const hasBadge = Boolean(item.badge && item.badge.trim() !== "");

          return (
            <div
              key={item.id ?? index}
              className="relative flex flex-col items-center p-4 sm:p-5 group text-center transition-all duration-300"
            >
              {/* Optional Custom Step Badge */}
              {hasBadge && (
                <span className="mb-4 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60">
                  {item.badge}
                </span>
              )}

              {/* Image / Icon Container (Clean, no card border) */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-4 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                {imgSrc ? (
                  <NcImage
                    containerClassName="w-full h-full flex items-center justify-center"
                    className="object-contain w-full h-full"
                    src={imgSrc}
                    sizes="250px"
                    alt={item.title ?? `Step ${index + 1}`}
                  />
                ) : item.icon ? (
                  <span className="text-6xl">{item.icon}</span>
                ) : (
                  <span className="text-5xl">✨</span>
                )}
              </div>

              {/* Text Area */}
              <div className="flex flex-col flex-1 justify-between max-w-xs">
                <div>
                  {item.title && (
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5 leading-snug">
                      {item.title}
                    </h3>
                  )}
                  {item.desc && (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionHowItWork;
