import React from "react";
import Link from "next/link";
import { getInventoryProducts } from "@/lib/firebase/repositories/products";
import StockInput from "./StockInput";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const products = await getInventoryProducts();
  const lowStock = products.filter((p) => p.stock <= (p.lowStockThreshold ?? 5));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Inventory</h1>

      {lowStock.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          {lowStock.length} product{lowStock.length === 1 ? "" : "s"} at or below its low-stock threshold.
        </div>
      )}

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Low stock at</th>
              <th className="p-4">Update stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isLow = p.stock <= (p.lowStockThreshold ?? 5);
              return (
                <tr key={p.id} className="border-b border-neutral-100 dark:border-neutral-800/60">
                  <td className="p-4">
                    <Link href={`/admin/products/${p.id}/edit` as any} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="p-4 text-neutral-500">{p.sku ?? "—"}</td>
                  <td className={`p-4 font-medium ${isLow ? "text-red-600" : ""}`}>{p.stock}</td>
                  <td className="p-4 text-neutral-500">{p.lowStockThreshold ?? 5}</td>
                  <td className="p-4">
                    <StockInput id={p.id} stock={p.stock} />
                  </td>
                </tr>
              );
            })}
            {!products.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  No inventory-tracked products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
