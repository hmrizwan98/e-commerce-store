import React, { FC, SelectHTMLAttributes } from "react";
import NativeSelect from "@/components/ui/NativeSelect";

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  className?: string;
  /** Kept for API compatibility - height now comes from the standard dropdown. */
  sizeClass?: string;
}

/** Storefront/account select - same API as before (<option> children, e.target.value
 * handlers), rendered with the platform's standard dropdown (see NativeSelect). */
const Select: FC<SelectProps> = ({ className = "", children, value, defaultValue, onChange, name, id, disabled, required }) => {
  return (
    <NativeSelect
      className={`w-full ${className}`}
      value={value as string | number | undefined}
      defaultValue={defaultValue as string | number | undefined}
      onChange={onChange}
      name={name}
      id={id}
      disabled={disabled}
      required={required}
      size="lg"
    >
      {children}
    </NativeSelect>
  );
};

export default Select;
