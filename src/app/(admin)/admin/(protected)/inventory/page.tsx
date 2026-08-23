import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getInventoryProducts } from "@/lib/firebase/repositories/products";
import StockInput from "./StockInput";
import { ExclamationTriangleIcon, CubeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const products = await getInventoryProducts();
  const lowStock = products.filter((p) => p.stock <= (p.lowStockThreshold ?? 5));

  return (
    <div className="space-y-6">
      {/* Executive Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
            <span>CATALOG</span>
            <span>/</span>
            <span className="text-indigo-600 dark:text-indigo-400">INVENTORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-3">
            <span>Inventory Control</span>
            <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              {products.length} Tracked Items
            </span>
          </h1>
        </div>

        {lowStock.length > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold shrink-0">
            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{lowStock.length} product{lowStock.length === 1 ? "" : "s"} low on stock</span>
          </div>
        )}
      </div>

      {/* Master Inventory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-mono uppercase text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-bold">Product Item</th>
                <th className="py-3.5 px-4 font-bold">SKU</th>
                <th className="py-3.5 px-4 font-bold">Current Stock</th>
                <th className="py-3.5 px-4 font-bold">Low Threshold</th>
                <th className="py-3.5 px-4 font-bold">Update Inventory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {products.map((p) => {
                const imageUrl = p.images?.[0];
                const lowStockThreshold = p.lowStockThreshold ?? 5;
                const isOutOfStock = p.stock === 0;
                const isLowStock = p.stock > 0 && p.stock <= lowStockThreshold;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center font-bold text-sm text-indigo-600 dark:text-indigo-400">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={p.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <CubeIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/admin/products/${p.id}/edit` as any}
                            className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block"
                          >
                            {p.name}
                          </Link>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ID: {p.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                      {p.sku ?? "—"}
                    </td>

                    <td className="py-3.5 px-4">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
                          🔴 Out of stock (0)
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                          <ExclamationTriangleIcon className="w-3 h-3 text-amber-600" />
                          Low stock ({p.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60">
                          <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                          {p.stock} units
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      {lowStockThreshold} units
                    </td>

                    <td className="py-3.5 px-4">
                      <StockInput id={p.id} stock={p.stock} />
                    </td>
                  </tr>
                );
              })}

              {!products.length && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 italic text-xs">
                    No inventory-tracked products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
