import React, { FC } from "react";

export interface CheckboxProps {
  label?: string;
  subLabel?: string;
  className?: string;
  sizeClassName?: string;
  labelClassName?: string;
  name: string;
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

const Checkbox: FC<CheckboxProps> = ({
  subLabel = "",
  label = "",
  name,
  id,
  className = "",
  sizeClassName = "w-4 h-4",
  labelClassName = "",
  checked,
  defaultChecked,
  onChange,
}) => {
  const uniqueId = id || `checkbox-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  const isChecked = checked !== undefined ? checked : defaultChecked;

  return (
    <div className={`flex items-center text-sm ${className}`}>
      <input
        id={uniqueId}
        name={name}
        type="checkbox"
        checked={isChecked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        className={`rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-0 cursor-pointer transition-all shrink-0 ${sizeClassName}`}
      />
      {label && (
        <label
          htmlFor={uniqueId}
          className="pl-2.5 flex flex-col flex-1 justify-center select-none cursor-pointer"
        >
          <span
            className={`text-slate-800 dark:text-slate-200 font-medium ${labelClassName} ${
              !!subLabel ? "-mt-0.5" : ""
            }`}
          >
            {label}
          </span>
          {subLabel && (
            <p className="mt-0.5 text-slate-500 dark:text-slate-400 text-xs font-light">
              {subLabel}
            </p>
          )}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
