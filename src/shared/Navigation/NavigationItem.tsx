'use client';

import { Popover, Transition } from '@/app/headlessui';
import { ChevronDownIcon, ChevronUpIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import React, { FC, Fragment, useState } from 'react';
import { Route } from '@/routers/types';
import Link from 'next/link';

export interface NavItemType {
  id: string;
  name: string;
  href: Route;
  targetBlank?: boolean;
  children?: NavItemType[];
  type?: 'dropdown' | 'megaMenu' | 'none';
  isNew?: boolean;
}

export interface NavigationItemProps {
  menuItem: NavItemType;
}

const NavigationItem: FC<NavigationItemProps> = ({ menuItem }) => {
  const [menuCurrentHovers, setMenuCurrentHovers] = useState<string[]>([]);

  const onMouseEnterMenu = (id: string) => {
    setMenuCurrentHovers((state) => [...state, id]);
  };

  const onMouseLeaveMenu = (id: string) => {
    setMenuCurrentHovers((state) => {
      return state.filter((item, index) => {
        return item !== id && index < state.indexOf(id);
      });
    });
  };

  // ===================== MENU MEGAMENU =====================
  const renderMegaMenu = (menu: NavItemType) => {
    if (!menu.children) {
      return null;
    }
    const isHover = menuCurrentHovers.includes(menu.id);
    
    // Flatten menu children for vertical list rendering in compact dropdown card
    const flatItems: NavItemType[] = [];
    menu.children.forEach((group) => {
      if (group.children && group.children.length > 0) {
        flatItems.push(...group.children);
      } else {
        flatItems.push(group);
      }
    });

    return (
      <Popover
        as="li"
        className="relative menu-item menu-dropdown"
        onMouseEnter={() => onMouseEnterMenu(menu.id)}
        onMouseLeave={() => onMouseLeaveMenu(menu.id)}>
        {() => (
          <>
            <Popover.Button as={Fragment}>
              {renderMainItem(menu, isHover)}
            </Popover.Button>
            <Transition
              as={Fragment}
              show={isHover}
              enter="transition ease-out duration-150"
              enterFrom="opacity-0 translate-y-1 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-1 scale-95">
              <Popover.Panel
                className="absolute left-1/2 -translate-x-1/2 z-50 w-64 sm:w-72 pt-3 transform sub-menu top-full">
                {/* Pointer Caret */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-white dark:bg-neutral-900 border-t border-l border-neutral-200/80 dark:border-neutral-800 z-10" />

                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xl shadow-neutral-900/10 dark:shadow-black/40 p-2.5 z-20">
                  {/* ALL CATEGORIES HEADER */}
                  <div className="px-3.5 pt-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    ALL CATEGORIES
                  </div>

                  {/* CATEGORIES / ITEMS LIST */}
                  <ul className="space-y-0.5">
                    {flatItems.map((item, index) => {
                      const isSelected = index === 0;
                      return (
                        <li key={item.id || index}>
                          {renderDropdownMenuNavlink(item, isSelected)}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  // ===================== MENU DROPDOWN =====================
  const renderDropdownMenu = (menuDropdown: NavItemType) => {
    const isHover = menuCurrentHovers.includes(menuDropdown.id);
    return (
      <Popover
        as="li"
        className="relative menu-item menu-dropdown"
        onMouseEnter={() => onMouseEnterMenu(menuDropdown.id)}
        onMouseLeave={() => onMouseLeaveMenu(menuDropdown.id)}>
        {() => (
          <>
            <Popover.Button as={Fragment}>
              {renderMainItem(menuDropdown, isHover)}
            </Popover.Button>
            <Transition
              as={Fragment}
              show={isHover}
              enter="transition ease-out duration-150"
              enterFrom="opacity-0 translate-y-1 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-1 scale-95">
              <Popover.Panel
                className="absolute left-1/2 -translate-x-1/2 z-50 w-64 sm:w-72 pt-3 transform sub-menu top-full">
                {/* Pointer Caret */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-white dark:bg-neutral-900 border-t border-l border-neutral-200/80 dark:border-neutral-800 z-10" />

                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xl shadow-neutral-900/10 dark:shadow-black/40 p-2.5 z-20">
                  {/* ALL CATEGORIES HEADER */}
                  <div className="px-3.5 pt-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    ALL CATEGORIES
                  </div>

                  <ul className="space-y-0.5 text-sm">
                    {menuDropdown.children?.map((i, index) => {
                      const isSelected = index === 0;
                      if (i.type) {
                        return renderDropdownMenuNavlinkHasChild(i);
                      } else {
                        return (
                          <li key={i.id}>
                            {renderDropdownMenuNavlink(i, isSelected)}
                          </li>
                        );
                      }
                    })}
                  </ul>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  const renderDropdownMenuNavlinkHasChild = (item: NavItemType) => {
    const isHover = menuCurrentHovers.includes(item.id);
    return (
      <Popover
        as="li"
        key={item.id}
        className="relative menu-item menu-dropdown"
        onMouseEnter={() => onMouseEnterMenu(item.id)}
        onMouseLeave={() => onMouseLeaveMenu(item.id)}>
        {() => (
          <>
            <Popover.Button as={Fragment}>
              {renderDropdownMenuNavlink(item)}
            </Popover.Button>
            <Transition
              as={Fragment}
              show={isHover}
              enter="transition ease-out duration-150"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1">
              <Popover.Panel
                className="absolute top-0 z-50 w-56 pl-2 sub-menu left-full">
                <ul className="relative grid p-2 space-y-1 text-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-slate-100 dark:border-slate-800">
                  {item.children?.map((i) => {
                    if (i.type) {
                      return renderDropdownMenuNavlinkHasChild(i);
                    } else {
                      return (
                        <li key={i.id}>
                          {renderDropdownMenuNavlink(i)}
                        </li>
                      );
                    }
                  })}
                </ul>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  const renderDropdownMenuNavlink = (item: NavItemType, isSelected = false) => {
    return (
      <Link
        className={`group flex items-center justify-between px-3.5 py-2.5 text-sm rounded-xl transition-all duration-150 ${
          isSelected
            ? "bg-[#FAF5F5] dark:bg-neutral-800/90 font-bold text-neutral-900 dark:text-white"
            : "font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white"
        }`}
        href={{
          pathname: item.href || undefined,
        }}>
        <span className="truncate">{item.name}</span>
        {item.type ? (
          <ChevronDownIcon
            className="w-4 h-4 ml-2 text-neutral-400 -rotate-90"
            aria-hidden="true"
          />
        ) : (
          <ChevronRightIcon
            className={`h-4 w-4 flex-shrink-0 transition-opacity ${
              isSelected
                ? "text-neutral-500 dark:text-neutral-400"
                : "text-neutral-400 opacity-0 group-hover:opacity-100"
            }`}
          />
        )}
      </Link>
    );
  };

  // ===================== MENU MAIN MENU =====================
  const renderMainItem = (item: NavItemType, isHover = false) => {
    return (
      <div className="flex items-center flex-shrink-0 h-full min-h-[44px]">
        <Link
          className={`inline-flex items-center text-sm lg:text-[15px] font-semibold text-neutral-900 dark:text-slate-100 py-2 px-3 focus:outline-none transition-all ${
            isHover
              ? "border-b-2 border-neutral-900 dark:border-white pb-0.5"
              : "border-b-2 border-transparent opacity-90 hover:opacity-100"
          }`}
          href={{
            pathname: item.href || undefined,
          }}>
          {item.name}
          {item.type && (
            isHover ? (
              <ChevronUpIcon
                className="w-4 h-4 ml-1 text-neutral-900 dark:text-white"
                aria-hidden="true"
              />
            ) : (
              <ChevronDownIcon
                className="w-4 h-4 ml-1 text-neutral-500"
                aria-hidden="true"
              />
            )
          )}
        </Link>
      </div>
    );
  };

  switch (menuItem.type) {
    case 'dropdown':
      return renderDropdownMenu(menuItem);
    case 'megaMenu':
      return renderMegaMenu(menuItem);
    default:
      return (
        <li className="flex-shrink-0 menu-item">{renderMainItem(menuItem)}</li>
      );
  }
};

export default NavigationItem;
