"use client";

import React from "react";
import type { NavItem, NavLinkType } from "@/types/nav";
import CustomSelect, { type CustomSelectOption } from "@/components/admin/CustomSelect";
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  LinkIcon,
  TagIcon,
  FolderIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

let counter = 0;
function newId() {
  counter += 1;
  return `nav_new_${Date.now()}_${counter}`;
}

export function emptyNavItem(): NavItem {
  return { id: newId(), name: "New link", href: "/", linkType: "manual" };
}

export interface LinkPickerOptions {
  pages: { slug: string; title: string }[];
  categories: { slug: string; name: string }[];
  brands: { slug: string; name: string }[];
  products: { slug: string; name: string }[];
}

interface Props {
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
  options: LinkPickerOptions;
  depth?: number;
}

const inputClass =
  "px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium";

const LINK_TYPE_OPTIONS: CustomSelectOption<NavLinkType>[] = [
  { value: "manual", label: "🔗 External URL" },
  { value: "page", label: "📄 Internal Page" },
  { value: "product", label: "📦 Product" },
  { value: "category", label: "🏷️ Category" },
  { value: "brand", label: "🏬 Brand" },
  { value: "anchor", label: "⚓ Anchor (#section)" },
  { value: "email", label: "✉️ Email" },
  { value: "phone", label: "📞 Phone" },
];

const SUBMENU_TYPE_OPTIONS: CustomSelectOption[] = [
  { value: "none", label: "Single Link" },
  { value: "dropdown", label: "Dropdown Menu" },
  { value: "megaMenu", label: "Mega Menu" },
];

function hrefPrefix(linkType: NavLinkType | undefined): string {
  switch (linkType) {
    case "product":
      return "/product/";
    case "category":
      return "/category/";
    case "brand":
      return "/brand/";
    case "page":
      return "/pages/";
    default:
      return "";
  }
}

