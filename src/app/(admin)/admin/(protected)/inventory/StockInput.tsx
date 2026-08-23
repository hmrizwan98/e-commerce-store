"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { adjustProductStock } from "../products/actions";
import { CheckIcon } from "@heroicons/react/24/outline";

const StockInput: React.FC<{ id: string; stock: number }> = ({ id, stock }) => {
  const router = useRouter();
  const [value, setValue] = useState(String(stock));
  const [saving, setSaving] = useState(false);

  const isChanged = Number(value) !== stock;

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
        className="w-20 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      />
      <button
        onClick={save}
        disabled={saving || !isChanged}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-2xs ${
          isChanged
            ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95"
            : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60"
        }`}
      >
        {saving ? "Saving…" : (
          <>
            <CheckIcon className="w-3.5 h-3.5" />
            <span>Save</span>
          </>
        )}
      </button>
    </div>
  );
};

export default StockInput;
