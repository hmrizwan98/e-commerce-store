"use client";

import React, { useState } from "react";
import NavItemEditor, { type LinkPickerOptions } from "./NavItemEditor";
import { updateMenu } from "./actions";
import type { NavItem } from "@/types/nav";

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
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-full bg-primary-6000 text-white text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save menu"}
        </button>
        {saved && <span className="text-sm text-green-600">Saved.</span>}
      </div>
    </div>
  );
};

export default MenuEditor;
