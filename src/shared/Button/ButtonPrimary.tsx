import Button, { ButtonProps } from "@/shared/Button/Button";
import React from "react";

export interface ButtonPrimaryProps extends ButtonProps {}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  className = "",
  ...args
}) => {
  return (
    <Button
      className={`ttnc-ButtonPrimary disabled:bg-opacity-90 bg-[var(--btn-bg)] dark:bg-slate-100 hover:bg-[var(--btn-hover-bg)] text-[var(--btn-text)] dark:text-slate-800 shadow-[var(--btn-shadow)] ${className}`}
      {...args}
    />
  );
};

export default ButtonPrimary;
