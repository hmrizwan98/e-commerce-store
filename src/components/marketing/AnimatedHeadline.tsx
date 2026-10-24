import React from "react";

/** One run of words in the headline. `gradient: true` paints the run with the
 * brand gradient (primary -> indigo -> cyan) spread across its words. */
export interface HeadlineSegment {
  text: string;
  gradient?: boolean;
}

interface AnimatedHeadlineProps {
  segments: HeadlineSegment[];
  className?: string;
  /** Delay before the first word starts, in ms. */
  startDelayMs?: number;
  /** Gap between consecutive words, in ms. */
  stepMs?: number;
}

const GRADIENT_IMAGE =
  "linear-gradient(to right, rgb(var(--c-primary-600)), #4f46e5, #06b6d4)";

/**
 * Word-by-word reveal for a page headline (Server Component - no JS needed).
 *
 * - No layout shift: every word is rendered in its final position from the first
 *   paint; only opacity/transform animate (CSS `.mkt-word` in globals.css).
 * - Accessible: the <h1> carries the full sentence as its `aria-label` and the
 *   animated word spans are `aria-hidden`, so screen readers announce it once,
 *   unsplit. The visible words stay real text, so crawlers still index the
 *   heading exactly once (no duplicated visually-hidden copy).
 * - Reduced motion: `@media (prefers-reduced-motion: reduce)` disables the
 *   animation, so the full headline shows immediately.
 * - Gradient runs: each word gets the run's gradient scaled to the whole run and
 *   offset by its index, so the colour flows across words instead of restarting
 *   (per-word `background-clip: text` avoids the browser bugs of animating
 *   children inside a single clipped parent).
 */
export default function AnimatedHeadline({
  segments,
  className,
  startDelayMs = 80,
  stepMs = 70,
}: AnimatedHeadlineProps) {
  const fullText = segments.map((s) => s.text.trim()).join(" ");
  let wordIndex = 0;

  return (
    <h1 className={className} aria-label={fullText}>
      <span aria-hidden="true">
        {segments.map((segment, segIdx) => {
          const words = segment.text.trim().split(/\s+/);
          const count = words.length;
          return (
            <React.Fragment key={segIdx}>
              {segIdx > 0 && " "}
              {words.map((word, i) => {
                const delay = startDelayMs + wordIndex++ * stepMs;
                const style: React.CSSProperties = { animationDelay: `${delay}ms` };
                if (segment.gradient) {
                  style.backgroundImage = GRADIENT_IMAGE;
                  style.backgroundSize = `${count * 100}% 100%`;
                  style.backgroundPosition = `${count > 1 ? (i / (count - 1)) * 100 : 0}% 0`;
                }
                return (
                  <React.Fragment key={i}>
                    {i > 0 && " "}
                    <span
                      className={`mkt-word${segment.gradient ? " text-transparent bg-clip-text" : ""}`}
                      style={style}
                    >
                      {word}
                    </span>
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );
        })}
      </span>
    </h1>
  );
}
