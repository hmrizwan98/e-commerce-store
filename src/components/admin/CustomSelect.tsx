"use client";

import React, { Fragment, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Listbox, Transition } from "@/app/headlessui";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

export interface CustomSelectOption<T extends string = string> {
  value: T;
  label: string;
  dot?: string;
  icon?: string;
  disabled?: boolean;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (val: T) => void;
  options: CustomSelectOption<T>[];
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  /** Submitted with a surrounding <form> (hidden input) - for native-<select> parity. */
  name?: string;
  id?: string;
  "aria-label"?: string;
  /** "sm" for dense panels (e.g. the storefront customizer inspectors). */
  size?: "sm" | "md" | "lg";
}

/**
 * The platform's standard dropdown (Headless UI Listbox): keyboard navigation, type-ahead
 * and screen-reader roles built in. The options list is rendered in a portal with fixed
 * positioning so it is never clipped by scrolling panels or modals, and flips above the
 * button when there isn't room below.
 */
export default function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  disabled = false,
  className = "",
  placeholder = "Select option",
  name,
  id,
  "aria-label": ariaLabel,
  size = "md",
}: CustomSelectProps<T>) {
  const selectedOption = options.find((opt) => opt.value === value);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerClass = className.includes("w-") ? className : `w-full ${className}`;
  // "lg" matches the storefront's h-11 / text-sm inputs (checkout, account forms).
  const sizeClass = size === "sm" ? "px-3 py-2 text-xs rounded-xl" : size === "lg" ? "px-4 h-11 text-sm rounded-2xl" : "px-3.5 py-2.5 text-xs rounded-xl";

  return (
    <div className={`relative ${containerClass}`}>
      {name && <input type="hidden" name={name} value={value} />}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        {({ open }) => (
          <div className="relative">
            <Listbox.Button
              ref={buttonRef}
              id={id}
              aria-label={ariaLabel}
              className={`w-full inline-flex items-center justify-between gap-2 ${sizeClass} font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
            >
              <div className="flex items-center gap-2 min-w-0 truncate">
                {selectedOption?.dot && <span className={`w-2 h-2 rounded-full shrink-0 ${selectedOption.dot}`} />}
                {selectedOption?.icon && <span className="text-sm shrink-0">{selectedOption.icon}</span>}
                <span className={`truncate font-semibold ${!selectedOption && value === "" ? "text-slate-400" : ""}`}>
                  {selectedOption?.label || (value === "" && placeholder ? placeholder : options[0]?.label || placeholder)}
                </span>
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-slate-400 shrink-0 stroke-[2.5] transition-transform ${open ? "rotate-180" : ""}`} />
            </Listbox.Button>

            {open && (
              <FloatingOptions anchor={buttonRef}>
                {(style) => (
                  <Transition as={Fragment} show appear enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100">
                    <Listbox.Options
                      static
                      style={style}
                      className="fixed z-[1000] py-1.5 max-h-60 overflow-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl ring-1 ring-black/5 focus:outline-none text-xs sm:text-sm"
                    >
                      {options.map((opt) => (
                        <Listbox.Option
                          key={opt.value}
                          value={opt.value}
                          disabled={opt.disabled}
                          className={({ active, selected, disabled: optDisabled }) =>
                            `relative cursor-pointer select-none py-2.5 px-4 flex items-center justify-between transition-colors ${
                              optDisabled
                                ? "opacity-40 cursor-not-allowed"
                                : active
                                  ? "bg-primary-50 dark:bg-primary-950/60 text-primary-6000 dark:text-primary-400"
                                  : "text-slate-700 dark:text-slate-300"
                            } ${selected ? "font-bold bg-primary-50/70 dark:bg-primary-950/40 text-primary-6000 dark:text-primary-400" : ""}`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <div className="flex items-center gap-2 min-w-0 truncate">
                                {opt.dot && <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />}
                                {opt.icon && <span className="text-sm shrink-0">{opt.icon}</span>}
                                <span className="truncate">{opt.label}</span>
                              </div>
                              {selected && <CheckIcon className="w-4 h-4 text-primary-6000 dark:text-primary-400 shrink-0 stroke-[2.5]" />}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                )}
              </FloatingOptions>
            )}
          </div>
        )}
      </Listbox>
    </div>
  );
}

const MAX_LIST_HEIGHT = 240;

/** Positions the open list next to its button (fixed, in a portal) and keeps it there on
 * scroll/resize; opens upward when the viewport has no room below. */
function FloatingOptions({
  anchor,
  children,
}: {
  anchor: React.RefObject<HTMLElement>;
  children: (style: React.CSSProperties) => React.ReactNode;
}) {
  const [style, setStyle] = useState<React.CSSProperties | null>(null);

  useLayoutEffect(() => {
    const update = () => {
      const el = anchor.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom;
      const openUp = spaceBelow < MAX_LIST_HEIGHT + 16 && r.top > spaceBelow;
      setStyle({
        left: r.left,
        width: Math.max(r.width, 160),
        ...(openUp ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchor]);

  if (!style || typeof document === "undefined") return null;
  return createPortal(children(style), document.body);
}
