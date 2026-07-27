import React, { FC } from "react";
import { StaticImageData } from "next/image";
import NcImage from "@/shared/NcImage/NcImage";
import HIW1img from "@/images/HIW1img.png";
import HIW2img from "@/images/HIW2img.png";
import HIW3img from "@/images/HIW3img.png";
import HIW4img from "@/images/HIW4img.png";
import VectorImg from "@/images/VectorHIW.svg";
import Badge from "@/shared/Badge/Badge";
import { safeImageSrc } from "@/utils/safeImageSrc";

export interface HowItWorkItem {
  id: number | string;
  img?: StaticImageData | string;
  imgDark?: StaticImageData | string;
  /** Emoji/text icon shown in place of img/imgDark when no image is set. */
  icon?: string;
  title?: string;
  desc?: string;
}

export interface SectionHowItWorkProps {
  className?: string;
  data?: HowItWorkItem[];
}

const DEMO_DATA: HowItWorkItem[] = [
  {
    id: 1,
    img: HIW1img,
    imgDark: HIW1img,
    title: "Filter & Discover",
    desc: "Smart filtering and suggestions make it easy to find",
  },
  {
    id: 2,
    img: HIW2img,
    imgDark: HIW2img,
    title: "Add to bag",
    desc: "Easily select the correct items and add them to the cart",
  },
  {
    id: 3,
    img: HIW3img,
    imgDark: HIW3img,
    title: "Fast shipping",
    desc: "The carrier will confirm and ship quickly to you",
  },
  {
    id: 4,
    img: HIW4img,
    imgDark: HIW4img,
    title: "Enjoy the product",
    desc: "Have fun and enjoy your 5-star quality products",
  },
];

const SectionHowItWork: FC<SectionHowItWorkProps> = ({
  className = "",
  data = DEMO_DATA,
}) => {
  return (
    <div className={`nc-SectionHowItWork ${className}`}>
      <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-16 xl:gap-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="hidden md:block absolute inset-x-0 top-5 w-full"
          src={VectorImg.src}
          alt=""
        />
        {data.map((item: HowItWorkItem, index: number) => (
          <div
            key={item.id}
            className="relative flex flex-col items-center max-w-xs mx-auto"
          >
            {item.img ? (
              <NcImage
                containerClassName="mb-4 sm:mb-10 max-w-[140px] mx-auto"
                className="rounded-3xl"
                src={typeof item.img === "string" ? safeImageSrc(item.img) : item.img}
                sizes="150px"
                alt="HIW"
              />
            ) : item.icon ? (
              <div className="mb-4 sm:mb-10 max-w-[140px] h-[140px] mx-auto flex items-center justify-center text-6xl">
                {item.icon}
              </div>
            ) : null}
            <div className="text-center mt-auto space-y-5">
              <Badge
                name={`Step ${index + 1}`}
                color={
                  !index
                    ? "red"
                    : index === 1
                    ? "indigo"
                    : index === 2
                    ? "yellow"
                    : "purple"
                }
              />
              <h3 className="text-base font-semibold">{item.title}</h3>
              <span className="block text-slate-600 dark:text-slate-400 text-sm leading-6">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionHowItWork;
