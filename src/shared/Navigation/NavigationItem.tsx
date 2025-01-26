'use client';

import { Popover, Transition } from '@/app/headlessui';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import CardCategory3 from '@/components/CardCategories/CardCategory3';
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
    return (
      <li
        className={`menu-item flex-shrink-0 menu-megamenu menu-megamenu--large`}>
        {renderMainItem(menu)}

        <div className="absolute inset-x-0 z-50 invisible transform sub-menu top-full">
          <div className="bg-white shadow-lg dark:bg-neutral-900">
            <div className="container">
              <div className="flex text-sm border-t border-slate-200 dark:border-slate-700 py-14">
                <div className="grid flex-1 grid-cols-4 gap-6 pr-6 xl:gap-8 xl:pr-8">
                  {menu.children.map((item: any, index: number) => (
                    <div key={index}>
                      <p className="font-medium text-slate-900 dark:text-neutral-200">
                        {item.name}
                      </p>
                      <ul className="grid mt-4 space-y-4">
                        {item.children?.map(renderMegaMenuNavlink)}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="w-[40%] xl:w-[35%]">
                  <CardCategory3 />
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  };

  const renderMegaMenuNavlink = (item: NavItemType) => {
    return (
      <li key={item.id} className={`${item.isNew ? 'menuIsNew' : ''}`}>
        <Link
          className="font-normal text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white "
          href={{
            pathname: item.href || undefined,
          }}>
          {item.name}
        </Link>
      </li>
    );
  };

  // ===================== MENU DROPDOW =====================
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
              {renderMainItem(menuDropdown)}
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
                static
                className="absolute left-0 z-10 w-56 transform sub-menu top-full">
                <ul className="relative grid py-4 space-y-1 text-sm bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 dark:bg-neutral-900">
                  {menuDropdown.children?.map((i) => {
                    if (i.type) {
                      return renderDropdownMenuNavlinkHasChild(i);
                    } else {
                      return (
                        <li key={i.id} className="px-2">
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

  const renderDropdownMenuNavlinkHasChild = (item: NavItemType) => {
    const isHover = menuCurrentHovers.includes(item.id);
    return (
      <Popover
        as="li"
        key={item.id}
        className="relative px-2 menu-item menu-dropdown"
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
                static
                className="absolute top-0 z-10 w-56 pl-2 sub-menu left-full">
                <ul className="relative grid py-4 space-y-1 text-sm bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 dark:bg-neutral-900">
                  {item.children?.map((i) => {
                    if (i.type) {
                      return renderDropdownMenuNavlinkHasChild(i);
                    } else {
                      return (
                        <li key={i.id} className="px-2">
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

  const renderDropdownMenuNavlink = (item: NavItemType) => {
    return (
      <Link
        className="flex items-center px-4 py-2 font-normal rounded-md text-neutral-6000 dark:text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        href={{
          pathname: item.href || undefined,
        }}>
        {item.name}
        {item.type && (
          <ChevronDownIcon
            className="w-4 h-4 ml-2 text-neutral-500"
            aria-hidden="true"
          />
        )}
      </Link>
    );
  };

  // ===================== MENU MAIN MENU =====================
  const renderMainItem = (item: NavItemType) => {
    return (
      <div className="flex items-center flex-shrink-0 h-20">
        <Link
          className="inline-flex items-center text-sm lg:text-[15px] font-medium text-slate-700 dark:text-slate-300 py-2.5 px-4 xl:px-5 rounded-full hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          href={{
            pathname: item.href || undefined,
          }}>
          {item.name}
          {item.type && (
            <ChevronDownIcon
              className="w-4 h-4 ml-1 -mr-1 text-slate-400"
              aria-hidden="true"
            />
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
