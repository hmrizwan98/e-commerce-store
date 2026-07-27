"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { adjustProductStock } from "../products/actions";

const StockInput: React.FC<{ id: string; stock: number }> = ({ id, stock }) => {
  const router = useRouter();
  const [value, setValue] = useState(String(stock));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await adjustProductStock(id, Number(value) || 0);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 px-2 py-1 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
      />
      <button
        onClick={save}
        disabled={saving || Number(value) === stock}
        className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-40"
      >
        {saving ? "…" : "Save"}
      </button>
    </div>
  );
};

export default StockInput;
