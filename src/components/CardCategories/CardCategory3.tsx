import React, { FC } from "react";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Link from "next/link";
import { getTenantHref } from "@/utils/getTenantHref";
import { StaticImageData } from "next/image";
import type { Route } from "next";
import { CATS_DISCOVER } from "./data";
import { safeImageSrc } from "@/utils/safeImageSrc";
import { useAutoImageColor } from "@/utils/useAutoImageColor";
import NcImage from "@/shared/NcImage/NcImage";

export interface CardCategory3Props {
  className?: string;
  featuredImage?: StaticImageData | string;
  name?: string;
  desc?: string;
  color?: string;
  href?: string;
  btnText?: string;
  showBtn?: boolean;
}

const CardCategory3: FC<CardCategory3Props> = ({
  className = "",
  featuredImage = CATS_DISCOVER[2].featuredImage,
  name = CATS_DISCOVER[2].name,
  desc = CATS_DISCOVER[2].desc,
  color,
  href = "/collection",
  btnText = "Show me all",
  showBtn = true,
}) => {
  const imageSrcStr = typeof featuredImage === "string" ? featuredImage : (featuredImage as any)?.src;
  const autoColor = useAutoImageColor(imageSrcStr, color, name);

  return (
    <Link
      href={getTenantHref(href || "/collection") as Route}
      className={`nc-CardCategory3 block ${className}`}
    >
      <div
        style={autoColor.style}
        className={`relative w-full aspect-w-16 aspect-h-12 sm:aspect-h-10 h-0 rounded-2xl overflow-hidden group transition-colors duration-300 ${autoColor.className}`}
      >
        <div>
          <div className="absolute inset-4 sm:inset-6">
            <NcImage
              alt={name || "Discover card"}
              src={typeof featuredImage === "string" ? safeImageSrc(featuredImage) : featuredImage ?? safeImageSrc()}
              containerClassName="absolute end-0 w-1/2 max-w-[260px] h-full"
              className="object-contain w-full h-full drop-shadow-xl"
            />
          </div>
        </div>
        <span className="opacity-0 group-hover:opacity-40 absolute inset-0 bg-black/10 transition-opacity"></span>

        <div>
          <div className="absolute inset-4 sm:inset-6 flex flex-col justify-between">
            <div className="max-w-[55%] sm:max-w-[50%] pr-2 z-10">
              <span className={`block mb-1 text-xs sm:text-sm text-slate-700 font-medium truncate`}>
                {name}
              </span>
              {desc && (
                <h2
                  className={`text-base sm:text-lg lg:text-xl text-slate-900 font-bold leading-tight line-clamp-2`}
                  dangerouslySetInnerHTML={{ __html: desc }}
                ></h2>
              )}
            </div>
            {showBtn !== false && (
              <div className="mt-auto pt-2 z-10">
                <ButtonSecondary
                  sizeClass="py-2 px-3.5 sm:py-2.5 sm:px-5"
                  fontSize="text-xs sm:text-sm font-semibold"
                  className="nc-shadow-lg"
                >
                  {btnText || "Show me all"}
                </ButtonSecondary>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CardCategory3;
