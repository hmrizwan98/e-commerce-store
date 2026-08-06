import React from "react";
import Link from "next/link";
import { getOrderBulkHistory } from "@/lib/firebase/repositories/order-bulk-operations";
import OrderExportPanel from "./OrderExportPanel";

export const dynamic = "force-dynamic";

export default async function OrderExportPage() {
  const history = await getOrderBulkHistory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order Export</h1>
        <Link href={"/admin/orders" as any} className="text-sm font-medium hover:underline">
          Back to orders
        </Link>
      </div>
      <OrderExportPanel history={history} />
    </div>
  );
}
