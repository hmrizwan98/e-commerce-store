"use client";

import React from "react";
import type { NavItem, NavLinkType } from "@/types/nav";

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
  "px-2 py-1 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";

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
    // page/product/category/brand: no selection yet, href stays empty until picked
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
            className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 space-y-2"
            style={{ marginLeft: depth * 16 }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <input
                className={inputClass}
                value={item.name}
                placeholder="Label"
                onChange={(e) => update(index, { name: e.target.value })}
              />

              <select
                className={inputClass}
                value={linkType}
                onChange={(e) => setLinkType(index, e.target.value as NavLinkType)}
              >
                <option value="manual">Link Type: External URL</option>
                <option value="page">Link Type: Internal Page</option>
                <option value="product">Link Type: Product</option>
                <option value="category">Link Type: Category</option>
                <option value="brand">Link Type: Brand</option>
                <option value="anchor">Link Type: Anchor</option>
                <option value="email">Link Type: Email</option>
                <option value="phone">Link Type: Phone</option>
              </select>

              {linkType === "manual" && (
                <input
                  className={inputClass}
                  value={item.href}
                  placeholder="/path or https://..."
                  onChange={(e) => update(index, { href: e.target.value })}
                />
              )}

              {linkType === "page" && (
                <select
                  className={inputClass}
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
                  className={inputClass}
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
                  className={inputClass}
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
                  className={inputClass}
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
                  className={inputClass}
                  value={item.href}
                  placeholder="#section-id"
                  onChange={(e) => update(index, { href: e.target.value })}
                />
              )}

              {linkType === "email" && (
                <input
                  className={inputClass}
                  value={item.href.replace(/^mailto:/, "")}
                  placeholder="name@example.com"
                  onChange={(e) => update(index, { href: `mailto:${e.target.value}` })}
                />
              )}

              {linkType === "phone" && (
                <input
                  className={inputClass}
                  value={item.href.replace(/^tel:/, "")}
                  placeholder="+1 555 000 1234"
                  onChange={(e) => update(index, { href: `tel:${e.target.value}` })}
                />
              )}

              <select
                className={inputClass}
                value={item.type ?? "none"}
                onChange={(e) =>
                  update(index, { type: e.target.value === "none" ? undefined : (e.target.value as NavItem["type"]) })
                }
              >
                <option value="none">Link</option>
                <option value="dropdown">Dropdown</option>
                <option value="megaMenu">Mega menu</option>
              </select>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={Boolean(item.isNew)}
                  onChange={(e) => update(index, { isNew: e.target.checked })}
                />
                &quot;New&quot; badge
              </label>
              {linkType === "manual" && (
                <>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={Boolean(item.targetBlank)}
                      onChange={(e) => update(index, { targetBlank: e.target.checked })}
                    />
                    Open in new tab
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={Boolean(item.nofollow)}
                      onChange={(e) => update(index, { nofollow: e.target.checked })}
                    />
                    NoFollow
                  </label>
                </>
              )}
              <div className="flex items-center gap-1 ml-auto text-xs">
                <button type="button" onClick={() => move(index, -1)} className="px-2 py-1 border rounded">
                  ↑
                </button>
                <button type="button" onClick={() => move(index, 1)} className="px-2 py-1 border rounded">
                  ↓
                </button>
                <button type="button" onClick={() => addChild(index)} className="px-2 py-1 border rounded">
                  + Child
                </button>
                <button type="button" onClick={() => remove(index)} className="px-2 py-1 border rounded text-red-600">
                  Remove
                </button>
              </div>
            </div>

            {item.children && item.children.length > 0 && (
              <NavItemEditor
                items={item.children}
                depth={depth + 1}
                options={options}
                onChange={(children) => update(index, { children })}
              />
            )}
          </div>
        );
      })}

      {depth === 0 && (
        <button
          type="button"
          onClick={addTop}
          className="px-4 py-2 text-sm rounded-full border border-neutral-300 dark:border-neutral-700"
        >
          + Add menu item
        </button>
      )}
    </div>
  );
};

export default NavItemEditor;
