"use client";

import React, { FC, useState } from "react";
import CardCategory1 from "@/components/CardCategories/CardCategory1";
import CardCategory4 from "@/components/CardCategories/CardCategory4";
import Heading from "@/components/Heading/Heading";
import CardCategory6 from "@/components/CardCategories/CardCategory6";
import Nav from "@/shared/Nav/Nav";
import NavItem2 from "@/components/NavItem2";
import { DEMO_MORE_EXPLORE_DATA, ExploreType } from "./data";

import explore1Svg from "@/images/collections/explore1.svg";
import explore2Svg from "@/images/collections/explore2.svg";
import explore3Svg from "@/images/collections/explore3.svg";
import explore4Svg from "@/images/collections/explore4.svg";
import explore5Svg from "@/images/collections/explore5.svg";
import explore6Svg from "@/images/collections/explore6.svg";
import explore7Svg from "@/images/collections/explore7.svg";
import explore8Svg from "@/images/collections/explore8.svg";
import explore9Svg from "@/images/collections/explore9.svg";

const DECORATIVE_SVGS = [
  explore1Svg,
  explore2Svg,
  explore3Svg,
  explore9Svg,
  explore5Svg,
  explore6Svg,
  explore7Svg,
  explore8Svg,
  explore4Svg,
];

const DECORATIVE_COLORS = [
  "bg-indigo-50",
  "bg-slate-100/80",
  "bg-violet-50",
  "bg-orange-50",
  "bg-blue-50",
  "bg-rose-50",
  "bg-emerald-50",
  "bg-stone-100",
];

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase().trim();
  if (n === "all") {
    return `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>`;
  }
  if (n.includes("women") || n.includes("woman") || n.includes("female")) {
    return `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 16C15.866 16 19 12.866 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.866 8.13401 16 12 16Z"/><path d="M12 16V22"/><path d="M15 19H9"/></svg>`;
  }
  if (n.includes("man") || n.includes("men") || n.includes("male")) {
    return `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.25 21.5C14.5302 21.5 18 18.0302 18 13.75C18 9.46979 14.5302 6 10.25 6C5.96979 6 2.5 9.46979 2.5 13.75C2.5 18.0302 5.96979 21.5 10.25 21.5Z"/><path d="M21.5 2.5L16 8"/><path d="M15 2.5H21.5V9"/></svg>`;
  }
  if (n.includes("kid") || n.includes("child") || n.includes("baby")) {
    return `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21.08 8.58003V15.42C21.08 16.54 20.48 17.58 19.51 18.15L13.57 21.58C12.6 22.14 11.4 22.14 10.42 21.58L4.48003 18.15C3.51003 17.59 2.91003 16.55 2.91003 15.42V8.58003C2.91003 7.46003 3.51003 6.41999 4.48003 5.84999L10.42 2.42C11.39 1.86 12.59 1.86 13.57 2.42L19.51 5.84999C20.48 6.41999 21.08 7.45003 21.08 8.58003Z"/><path d="M12 11.0001C13.2869 11.0001 14.33 9.95687 14.33 8.67004C14.33 7.38322 13.2869 6.34009 12 6.34009C10.7132 6.34009 9.67004 7.38322 9.67004 8.67004C9.67004 9.95687 10.7132 11.0001 12 11.0001Z"/><path d="M16 16.6601C16 14.8601 14.21 13.4001 12 13.4001C9.79 13.4001 8 14.8601 8 16.6601"/></svg>`;
  }
  if (n.includes("sport") || n.includes("fit") || n.includes("gym")) {
    return `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.1801 18C19.5801 18 20.1801 16.65 20.1801 15V9C20.1801 7.35 19.5801 6 17.1801 6C14.7801 6 14.1801 7.35 14.1801 9V15C14.1801 16.65 14.7801 18 17.1801 18Z"/><path d="M6.81995 18C4.41995 18 3.81995 16.65 3.81995 15V9C3.81995 7.35 4.41995 6 6.81995 6C9.21995 6 9.81995 7.35 9.81995 9V15C9.81995 16.65 9.21995 18 6.81995 18Z"/><path d="M9.81995 12H14.1799"/><path d="M22.5 14.5V9.5"/><path d="M1.5 14.5V9.5"/></svg>`;
  }
  if (n.includes("beauty") || n.includes("cosmetic") || n.includes("makeup")) {
    return `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16.7 18.98H7.30002C6.88002 18.98 6.41002 18.65 6.27002 18.25L2.13002 6.66999C1.54002 5.00999 2.23002 4.49999 3.65002 5.51999L7.55002 8.30999C8.20002 8.75999 8.94002 8.52999 9.22002 7.79999L10.98 3.10999C11.54 1.60999 12.47 1.60999 13.03 3.10999L14.79 7.79999C15.07 8.52999 15.81 8.75999 16.45 8.30999L20.11 5.69999C21.67 4.57999 22.42 5.14999 21.78 6.95999L17.74 18.27C17.59 18.65 17.12 18.98 16.7 18.98Z"/><path d="M6.5 22H17.5"/><path d="M9.5 14H14.5"/></svg>`;
  }
  if (n.includes("jewel") || n.includes("access") || n.includes("ring")) {
    return `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.7998 3.40005L7.19982 7.70005C7.09982 7.90005 6.99982 8.20005 6.89982 8.40005L5.19982 17C5.09982 17.6 5.39982 18.3 5.89982 18.6L11.1998 21.6C11.5998 21.8 12.2998 21.8 12.6998 21.6L17.9998 18.6C18.4998 18.3 18.7998 17.6 18.6998 17L16.9998 8.40005C16.9998 8.20005 16.7998 7.90005 16.6998 7.70005L13.0998 3.40005C12.4998 2.60005 11.4998 2.60005 10.7998 3.40005Z"/><path d="M16.8002 8.5L12.5002 20.7C12.3002 21.1 11.7002 21.1 11.6002 20.7L7.2002 8.5"/></svg>`;
  }
  if (n.includes("shoe") || n.includes("footwear") || n.includes("sneaker")) {
    return `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 17.5L8 16.5L12 18L18 16L20 18.5V19.5H4V17.5Z"/><path d="M8 16.5V13.5L12 12V18"/></svg>`;
  }
  if (n.includes("bag") || n.includes("handbag") || n.includes("backpack")) {
    return `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`;
  }
  // Default category fallback icon
  return `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>`;
};

