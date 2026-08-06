import React from "react";
import Link from "next/link";
import { getCustomerExportHistory } from "@/lib/firebase/repositories/customer-export-operations";
import CustomerExportPanel from "./CustomerExportPanel";

export const dynamic = "force-dynamic";

export default async function CustomerExportPage() {
  const history = await getCustomerExportHistory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customer Export</h1>
        <Link href={"/admin/customers" as any} className="text-sm font-medium hover:underline">
          Back to customers
        </Link>
      </div>
      <CustomerExportPanel history={history} />
    </div>
  );
}
