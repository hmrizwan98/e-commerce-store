"use client";

import dynamic from "next/dynamic";

// next/dynamic's `ssr: false` option is only allowed from a Client Component,
// so this thin wrapper lets the (Server Component) home page keep rendering
// DiscoverMoreSlider client-only without itself becoming a Client Component.
const DiscoverMoreSlider = dynamic(() => import("@/components/DiscoverMoreSlider"), {
  ssr: false,
});

export default DiscoverMoreSlider;
