import React, { FC, SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  sizeClass?: string;
}

const Select: FC<SelectProps> = ({
  className = "",
  sizeClass = "h-11",
  children,
  ...args
}) => {
  return (
    <div className="relative w-full">
      <select
        className={`nc-Select ${sizeClass} ${className} appearance-none block w-full text-xs sm:text-sm font-medium rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all cursor-pointer pl-4 pr-10 shadow-xs hover:border-slate-300 dark:hover:border-slate-600`}
        {...args}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
        <ChevronDownIcon className="w-4 h-4 stroke-[2.5]" />
      </div>
    </div>
  );
};

export default Select;
