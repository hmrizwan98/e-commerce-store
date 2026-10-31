import React from "react";
import CollectionPageView from "@/components/collection/CollectionPageView";
import { getActiveThemeConfig } from "@/lib/theme/theme-repository";
import type { RawSearchParams } from "@/lib/filters/parse-search-params";

// Filters/sort/pagination are URL-driven (see src/hooks/useFilterParams.ts)
// and resolved against Firestore server-side on every request.
export const dynamic = "force-dynamic";

const PageCollection = async ({ searchParams }: { searchParams: RawSearchParams }) => {
  const theme = await getActiveThemeConfig();
  return <CollectionPageView theme={theme} searchParams={searchParams} />;
};

export default PageCollection;
