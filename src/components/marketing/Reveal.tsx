"use client";

import React, { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Extra delay (ms) once the element enters the viewport - for light staggering. */
  delayMs?: number;
}

type RevealState = "static" | "hidden" | "shown";

/**
 * Subtle fade + slide-up when a block scrolls into view.
 *
 * Progressive enhancement, so content is never lost:
 * - Server render and first client render are fully visible ("static") - no JS,
 *   slow hydration or a missing IntersectionObserver leaves the content as-is.
 * - After mount, only blocks still BELOW the viewport are hidden and then animated
 *   in; anything already on screen (or scrolled past, e.g. via an anchor link) stays
 *   put, so there's no visible flash.
 * - `prefers-reduced-motion: reduce` skips the effect entirely.
 * Only opacity/transform change, so the layout never shifts.
 */
export default function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<RevealState>("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setState("hidden");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const motionClass =
    state === "hidden"
      ? "opacity-0 translate-y-6"
      : state === "shown"
        ? "transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none"
        : "";

  return (
    <div
      ref={ref}
      className={[motionClass, className].filter(Boolean).join(" ") || undefined}
      style={state === "shown" && delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