export interface SectionGridMoreExploreProps {
  className?: string;
  gridClassName?: string;
  boxCard?: "box1" | "box4" | "box6";
  data?: ExploreType[];
  heading?: string;
  subHeading?: string;
}

const SectionGridMoreExplore: FC<SectionGridMoreExploreProps> = ({
  className = "",
  boxCard = "box4",
  gridClassName = "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  data = DEMO_MORE_EXPLORE_DATA.filter((_, i) => i < 6),
  heading = "Shop by Category",
  subHeading = "CURATED SELECTION",
}) => {
  const [tabActive, setTabActive] = useState("All");

  const categoryList = data && data.length ? data : DEMO_MORE_EXPLORE_DATA.filter((_, i) => i < 6);

  // Extract unique category names for dynamic tabs
  const uniqueNames = Array.from(new Set(categoryList.map((item) => item.name).filter(Boolean)));
  const tabs = ["All", ...uniqueNames];

  // Filter items based on active tab
  const filteredData =
    tabActive === "All"
      ? categoryList
      : categoryList.filter((item) => item.name === tabActive);

  const renderCard = (item: ExploreType, index: number) => {
    const cardBgSVG = item.svgBg || DECORATIVE_SVGS[index % DECORATIVE_SVGS.length];
    const cardColor = item.color || DECORATIVE_COLORS[index % DECORATIVE_COLORS.length];

    switch (boxCard) {
      case "box1":
        return <CardCategory1 key={item.id} featuredImage={item.image} {...item} />;

      case "box4":
        return (
          <CardCategory4
            bgSVG={cardBgSVG}
            featuredImage={item.image}
            key={item.id}
            color={cardColor}
            {...item}
          />
        );
      case "box6":
        return (
          <CardCategory6
            bgSVG={cardBgSVG}
            featuredImage={item.image}
            key={item.id}
            color={cardColor}
            {...item}
          />
        );

      default:
        return (
          <CardCategory4
            bgSVG={cardBgSVG}
            featuredImage={item.image}
            key={item.id}
            color={cardColor}
            {...item}
          />
        );
    }
  };

  return (
    <div className={`nc-SectionGridMoreExplore relative ${className}`}>
      {/* Section Heading */}
      <div>
        <Heading
          className="mb-10 text-slate-900 dark:text-neutral-50"
          fontClass="text-3xl md:text-4xl 2xl:text-5xl font-extrabold"
          rightDescText={subHeading}
          hasNextPrev={false}
          isCenter={false}
        >
          {heading}
        </Heading>

        {/* Floating White Rounded Nav Container with Icons */}
        {tabs.length > 1 && (
          <div className="mb-12 lg:mb-14 relative flex justify-center w-full">
            <Nav className="p-1.5 bg-white dark:bg-neutral-800 rounded-full shadow-lg overflow-x-auto hiddenScrollbar flex items-center justify-center gap-1 sm:gap-2 max-w-full">
              {tabs.map((tabName) => {
                const iconSvg = getCategoryIcon(tabName);
                return (
                  <NavItem2
                    key={tabName}
                    isActive={tabActive === tabName}
                    onClick={() => setTabActive(tabName)}
                  >
                    <div className="flex items-center justify-center space-x-1.5 sm:space-x-2.5 text-xs sm:text-sm px-1.5 py-0.5">
                      <span
                        className="inline-block flex-shrink-0"
                        dangerouslySetInnerHTML={{ __html: iconSvg }}
                      />
                      <span>{tabName}</span>
                    </div>
                  </NavItem2>
                );
              })}
            </Nav>
          </div>
        )}
      </div>

      {/* Grid of Category Cards */}
      {filteredData.length > 0 ? (
        <div className={`grid gap-4 md:gap-7 ${gridClassName}`}>
          {filteredData.map((item, index) => renderCard(item, index))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 text-sm">
          No categories found in this section.
        </div>
      )}
    </div>
  );
};

export default SectionGridMoreExplore;
