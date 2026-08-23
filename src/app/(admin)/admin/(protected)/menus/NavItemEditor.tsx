"use client";

import React from "react";
import type { NavItem, NavLinkType } from "@/types/nav";
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

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const linkType: NavLinkType = item.linkType ?? "manual";

        return (
          <div
            key={item.id}
            className="border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/60 shadow-2xs space-y-3"
            style={{ marginLeft: depth * 20 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Item Name Input */}
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <span className="text-slate-400 font-mono text-xs shrink-0">#{index + 1}</span>
                <input
                  className={`${inputClass} flex-1 font-bold`}
                  value={item.name}
                  placeholder="Navigation Label (e.g. Shop)"
                  onChange={(e) => update(index, { name: e.target.value })}
                />
              </div>

              {/* Link Type Selector */}
              <select
                className={`${inputClass} shrink-0 cursor-pointer`}
                value={linkType}
                onChange={(e) => setLinkType(index, e.target.value as NavLinkType)}
              >
                <option value="manual">🔗 External URL</option>
                <option value="page">📄 Internal Page</option>
                <option value="product">📦 Product</option>
                <option value="category">🏷️ Category</option>
                <option value="brand">🏬 Brand</option>
                <option value="anchor">⚓ Anchor (#section)</option>
                <option value="email">✉️ Email</option>
                <option value="phone">📞 Phone</option>
              </select>

              {/* Target Selector / Input */}
              {linkType === "manual" && (
                <input
                  className={`${inputClass} flex-1 min-w-[180px] font-mono`}
                  value={item.href}
                  placeholder="/path or https://..."
                  onChange={(e) => update(index, { href: e.target.value })}
                />
              )}

              {linkType === "page" && (
                <select
                  className={`${inputClass} flex-1 min-w-[180px] cursor-pointer`}
                  value={item.linkRefSlug ?? ""}
                  onChange={(e) => setEntityRef(index, "page", e.target.value)}
                >
                  <option value="">Select page…</option>
                  {options.pages.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.title}
                    </option>
                  ))}
                </select>
              )}

              {linkType === "product" && (
                <select
                  className={`${inputClass} flex-1 min-w-[180px] cursor-pointer`}
                  value={item.linkRefSlug ?? ""}
                  onChange={(e) => setEntityRef(index, "product", e.target.value)}
                >
                  <option value="">Select product…</option>
                  {options.products.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}

              {linkType === "category" && (
                <select
                  className={`${inputClass} flex-1 min-w-[180px] cursor-pointer`}
                  value={item.linkRefSlug ?? ""}
                  onChange={(e) => setEntityRef(index, "category", e.target.value)}
                >
                  <option value="">Select category…</option>
                  {options.categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}

              {linkType === "brand" && (
                <select
                  className={`${inputClass} flex-1 min-w-[180px] cursor-pointer`}
                  value={item.linkRefSlug ?? ""}
                  onChange={(e) => setEntityRef(index, "brand", e.target.value)}
                >
                  <option value="">Select brand…</option>
                  {options.brands.map((b) => (
                    <option key={b.slug} value={b.slug}>
                      {b.name}
                    </option>
                  ))}
                </select>
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
              <select
                className={`${inputClass} shrink-0 cursor-pointer`}
                value={item.type ?? "none"}
                onChange={(e) =>
                  update(index, { type: e.target.value === "none" ? undefined : (e.target.value as NavItem["type"]) })
                }
              >
                <option value="none">Single Link</option>
                <option value="dropdown">Dropdown Menu</option>
                <option value="megaMenu">Mega Menu</option>
              </select>

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
