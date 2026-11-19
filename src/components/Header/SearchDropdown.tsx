"use client";

import { Popover, Transition } from "@/app/headlessui";
import React, { FC, Fragment, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  className?: string;
}

const SearchDropdown: FC<Props> = ({ className = "" }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent, closePopover?: () => void) => {
    e.preventDefault();
    if (closePopover) {
      closePopover();
    }
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <Popover className={`relative ${className}`}>
      {({ open, close }) => {
        if (open) {
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        }

        return (
          <>
            <Popover.Button
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none flex items-center justify-center transition-colors"
              aria-label="Open search bar"
            >
              <MagnifyingGlassIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </Popover.Button>

            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel
                static
                className="fixed inset-x-0 top-0 z-50 p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border-b border-slate-200 dark:border-slate-800 md:static md:inset-auto md:absolute md:right-0 md:top-full md:mt-3 md:w-[420px] md:p-3.5 md:rounded-2xl md:border md:shadow-2xl md:bg-white md:dark:bg-slate-900"
              >
                <form
                  action="/search"
                  method="GET"
                  onSubmit={(e) => handleSearchSubmit(e, close)}
                  className="flex items-center gap-2 w-full max-w-2xl mx-auto"
                >
                  <div className="relative flex-1 flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all">
                    <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2 flex-shrink-0" />
                    <input
                      ref={inputRef}
                      name="q"
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search products, brands, collections..."
                      className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 p-0"
                      autoFocus
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          inputRef.current?.focus();
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1 flex-shrink-0"
                        aria-label="Clear search text"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-3.5 sm:px-4 py-2 text-xs font-bold rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors shadow-xs flex-shrink-0"
                  >
                    Search
                  </button>

                  <button
                    type="button"
                    onClick={() => close()}
                    className="p-2 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden flex-shrink-0"
                    aria-label="Close search bar"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </form>
              </Popover.Panel>
            </Transition>
          </>
        );
      }}
    </Popover>
  );
};

export default SearchDropdown;
