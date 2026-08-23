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

  return (
    <div className={`relative w-full ${className}`}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button className="w-full inline-flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            <div className="flex items-center gap-2 min-w-0 truncate">
              {selectedOption?.dot && (
                <span className={`w-2 h-2 rounded-full shrink-0 ${selectedOption.dot}`} />
              )}
              {selectedOption?.icon && (
                <span className="text-sm shrink-0">{selectedOption.icon}</span>
              )}
              <span className="truncate capitalize font-semibold">
                {selectedOption?.label || placeholder}
              </span>
            </div>
            <ChevronDownIcon className="w-4 h-4 text-slate-400 shrink-0" />
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 left-0 right-0 mt-1 py-1 max-h-60 overflow-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl ring-1 ring-black/5 focus:outline-hidden text-xs">
              {options.map((opt) => (
                <Listbox.Option
                  key={opt.value}
                  value={opt.value}
                  className={({ active, selected }) =>
                    `relative cursor-pointer select-none py-2.5 px-3.5 flex items-center justify-between transition-colors ${
                      active
                        ? "bg-indigo-50 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-700 dark:text-slate-300"
                    } ${selected ? "font-bold bg-indigo-50/50 dark:bg-slate-800/40" : ""}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        {opt.dot && (
                          <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                        )}
                        {opt.icon && <span className="text-sm shrink-0">{opt.icon}</span>}
                        <span className="truncate capitalize">{opt.label}</span>
                      </div>
                      {selected && <CheckIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
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
