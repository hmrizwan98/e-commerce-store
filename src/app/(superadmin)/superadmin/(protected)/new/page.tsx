import React from "react";
import StoreCreationWizard from "../StoreCreationWizard";
import { getPlatformBaseUrl } from "@/lib/platform/base-url";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

export default function NewStorePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
          <PlusCircleIcon className="w-6 h-6 text-primary-6000" />
          <span>Provision New Tenant Store</span>
        </h1>
        <p className="text-xs text-neutral-500 font-mono">Configure store details, owner credentials, and base theme</p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">
        <StoreCreationWizard platformBaseUrl={getPlatformBaseUrl()} />
      </div>
    </div>
  );
}

