import Button, { ButtonProps } from "@/shared/Button/Button";
import React from "react";

export interface ButtonSecondaryProps extends ButtonProps {}

const DEFAULT_BORDER = "border border-slate-300 dark:border-slate-700";

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  className = "",
  ...args
}) => {
  // Always outlined: callers that pass their own border keep it; everyone else gets the
  // default (previously ANY className dropped the border, making some look like plain text).
  const border = /\bborder\b|\bborder-/.test(className) ? "" : DEFAULT_BORDER;
  return (
    <Button
      className={`ttnc-ButtonSecondary bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 ${border} ${className}`}
      {...args}
    />
  );
};

export default ButtonSecondary;
