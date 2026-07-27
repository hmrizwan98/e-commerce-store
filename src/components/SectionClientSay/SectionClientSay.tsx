"use client";

// @ts-ignore
import Glide from "@glidejs/glide/dist/glide.esm";
import Heading from "@/components/Heading/Heading";
import React, { FC, useId, useRef, useState } from "react";
import { useEffect } from "react";
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
  data?: SectionClientSayItem[];
}

const SectionClientSay: FC<SectionClientSayProps> = ({ className = "", data }) => {
  const testimonials = data?.length ? data : DEMO_DATA;
  const sliderRef = useRef(null);

  const [isShow, setIsShow] = useState(false);

  useEffect(() => {
    const OPTIONS: Partial<Glide.Options> = {
      perView: 1,
    };

    if (!sliderRef.current) return;

    let slider = new Glide(sliderRef.current, OPTIONS);
    slider.mount();
    setIsShow(true);
    return () => {
      slider.destroy();
    };
  }, [sliderRef]);

  const renderBg = () => {
    return (
      <div className="hidden md:block">
        <Image
          sizes="100px"
          className="absolute top-9 -left-20"
          src={clientSay1}
          alt=""
        />
        <Image
          sizes="100px"
          className="absolute bottom-[100px] right-full mr-40"
          src={clientSay2}
          alt=""
        />
        <Image
          sizes="100px"
          className="absolute top-full left-[140px]"
          src={clientSay3}
          alt=""
        />
        <Image
          sizes="100px"
          className="absolute -bottom-10 right-[140px]"
          src={clientSay4}
          alt=""
        />
        <Image
          sizes="100px"
          className="absolute left-full ml-32 bottom-[80px]"
          src={clientSay5}
          alt=""
        />
        <Image
          sizes="100px"
          className="absolute -right-10 top-10 "
          src={clientSay6}
          alt=""
        />
      </div>
    );
  };

  return (
    <div
      className={`nc-SectionClientSay relative flow-root ${className} `}
      data-nc-id="SectionClientSay"
    >
      <Heading desc="Let's see what people think of Ciseco" isCenter>
        Good news from far away 🥇
      </Heading>
      <div className="relative md:mb-16 max-w-2xl mx-auto">
        {renderBg()}

        <Image className="mx-auto" src={clientSayMain} alt="" />
        <div
          ref={sliderRef}
          className={`mt-12 lg:mt-16 relative ${isShow ? "" : "invisible"}`}
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
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={safeImageSrc(item.image)}
                        alt={item.clientName}
                        className="w-16 h-16 rounded-full object-cover mb-5 border-2 border-white dark:border-neutral-800 shadow-sm"
                      />
                    )}
                    <span className="block text-2xl">{item.content}</span>
                    <span className="block mt-8 text-2xl font-semibold">
                      {item.clientName}
                    </span>
                    {meta && (
                      <span className="block mt-1 text-sm text-neutral-500">{meta}</span>
                    )}
                    <div className="flex items-center space-x-0.5 mt-3.5 text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`w-6 h-6 ${star > rating ? "text-neutral-300 dark:text-neutral-700" : ""}`}
                        />
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div
            className="mt-10 glide__bullets flex items-center justify-center"
            data-glide-el="controls[nav]"
          >
            {testimonials.map((item, index) => (
              <button
                key={item.id}
                className="glide__bullet w-2 h-2 rounded-full bg-neutral-300 mx-1 focus:outline-none"
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
