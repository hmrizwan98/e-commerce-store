"use client";

import { Popover, Transition } from "@/app/headlessui";
import { ChevronDownIcon, ChevronUpIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { Fragment } from "react";
import { useCategories } from "@/hooks/useCategories";

export default function DropdownCategories() {
  const categories = useCategories();

  return (
    <div className="DropdownCategories relative">
      <Popover className="relative">
        {({ open, close }) => (
          <>
            <Popover.Button
              className={`group py-2 h-10 sm:h-12 flex items-center gap-1.5 text-sm sm:text-base font-semibold text-neutral-900 dark:text-white focus:outline-none transition-all ${
                open ? "border-b-2 border-neutral-900 dark:border-white pb-0.5" : "border-b-2 border-transparent opacity-90 hover:opacity-100"
              }`}
            >
              <span>Categories</span>
              {open ? (
                <ChevronUpIcon className="h-4 w-4 text-neutral-800 dark:text-neutral-200" aria-hidden="true" />
              ) : (
                <ChevronDownIcon
                  className="h-4 w-4 text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-transform duration-150"
                  aria-hidden="true"
                />
              )}
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-1 scale-95"
            >
              <Popover.Panel className="absolute z-50 w-64 sm:w-72 mt-3 transform -translate-x-1/2 left-1/2">
                {/* Pointer Caret */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-white dark:bg-neutral-900 border-t border-l border-neutral-200/80 dark:border-neutral-800 z-10" />

                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xl shadow-neutral-900/10 dark:shadow-black/40 p-2.5 z-20">
                  {/* ALL CATEGORIES HEADER */}
                  <div className="px-3.5 pt-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    ALL CATEGORIES
                  </div>

                  {/* CATEGORIES LIST */}
                  <div className="space-y-0.5">
                    {categories.map((item, index) => {
                      const isSelected = index === 0;
                      return (
                        <Link
                          key={item.id}
                          href={`/category/${item.slug}` as any}
                          onClick={() => close()}
                          className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                            isSelected
                              ? "bg-[#FAF5F5] dark:bg-neutral-800/90 font-bold text-neutral-900 dark:text-white"
                              : "font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white"
                          }`}
                        >
                          <span className="truncate">{item.name}</span>
                          <ChevronRightIcon
                            className={`h-4 w-4 flex-shrink-0 transition-opacity ${
                              isSelected
                                ? "text-neutral-500 dark:text-neutral-400"
                                : "text-neutral-400 opacity-0 group-hover:opacity-100"
                            }`}
                          />
                        </Link>
                      );
                    })}

                    {!categories.length && (
                      <div className="px-3.5 py-3 text-sm text-neutral-400 animate-pulse">
                        Loading categories...
                      </div>
                    )}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
}

