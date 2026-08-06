import React from "react";
import Link from "next/link";
import { getProductBulkHistory } from "@/lib/firebase/repositories/product-bulk-operations";
import BulkActionsPanel from "./BulkActionsPanel";

export const dynamic = "force-dynamic";

export default async function ProductBulkPage() {
  const history = await getProductBulkHistory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bulk Import / Export</h1>
        <Link href={"/admin/products" as any} className="text-sm font-medium hover:underline">
          Back to products
        </Link>
      </div>
      <BulkActionsPanel history={history} />
    </div>
  );
}
