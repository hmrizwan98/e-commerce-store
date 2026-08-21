"use client";

// @ts-ignore
import Glide from "@glidejs/glide/dist/glide.esm";
import Heading from "@/components/Heading/Heading";
import React, { FC, useRef, useState, useEffect } from "react";
import clientSayMain from "@/images/clientSayMain.png";
import clientSay1 from "@/images/clientSay1.png";
import clientSay2 from "@/images/clientSay2.png";
import clientSay3 from "@/images/clientSay3.png";
import clientSay4 from "@/images/clientSay4.png";
import clientSay5 from "@/images/clientSay5.png";
import clientSay6 from "@/images/clientSay6.png";
import quotationImg from "@/images/quotation.png";
import quotationImg2 from "@/images/quotation2.png";
import { StarIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { DEMO_DATA } from "./data";
import { safeImageSrc } from "@/utils/safeImageSrc";

export interface SectionClientSayItem {
  id: string | number;
  clientName: string;
  content: string;
  rating?: number;
  image?: string;
  designation?: string;
  company?: string;
  country?: string;
}

export interface SectionClientSayProps {
  className?: string;
  heading?: string;
  subHeading?: string;
  data?: SectionClientSayItem[];
}

const SectionClientSay: FC<SectionClientSayProps> = ({
  className = "",
  heading,
  subHeading,
  data,
}) => {
  const testimonials = data?.length ? data : DEMO_DATA;
  const sliderRef = useRef(null);

  const [isShow, setIsShow] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const OPTIONS: Partial<Glide.Options> = {
      perView: 1,
    };

    if (!sliderRef.current) return;

    let slider = new Glide(sliderRef.current, OPTIONS);
    
    const updateIndex = () => {
      if (typeof slider.index === "number") {
        setActiveIndex(slider.index);
      }
    };

    slider.on("run.after", updateIndex);
    slider.on("move", updateIndex);
    slider.mount();
    setIsShow(true);

    return () => {
      slider.destroy();
    };
  }, [sliderRef]);

  const currentItem = testimonials[activeIndex] || testimonials[0];
  const currentAvatarSrc = currentItem?.image ? safeImageSrc(currentItem.image) : null;

  // Extract uploaded satellite images from list for surrounding circles
  const customerAvatars = testimonials.map((t) => (t.image ? safeImageSrc(t.image) : null)).filter(Boolean);

  const renderBg = () => {
    const staticSatellites = [clientSay1, clientSay2, clientSay3, clientSay4, clientSay5, clientSay6];
    
    return (
      <div className="hidden md:block">
        {[
          { posClass: "top-9 -left-20", defaultImg: clientSay1, idx: 0 },
          { posClass: "bottom-[100px] right-full mr-40", defaultImg: clientSay2, idx: 1 },
          { posClass: "top-full left-[140px]", defaultImg: clientSay3, idx: 2 },
          { posClass: "-bottom-10 right-[140px]", defaultImg: clientSay4, idx: 3 },
          { posClass: "left-full ml-32 bottom-[80px]", defaultImg: clientSay5, idx: 4 },
          { posClass: "-right-10 top-10", defaultImg: clientSay6, idx: 5 },
        ].map((sat, i) => {
          const customSrc = customerAvatars[i];
          return (
            <div
              key={i}
              className={`absolute ${sat.posClass} w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-neutral-800 shadow-md transition-all duration-300 hover:scale-110`}
            >
              {customSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customSrc} alt="" className="w-full h-full object-cover" />
              ) : (
                <Image sizes="100px" src={sat.defaultImg} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`nc-SectionClientSay relative flow-root ${className} `}
      data-nc-id="SectionClientSay"
    >
      <Heading rightDescText={subHeading ?? "HAPPY CUSTOMERS"} isCenter>
        {heading ?? "What People Are Saying"}
      </Heading>
      <div className="relative md:mb-16 max-w-2xl mx-auto">
        {renderBg()}

        {/* Hero Main Center Avatar */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-1 shadow-xl animate-pulse opacity-80" />
          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-800 shadow-lg">
            {currentAvatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={currentAvatarSrc}
                src={currentAvatarSrc}
                alt={currentItem?.clientName || "Customer"}
                className="w-full h-full object-cover transition-all duration-500 ease-out"
              />
            ) : (
              <Image
                src={clientSayMain}
                alt="Customer"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        <div
          ref={sliderRef}
          className={`mt-8 relative ${isShow ? "" : "invisible"}`}
        >
          <Image
            className="opacity-50 md:opacity-100 absolute -mr-16 lg:mr-3 right-full top-1"
            src={quotationImg}
            alt=""
          />
          <Image
            className="opacity-50 md:opacity-100 absolute -ml-16 lg:ml-3 left-full top-1"
            src={quotationImg2}
            alt=""
          />
          <div className="glide__track " data-glide-el="track">
            <ul className="glide__slides ">
              {testimonials.map((item) => {
                const rating = item.rating ?? 5;
                const meta = [item.designation, item.company, item.country].filter(Boolean).join(" · ");
                return (
                  <li
                    key={item.id}
                    className="glide__slide flex flex-col items-center text-center"
                  >
                    <span className="block text-xl sm:text-2xl font-medium leading-relaxed max-w-xl mx-auto">
                      &ldquo;{item.content}&rdquo;
                    </span>
                    <span className="block mt-6 text-xl sm:text-2xl font-bold">
                      {item.clientName}
                    </span>
                    {meta && (
                      <span className="block mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">{meta}</span>
                    )}
                    <div className="flex items-center space-x-1 mt-3 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`w-5 h-5 ${star > rating ? "text-neutral-300 dark:text-neutral-700" : ""}`}
                        />
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div
            className="mt-8 glide__bullets flex items-center justify-center"
            data-glide-el="controls[nav]"
          >
            {testimonials.map((item, index) => (
              <button
                key={item.id}
                className={`glide__bullet w-2.5 h-2.5 rounded-full mx-1 focus:outline-none transition-all ${
                  index === activeIndex
                    ? "bg-indigo-600 w-6"
                    : "bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400"
                }`}
                data-glide-dir={`=${index}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionClientSay;
