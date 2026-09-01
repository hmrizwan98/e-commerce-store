"use client";

import React, { Fragment } from "react";
import { Listbox, Transition } from "@/app/headlessui";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

export interface CustomSelectOption<T extends string = string> {
  value: T;
  label: string;
  dot?: string;
  icon?: string;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (val: T) => void;
  options: CustomSelectOption<T>[];
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export default function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  disabled = false,
  className = "",
  placeholder = "Select option",
}: CustomSelectProps<T>) {
  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const containerClass = className.includes("w-") ? className : `w-full ${className}`;

  return (
    <div className={`relative ${containerClass}`}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button className="w-full inline-flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            <div className="flex items-center gap-2 min-w-0 truncate">
              {selectedOption?.dot && (
                <span className={`w-2 h-2 rounded-full shrink-0 ${selectedOption.dot}`} />
              )}
              {selectedOption?.icon && (
                <span className="text-sm shrink-0">{selectedOption.icon}</span>
              )}
              <span className="truncate font-semibold">
                {selectedOption?.label || placeholder}
              </span>
            </div>
            <ChevronDownIcon className="w-4 h-4 text-slate-400 shrink-0 stroke-[2.5]" />
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Listbox.Options className="absolute z-50 left-0 right-0 mt-1.5 py-1.5 max-h-60 overflow-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl ring-1 ring-black/5 focus:outline-none text-xs sm:text-sm">
              {options.map((opt) => (
                <Listbox.Option
                  key={opt.value}
                  value={opt.value}
                  className={({ active, selected }) =>
                    `relative cursor-pointer select-none py-2.5 px-4 flex items-center justify-between transition-colors ${
                      active
                        ? "bg-primary-50 dark:bg-primary-950/60 text-primary-6000 dark:text-primary-400"
                        : "text-slate-700 dark:text-slate-300"
                    } ${selected ? "font-bold bg-primary-50/70 dark:bg-primary-950/40 text-primary-6000 dark:text-primary-400" : ""}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        {opt.dot && (
                          <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                        )}
                        {opt.icon && <span className="text-sm shrink-0">{opt.icon}</span>}
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {selected && (
                        <CheckIcon className="w-4 h-4 text-primary-6000 dark:text-primary-400 shrink-0 stroke-[2.5]" />
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
