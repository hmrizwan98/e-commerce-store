"use client";

import { useEffect, useState } from "react";
import { fetchMenu } from "@/lib/firebase/client-data/menus";
import { useTenantId } from "@/lib/tenant/TenantContext";
import { useMenuContext } from "@/lib/tenant/MenuContext";
import type { NavItemType } from "@/shared/Navigation/NavigationItem";

/**
 * Returns Firestore-backed menu (`header` or `footer`). Initial state is fed
 * directly from server-side pre-fetched MenuContext to ensure zero-delay SSR
 * and eliminate layout shifts/flashes on page load.
 */
export function useMenu(id: "header" | "footer"): NavItemType[] {
  const tenantId = useTenantId();
  const menuContext = useMenuContext();

  // MenuProvider already resolved "never saved -> starter menu", so an empty list here is the
  // admin's own (emptied) menu and is shown as-is.
  const contextItems = id === "header" ? menuContext.headerItems : menuContext.footerItems;

  const [items, setItems] = useState<NavItemType[]>(contextItems);

  useEffect(() => {
    let active = true;
    setItems(contextItems);
    fetchMenu(id, tenantId)
      .then((data) => {
        // null = never saved: keep the starter menu from MenuProvider.
        if (active && data !== null) {
          setItems(data as unknown as NavItemType[]);
        }
      })
      .catch((error) => {
        console.error(`Failed to load "${id}" menu from Firestore`, error);
      });
    return () => {
      active = false;
    };
  }, [id, tenantId, contextItems]);

  return items;
}
