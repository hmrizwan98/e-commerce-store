"use client";

import React, { createContext, useContext } from "react";

// undefined (not null) is the "no Provider in the tree" sentinel, distinct from a Provider
// that's legitimately rendering with an empty tenantId (e.g. no tenant resolved for this
// request - reserved Super Admin paths, or local dev without a matching store).
const TenantIdContext = createContext<string | undefined>(undefined);

export const TenantProvider: React.FC<{ tenantId: string; children: React.ReactNode }> = ({
  tenantId,
  children,
}) => <TenantIdContext.Provider value={tenantId}>{children}</TenantIdContext.Provider>;

/** For the handful of deep client components that read Firestore directly via the browser SDK (see client-data/*.ts). */
export function useTenantId(): string {
  const tenantId = useContext(TenantIdContext);
  if (tenantId === undefined) {
    throw new Error("useTenantId() called outside <TenantProvider> - check ClientProviders.tsx.");
  }
  return tenantId;
}