const NavItemEditor: React.FC<Props> = ({ items, onChange, options, depth = 0 }) => {
  const update = (index: number, patch: Partial<NavItem>) => {
    const next = items.slice();
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const setLinkType = (index: number, linkType: NavLinkType) => {
    if (linkType === "manual") {
      update(index, { linkType, linkRefSlug: undefined });
      return;
    }
    if (linkType === "anchor") {
      update(index, { linkType, linkRefSlug: undefined, href: "#" });
      return;
    }
    if (linkType === "email") {
      update(index, { linkType, linkRefSlug: undefined, href: "mailto:" });
      return;
    }
    if (linkType === "phone") {
      update(index, { linkType, linkRefSlug: undefined, href: "tel:" });
      return;
    }
    update(index, { linkType, linkRefSlug: undefined, href: "" });
  };

  const setEntityRef = (index: number, linkType: NavLinkType, slug: string) => {
    if (linkType === "page") {
      if (slug === "order-tracking") {
        update(index, { linkType, linkRefSlug: slug, href: "/order-tracking" });
        return;
      }
      if (slug === "collection") {
        update(index, { linkType, linkRefSlug: slug, href: "/collection" });
        return;
      }
      if (slug === "contact") {
        update(index, { linkType, linkRefSlug: slug, href: "/contact" });
        return;
      }
      if (slug === "about") {
        update(index, { linkType, linkRefSlug: slug, href: "/about" });
        return;
      }
    }
    update(index, { linkType, linkRefSlug: slug, href: slug ? `${hrefPrefix(linkType)}${slug}` : "" });
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const addChild = (index: number) => {
    const next = items.slice();
    const children = next[index].children ?? [];
    next[index] = { ...next[index], children: [...children, emptyNavItem()] };
    onChange(next);
  };

  const addTop = () => {
    onChange([...items, emptyNavItem()]);
  };

  const pageSelectOptions: CustomSelectOption[] = [
    { value: "order-tracking", label: "🚚 Order Tracking (/order-tracking)" },
    { value: "collection", label: "🛍️ All Products / Collection (/collection)" },
    { value: "contact", label: "📞 Contact Us (/contact)" },
    { value: "about", label: "ℹ️ About Us (/about)" },
    ...options.pages.map((p) => ({ value: p.slug, label: `📄 ${p.title}` })),
  ];

  const productSelectOptions: CustomSelectOption[] = [
    { value: "", label: "Select product…" },
    ...options.products.map((p) => ({ value: p.slug, label: `📦 ${p.name}` })),
  ];

  const categorySelectOptions: CustomSelectOption[] = [
    { value: "", label: "Select category…" },
    ...options.categories.map((c) => ({ value: c.slug, label: `🏷️ ${c.name}` })),
  ];

  const brandSelectOptions: CustomSelectOption[] = [
    { value: "", label: "Select brand…" },
    ...options.brands.map((b) => ({ value: b.slug, label: `🏬 ${b.name}` })),
  ];

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const linkType: NavLinkType = item.linkType ?? "manual";

        const currentPageValue =
          item.linkRefSlug ??
          (item.href === "/order-tracking"
            ? "order-tracking"
            : item.href === "/collection"
            ? "collection"
            : item.href === "/contact"
            ? "contact"
            : item.href === "/about"
            ? "about"
            : "");

        return (
          <div
            key={item.id}
            className="border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/60 shadow-2xs space-y-3"
            style={{ marginLeft: depth * 20 }}
          >
            <div className="flex flex-wrap items-center gap-2">
              {/* Item Name Input */}
              <div className="flex items-center gap-2 flex-1 min-w-[140px] max-w-[220px]">
                <span className="text-slate-400 font-mono text-xs shrink-0">#{index + 1}</span>
                <input
                  className={`${inputClass} w-full font-bold`}
                  value={item.name}
                  placeholder="Navigation Label (e.g. Shop)"
                  onChange={(e) => update(index, { name: e.target.value })}
                />
              </div>

              {/* Link Type Selector */}
              <CustomSelect<NavLinkType>
                value={linkType}
                onChange={(val) => setLinkType(index, val)}
                options={LINK_TYPE_OPTIONS}
                className="w-40 shrink-0"
              />

              {/* Target Selector / Input */}
              {linkType === "manual" && (
                <input
                  className={`${inputClass} flex-1 min-w-[140px] font-mono`}
                  value={item.href}
                  placeholder="/path or https://..."
                  onChange={(e) => update(index, { href: e.target.value })}
                />
              )}

              {linkType === "page" && (
                <CustomSelect
                  value={currentPageValue}
                  onChange={(val) => setEntityRef(index, "page", val)}
                  options={pageSelectOptions}
                  placeholder="Select page…"
                  className="w-52 shrink-0"
                />
              )}

              {linkType === "product" && (
                <CustomSelect
                  value={item.linkRefSlug ?? ""}
                  onChange={(val) => setEntityRef(index, "product", val)}
                  options={productSelectOptions}
                  placeholder="Select product…"
                  className="w-52 shrink-0"
                />
              )}

              {linkType === "category" && (
                <CustomSelect
                  value={item.linkRefSlug ?? ""}
                  onChange={(val) => setEntityRef(index, "category", val)}
                  options={categorySelectOptions}
                  placeholder="Select category…"
                  className="w-52 shrink-0"
                />
              )}

              {linkType === "brand" && (
                <CustomSelect
                  value={item.linkRefSlug ?? ""}
                  onChange={(val) => setEntityRef(index, "brand", val)}
                  options={brandSelectOptions}
                  placeholder="Select brand…"
                  className="w-52 shrink-0"
                />
              )}

              {linkType === "anchor" && (
                <input
                  className={`${inputClass} flex-1 min-w-[180px] font-mono`}
                  value={item.href}
                  placeholder="#section-id"
                  onChange={(e) => update(index, { href: e.target.value })}
                />
              )}

              {linkType === "email" && (
                <input
                  className={`${inputClass} flex-1 min-w-[180px] font-mono`}
                  value={item.href.replace(/^mailto:/, "")}
                  placeholder="name@example.com"
                  onChange={(e) => update(index, { href: `mailto:${e.target.value}` })}
                />
              )}

              {linkType === "phone" && (
                <input
                  className={`${inputClass} flex-1 min-w-[180px] font-mono`}
                  value={item.href.replace(/^tel:/, "")}
                  placeholder="+1 555 000 1234"
                  onChange={(e) => update(index, { href: `tel:${e.target.value}` })}
                />
              )}

              {/* Submenu Layout Type */}
              <CustomSelect
                value={item.type ?? "none"}
                onChange={(val) =>
                  update(index, { type: val === "none" ? undefined : (val as NavItem["type"]) })
                }
                options={SUBMENU_TYPE_OPTIONS}
                className="w-36 shrink-0"
              />

              {/* Options & Action Control Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(item.isNew)}
                    onChange={(e) => update(index, { isNew: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>&quot;New&quot; Badge</span>
                </label>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUpIcon className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDownIcon className="w-3.5 h-3.5" />
                  </button>

                  {depth < 2 && (
                    <button
                      type="button"
                      onClick={() => addChild(index)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors"
                      title="Add child sub-link"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>Sub-link</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 transition-colors"
                    title="Remove item"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Render Nested Children Recursive */}
            {item.children && item.children.length > 0 && (
              <div className="pt-2">
                <NavItemEditor
                  items={item.children}
                  onChange={(children) => update(index, { children })}
                  options={options}
                  depth={depth + 1}
                />
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addTop}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 text-xs font-extrabold flex items-center justify-center gap-2 transition-all bg-white/50 dark:bg-slate-900/50"
      >
        <PlusIcon className="w-4 h-4" />
        <span>Add Root Navigation Item</span>
      </button>
    </div>
  );
};

export default NavItemEditor;
