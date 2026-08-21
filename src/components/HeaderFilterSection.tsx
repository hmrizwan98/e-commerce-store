"use client";

import React, { FC, useState } from "react";
import Heading from "@/shared/Heading/Heading";
import Nav from "@/shared/Nav/Nav";
import NavItem from "@/shared/NavItem/NavItem";
import { ChevronDownIcon, FunnelIcon } from "@heroicons/react/24/outline";
import TabFilters from "@/components/TabFilters";
import { Transition } from "@/app/headlessui";

export interface HeaderFilterSectionProps {
  className?: string;
  heading?: string;
  subHeading?: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const HeaderFilterSection: FC<HeaderFilterSectionProps> = ({
  className = "mb-12",
  heading = "What's trending now",
  subHeading = "Discover our curated collection of trending products.",
  tabs = ["All items"],
  activeTab = "All items",
  onTabChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localActiveTab, setLocalActiveTab] = useState(activeTab);

  const currentTab = activeTab !== undefined ? activeTab : localActiveTab;

  const handleTabClick = (item: string) => {
    setLocalActiveTab(item);
    if (onTabChange) {
      onTabChange(item);
    }
  };

  return (
    <div className={`flex flex-col relative ${className}`}>
      <Heading desc={subHeading}>{heading}</Heading>
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <Nav
          className="sm:space-x-2"
          containerClassName="relative flex w-full overflow-x-auto text-sm md:text-base hiddenScrollbar"
        >
          {tabs.map((item, index) => (
            <NavItem
              key={index}
              isActive={currentTab === item}
              onClick={() => handleTabClick(item)}
            >
              {item}
            </NavItem>
          ))}
        </Nav>

        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white text-sm font-semibold shadow-sm transition-all duration-200"
          >
            <FunnelIcon className="w-4 h-4" />
            <span>Filter</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <Transition
        show={isOpen}
        enter="transition-opacity duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="w-full border-b border-neutral-200 dark:border-neutral-700 my-8"></div>
        <TabFilters />
      </Transition>
    </div>
  );
};

export default HeaderFilterSection;
