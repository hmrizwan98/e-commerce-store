"use client";

import React, { useState } from "react";
import NavItemEditor, { type LinkPickerOptions } from "./NavItemEditor";
import { updateMenu } from "./actions";
import type { NavItem } from "@/types/nav";
import { CheckIcon } from "@heroicons/react/24/outline";

const MenuEditor: React.FC<{
  menuId: "header" | "footer";
  initialItems: NavItem[];
  options: LinkPickerOptions;
}> = ({ menuId, initialItems, options }) => {
  const [items, setItems] = useState<NavItem[]>(initialItems);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateMenu(menuId, items);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <NavItemEditor items={items} onChange={setItems} options={options} />
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? `Saving ${menuId === "header" ? "Header" : "Footer"} Menu…` : `Save ${menuId === "header" ? "Header Navigation" : "Footer Navigation"}`}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200/60">
            <CheckIcon className="w-4 h-4" />
            {menuId === "header" ? "Header" : "Footer"} Menu saved successfully!
          </span>
        )}
      </div>
    </div>
  );
};

export default MenuEditor;
