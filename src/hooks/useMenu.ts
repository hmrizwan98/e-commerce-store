"use client";

import { useEffect, useState } from "react";
import { fetchMenu } from "@/lib/firebase/client-data/menus";
import type { NavItemType } from "@/shared/Navigation/NavigationItem";

/**
 * Fetches a Firestore-backed menu (`menus/header` or `menus/footer`) for the
 * client-side navigation components. Runs through the client SDK (not the
 * Admin-SDK repository layer) since Header/Footer/MenuBar are deep client
 * components - see Phase 1 plan notes for why this is a deliberate exception.
 */
export function useMenu(id: "header" | "footer"): NavItemType[] {
  const [items, setItems] = useState<NavItemType[]>([]);

  useEffect(() => {
    let active = true;
    fetchMenu(id)
      .then((data) => {
        if (active) setItems(data as unknown as NavItemType[]);
      })
      .catch((error) => {
        console.error(`Failed to load "${id}" menu from Firestore`, error);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return items;
}
