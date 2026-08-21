"use client";

import React, { createRef, FC, useState } from "react";
import Logo from "@/shared/Logo/Logo";
import MenuBar from "@/shared/MenuBar/MenuBar";
import AvatarDropdown from "./AvatarDropdown";
import Navigation from "@/shared/Navigation/Navigation";
import CartDropdown from "./CartDropdown";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import type { ThemeHeader, ThemeLogos } from "@/types/theme";
import type { CartThemeConfig } from "@/lib/theme/theme-types";

export interface MainNav2LoggedProps {
  headerSettings?: ThemeHeader;
  cartSettings?: CartThemeConfig;
  transparentActive?: boolean;
  logos?: ThemeLogos;
  storeName?: string;
}

const MainNav2Logged: FC<MainNav2LoggedProps> = ({ headerSettings, cartSettings, transparentActive, logos, storeName }) => {
  const inputRef = createRef<HTMLInputElement>();
  const [showSearchForm, setShowSearchForm] = useState(false);
  const router = useRouter();

  const showSearch = headerSettings?.showSearch ?? true;
  const showAccount = headerSettings?.showAccount ?? true;
  const showCart = headerSettings?.showCart ?? true;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current?.value) {
      router.push(`/search?q=${encodeURIComponent(inputRef.current.value)}`);
    }
  };

  const renderMagnifyingGlassIcon = () => {
    return (
      <svg
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 22L20 20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const renderSearchForm = () => {
    return (
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 py-2 text-slate-900 dark:text-slate-100"
      >
        <div className="bg-slate-50 dark:bg-slate-800 flex items-center space-x-1.5 px-5 h-full rounded-full flex-1 border border-slate-200 dark:border-slate-700">
          {renderMagnifyingGlassIcon()}
          <input
            ref={inputRef}
            type="text"
            placeholder="Type and press enter"
            className="border-none bg-transparent focus:outline-none focus:ring-0 w-full text-sm "
            autoFocus
          />
          <button type="button" onClick={() => setShowSearchForm(false)}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <input type="submit" hidden value="" />
      </form>
    );
  };

  const renderContent = () => {
    const customHeight = headerSettings?.heightPx ? `${headerSettings.heightPx}px` : undefined;
    return (
      <div
        className={`flex justify-between items-center w-full ${customHeight ? "" : "min-h-[50px] py-1.5"}`}
        style={customHeight ? { height: customHeight } : undefined}
      >
        <div className="flex items-center lg:hidden flex-1">
          <MenuBar />
        </div>

        <div className="lg:flex-1 flex items-center">
          <Logo className="flex-shrink-0" img={logos?.logoLight} imgLight={logos?.logoDark} storeName={storeName} logoHeightPx={headerSettings?.logoHeightPx} />
        </div>

        <div className="flex-[2] hidden lg:flex justify-center mx-4">
          {showSearchForm && showSearch ? renderSearchForm() : <Navigation />}
        </div>

        <div
          className={`flex-1 flex items-center justify-end ${
            transparentActive ? "text-white" : "text-slate-700 dark:text-slate-100"
          }`}
        >
          {!showSearchForm && showSearch && (
            <button
              className="hidden lg:flex w-10 h-10 sm:w-12 sm:h-12 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none items-center justify-center"
              onClick={() => setShowSearchForm(!showSearchForm)}
            >
              {renderMagnifyingGlassIcon()}
            </button>
          )}
          {showAccount && <AvatarDropdown />}
          {showCart && <CartDropdown cartSettings={cartSettings} />}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`nc-MainNav2Logged relative z-10 ${
        transparentActive ? "bg-transparent" : "bg-[var(--header-bg)]"
      } dark:bg-neutral-900 border-b ${
        transparentActive ? "border-transparent" : "border-slate-100 dark:border-slate-700"
      }`}
    >
      <div className="container ">{renderContent()}</div>
    </div>
  );
};

export default MainNav2Logged;
