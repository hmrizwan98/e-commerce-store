"use client";

import { Popover, Transition } from "@/app/headlessui";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMenu } from "@/hooks/useMenu";
import { useCategories } from "@/hooks/useCategories";

export default function TemplatesDropdown() {
  const headerItems = useMenu("header");
  const megaMenuItem = headerItems.find((item) => item.type === "megaMenu");
  const categories = useCategories();

  if (!categories.length) return null;

  return (
    <div className="TemplatesDropdown hidden lg:block">
      <Popover className="">
        {({ open, close }) => (
          <>
            <Popover.Button
              className={`
                ${open ? "" : "text-opacity-80"}
                group h-10 sm:h-12 px-3 py-1.5 inline-flex items-center text-sm text-gray-800 dark:text-slate-300 font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
            >
              <span className="">{megaMenuItem?.name ?? "Category"}</span>
              <ChevronDownIcon
                className={`${open ? "-rotate-180" : ""}
                  ml-1 h-4 w-4 transition ease-in-out duration-150 `}
                aria-hidden="true"
              />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute z-20 w-full mt-3.5 inset-x-0">
                <div className="bg-white dark:bg-neutral-900 shadow-lg">
                  <div className="container">
                    <div className="border-t border-slate-200 dark:border-slate-700 py-10">
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6 xl:gap-8">
                        {categories.slice(0, 12).map((category) => (
                          <Link
                            key={category.id}
                            href={`/category/${category.slug}` as any}
                            onClick={() => close()}
                            className="group/cat flex flex-col items-center gap-3 text-center"
                          >
                            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 ring-1 ring-black/5 dark:ring-white/10 group-hover/cat:ring-primary-500 transition-all">
                              {category.image ? (
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  sizes="140px"
                                  className="object-cover group-hover/cat:scale-105 transition-transform duration-300"
                                />
                              ) : category.icon ? (
                                <div
                                  dangerouslySetInnerHTML={{ __html: category.icon }}
                                  className="w-full h-full flex items-center justify-center text-primary-500 [&_svg]:w-8 [&_svg]:h-8"
                                />
                              ) : null}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover/cat:text-primary-600 dark:group-hover/cat:text-primary-400 transition-colors line-clamp-1">
                              {category.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-10 text-center">
                        <Link
                          href="/collection"
                          onClick={() => close()}
                          className="inline-flex items-center text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          View all categories →
                        </Link>
                      </div>
                    </div>
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
