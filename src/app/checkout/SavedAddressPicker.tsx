"use client";

import React from "react";
import { PlusIcon, TrashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import type { SavedAddress } from "@/lib/checkout/saved-profile";

/** Saved addresses (from this device) as selectable cards + "Use a new address". */
export default function SavedAddressPicker({
  addresses,
  selectedId,
  onSelect,
  onAddNew,
  onRemove,
}: {
  addresses: SavedAddress[];
  selectedId: string | null;
  onSelect: (a: SavedAddress) => void;
  onAddNew: () => void;
  onRemove: (a: SavedAddress) => void;
}) {
  if (!addresses.length) return null;
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Your saved addresses</legend>
      {addresses.map((a) => {
        const selected = a.id === selectedId;
        return (
          <div
            key={a.id}
            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${
              selected ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
            }`}
          >
            <label className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer">
              <input
                type="radio"
                name="saved-address"
                className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500/30"
                checked={selected}
                onChange={() => onSelect(a)}
              />
              <span className="min-w-0 text-sm">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  {a.fullName}
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {a.addressType === "office" ? "Office" : "Home"}
                  </span>
                  {selected && <CheckCircleIcon className="w-4 h-4 text-indigo-600" aria-hidden="true" />}
                </span>
                <span className="block text-slate-600 dark:text-slate-300 truncate">
                  {[a.line1, a.landmark || a.line2, a.city, a.state].filter(Boolean).join(", ")}
                </span>
              </span>
            </label>
            <button
              type="button"
              onClick={() => onRemove(a)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              aria-label={`Remove saved address for ${a.fullName}`}
              title="Remove from this device"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={onAddNew}
        className={`w-full flex items-center justify-center gap-1.5 p-3 rounded-xl border border-dashed text-xs font-bold transition-colors ${
          selectedId === null ? "border-indigo-500 text-indigo-700 dark:text-indigo-300 bg-indigo-50/40 dark:bg-indigo-950/20" : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400"
        }`}
      >
        <PlusIcon className="w-4 h-4" />
        Use a new address
      </button>
      <p className="text-[11px] text-slate-500">Pick an address, then edit any field below if something changed.</p>
    </fieldset>
  );
}
