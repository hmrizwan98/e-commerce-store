"use client";

import React, { useMemo, useState } from "react";
import CustomSelect, { type CustomSelectOption } from "@/components/admin/CustomSelect";

/**
 * Drop-in replacement for a native <select>: same props and the same `<option>` children,
 * rendered with the platform's standard dropdown (CustomSelect - keyboard navigation,
 * type-ahead, consistent styling, never clipped by scroll containers).
 *
 * - `onChange` still receives an event-like object, so existing `e.target.value` handlers
 *   keep working unchanged (values are strings, exactly like a native select).
 * - `name` is submitted with a surrounding <form> via a hidden input.
 * - Controlled (`value`) or uncontrolled (`defaultValue`).
 * - Only layout classes (width/margin/flex) are kept from `className` - the old border /
 *   padding / colour classes styled the native control and would double up here.
 */
export interface NativeSelectProps {
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
  title?: string;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

const LAYOUT_CLASS = /^(?:[a-z]+:)*(?:w-|min-w-|max-w-|m[trblxy]?-|-m[trblxy]?-|flex-|shrink|grow|basis-|col-|row-|self-|order-|hidden$|block$|inline-block$)/;

function layoutClasses(className = ""): string {
  return className
    .split(/\s+/)
    .filter((c) => LAYOUT_CLASS.test(c))
    .join(" ");
}

function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement(node)) return textOf((node.props as { children?: React.ReactNode }).children);
  return "";
}

/** Flattens `<option>` children (including arrays from .map() and fragments). */
export function optionsFromChildren(children: React.ReactNode): CustomSelectOption[] {
  const out: CustomSelectOption[] = [];
  const visit = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement(child)) return;
      const props = child.props as { value?: string | number; children?: React.ReactNode; disabled?: boolean };
      if (child.type === React.Fragment) {
        visit(props.children);
        return;
      }
      if (child.type === "option") {
        const label = textOf(props.children);
        out.push({ value: String(props.value ?? label), label, disabled: props.disabled });
      }
    });
  };
  visit(children);
  return out;
}

export default function NativeSelect({
  value,
  defaultValue,
  onChange,
  name,
  id,
  disabled,
  className,
  placeholder,
  "aria-label": ariaLabel,
  title,
  size = "md",
  children,
}: NativeSelectProps) {
  const options = useMemo(() => optionsFromChildren(children), [children]);
  const isControlled = value !== undefined;
  const [inner, setInner] = useState<string>(String(defaultValue ?? options[0]?.value ?? ""));
  const current = isControlled ? String(value) : inner;

  const handleChange = (next: string) => {
    if (!isControlled) setInner(next);
    if (onChange) {
      const target = { value: next, name: name ?? "", id: id ?? "" };
      onChange({ target, currentTarget: target } as unknown as React.ChangeEvent<HTMLSelectElement>);
    }
  };

  return (
    <div className={layoutClasses(className) || "min-w-[8rem]"} title={title}>
      <CustomSelect<string>
        value={current}
        onChange={handleChange}
        options={options}
        disabled={disabled}
        placeholder={placeholder ?? options[0]?.label}
        name={name}
        id={id}
        aria-label={ariaLabel ?? title}
        size={size}
        className="w-full"
      />
    </div>
  );
}
