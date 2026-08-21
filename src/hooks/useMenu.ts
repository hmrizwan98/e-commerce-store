"use client";

import { useEffect, useState } from "react";
import { fetchMenu } from "@/lib/firebase/client-data/menus";
import { useTenantId } from "@/lib/tenant/TenantContext";
import { useMenuContext, DEFAULT_HEADER_ITEMS, DEFAULT_FOOTER_ITEMS } from "@/lib/tenant/MenuContext";
import type { NavItemType } from "@/shared/Navigation/NavigationItem";

/**
 * Returns Firestore-backed menu (`header` or `footer`). Initial state is fed
 * directly from server-side pre-fetched MenuContext to ensure zero-delay SSR
 * and eliminate layout shifts/flashes on page load.
 */
export function useMenu(id: "header" | "footer"): NavItemType[] {
  const tenantId = useTenantId();
  const menuContext = useMenuContext();

  const contextItems = id === "header" ? menuContext.headerItems : menuContext.footerItems;
  const fallback = id === "header" ? DEFAULT_HEADER_ITEMS : DEFAULT_FOOTER_ITEMS;
  const initial = contextItems.length ? contextItems : fallback;

  const [items, setItems] = useState<NavItemType[]>(initial);

  useEffect(() => {
    let active = true;
    if (contextItems.length > 0) {
      setItems(contextItems);
    }
    fetchMenu(id, tenantId)
      .then((data) => {
        if (active && data && data.length > 0) {
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
