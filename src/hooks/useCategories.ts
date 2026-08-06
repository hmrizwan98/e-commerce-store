"use client";

import { useEffect, useState } from "react";
import { fetchActiveCategories } from "@/lib/firebase/client-data/categories";
import { useTenantId } from "@/lib/tenant/TenantContext";
import type { Category } from "@/types/category";

/** Client-side categories fetch for deep client components (header dropdowns). */
export function useCategories(): Category[] {
  const tenantId = useTenantId();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let active = true;
    fetchActiveCategories(tenantId)
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch((error) => {
        console.error("Failed to load categories from Firestore", error);
      });
    return () => {
      active = false;
    };
  }, [tenantId]);

  return categories;
}
