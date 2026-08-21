'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Heading from './Heading/Heading';
import CardCategory3 from './CardCategories/CardCategory3';
// @ts-ignore
import Glide from '@glidejs/glide/dist/glide.esm';
import { CATS_DISCOVER } from './CardCategories/data';

export interface DiscoverMoreSliderProps {
  heading?: string;
  rightDescText?: string;
  data?: {
    name: string;
    desc: string;
    featuredImage: string;
    color?: string;
    href?: string;
    btnText?: string;
    showBtn?: boolean;
  }[];
}

const DiscoverMoreSlider: React.FC<DiscoverMoreSliderProps> = ({
  heading = 'Discover more',
  rightDescText = 'Good things are waiting for you',
  data,
}) => {
  const sliderRef = useRef(null);

  const [isShow, setIsShow] = useState(false);

  useEffect(() => {
    const OPTIONS: Partial<Glide.Options> = {
      // direction: document.querySelector("html")?.getAttribute("dir") || "ltr",
      perView: 2.8,
      gap: 32,
      bound: true,
      breakpoints: {
        1280: {
          gap: 28,
          perView: 2.5,
        },
        1279: {
          gap: 20,
          perView: 2.15,
        },
        1023: {
          gap: 20,
          perView: 1.6,
        },
        768: {
          gap: 20,
          perView: 1.2,
        },
        500: {
          gap: 20,
          perView: 1,
        },
      },
    };
    if (!sliderRef.current) return;

    let slider = new Glide(sliderRef.current, OPTIONS);
    slider.mount();
    setIsShow(true);
    return () => {
      slider.destroy();
    };
  }, [sliderRef]);

  const items = data && data.length ? data : CATS_DISCOVER;

  return (
    <div
      ref={sliderRef}
      className={`nc-DiscoverMoreSlider nc-p-l-container ${
        isShow ? '' : 'invisible'
      }`}>
      <Heading
        className="mb-12 lg:mb-14 text-neutral-900 dark:text-neutral-50 nc-p-r-container "
        desc=""
        rightDescText={rightDescText}
        hasNextPrev>
        {heading}
      </Heading>
      <div className="" data-glide-el="track">
        <ul className="glide__slides">
          {items.map((item, index) => (
            <li key={index} className={`glide__slide`}>
              <CardCategory3
                name={item.name}
                desc={item.desc}
                featuredImage={item.featuredImage}
                color={item.color}
                href={item.href}
                btnText={item.btnText}
                showBtn={item.showBtn}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DiscoverMoreSlider;
