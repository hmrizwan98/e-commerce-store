import React, { FC } from "react";
import NcImage from "@/shared/NcImage/NcImage";
import explore1Svg from "@/images/collections/explore1.svg";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { StaticImageData } from "next/image";
import Link from "next/link";
import { safeImageSrc } from "@/utils/safeImageSrc";

export interface CardCategory4Props {
  id?: string | number;
  className?: string;
  featuredImage?: StaticImageData | string;
  bgSVG?: any;
  name: string;
  desc?: string;
  color?: string;
  count?: number;
}

const CardCategory4: FC<CardCategory4Props> = ({
  id,
  className = "",
  featuredImage = ".",
  bgSVG = explore1Svg,
  name,
  desc,
  color = "bg-rose-50",
  count,
}) => {
  const collectionHref = id ? (`/collection/${id}` as any) : "/collection";
  const bgSvgSrc =
    typeof bgSVG === "string"
      ? bgSVG
      : (bgSVG as { src: string })?.src ?? (explore1Svg as { src: string })?.src ?? explore1Svg;

  return (
    <div
      className={`nc-CardCategory4 relative w-full aspect-w-12 aspect-h-11 h-0 rounded-3xl overflow-hidden bg-white dark:bg-neutral-900 group hover:nc-shadow-lg transition-shadow ${className}`}
    >
      <div>
        {/* Decorative Background Vector Image */}
        <div className="absolute bottom-0 right-0 max-w-[280px] opacity-80 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bgSvgSrc} alt="" className="w-full h-full object-contain" />
        </div>

        <div className="absolute inset-5 sm:inset-8 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <NcImage
              alt={name}
              src={typeof featuredImage === "string" ? safeImageSrc(featuredImage) : featuredImage}
              containerClassName={`w-20 h-20 rounded-full overflow-hidden z-0 ${color}`}
              width={80}
              height={80}
            />
            {count != null && (
              <span className="text-xs text-slate-700 dark:text-neutral-300 font-medium">
                {count} products
              </span>
            )}
          </div>

          <div>
            {desc && (
              <span className="block mb-2 text-sm text-slate-500 dark:text-slate-400">
                {desc}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100">{name}</h2>
          </div>

          <Link
            href={collectionHref}
            className="flex items-center text-sm font-medium group-hover:text-primary-500 transition-colors"
          >
            <span>See Collection</span>
            <ArrowRightIcon className="w-4 h-4 ml-2.5" />
          </Link>
        </div>
      </div>

      <Link href={collectionHref} className="absolute inset-0 z-10"></Link>
    </div>
  );
};

export default CardCategory4;
