"use client";

import { useEffect, useState } from "react";
import { fetchActiveCategories } from "@/lib/firebase/client-data/categories";
import type { Category } from "@/types/category";

/** Client-side categories fetch for deep client components (header dropdowns). */
export function useCategories(): Category[] {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let active = true;
    fetchActiveCategories()
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch((error) => {
        console.error("Failed to load categories from Firestore", error);
      });
    return () => {
      active = false;
    };
  }, []);

  return categories;
}
