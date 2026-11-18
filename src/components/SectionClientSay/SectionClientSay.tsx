"use client";

// @ts-ignore
import Glide from "@glidejs/glide/dist/glide.esm";
import Heading from "@/components/Heading/Heading";
import React, { FC, useRef, useState, useEffect } from "react";
import quotationImg from "@/images/quotation.png";
import quotationImg2 from "@/images/quotation2.png";
import { StarIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
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
  // Real, published testimonials only (seed samples are filtered out upstream); none -> nothing.
  const testimonials = data ?? [];
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

  // Floating avatars = only the real photos merchants uploaded for their testimonials
  // (they used to fall back to stock photos of people).
  const renderBg = () => {
    const positions = [
      "top-9 -left-20",
      "bottom-[100px] right-full mr-40",
      "top-full left-[140px]",
      "-bottom-10 right-[140px]",
      "left-full ml-32 bottom-[80px]",
      "-right-10 top-10",
    ];
    return (
      <div className="hidden md:block">
        {customerAvatars.slice(0, positions.length).map((src, i) => (
          <div
            key={i}
            className={`absolute ${positions[i]} w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-neutral-800 shadow-md transition-all duration-300 hover:scale-110`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src as string} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    );
  };

  if (!testimonials.length) return null;

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
              <span className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl font-semibold text-neutral-500 dark:text-neutral-300">
                {(currentItem?.clientName || "?").trim().charAt(0).toUpperCase()}
              </span>
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
                // Stars only when the merchant entered a rating (no assumed 5 stars).
                const rating = typeof item.rating === "number" ? Math.max(0, Math.min(5, item.rating)) : null;
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
                    {rating !== null && (
                      <div className="flex items-center space-x-1 mt-3 text-amber-400" aria-label={`${rating} out of 5`}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`w-5 h-5 ${star > rating ? "text-neutral-300 dark:text-neutral-700" : ""}`}
                          />
                        ))}
                      </div>
                    )}
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
