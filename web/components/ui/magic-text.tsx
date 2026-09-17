"use client";

import * as React from "react";
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

export interface MagicTextLine {
  text: string;
  /** Extra classes for this line only (e.g. an accent color on a script/CTA line). */
  className?: string;
}

export interface MagicTextProps {
  /** One or more lines, rendered stacked — matches how headlines in this
   * codebase are already authored (an array of lines, occasionally with a
   * differently-styled accent line). Plain strings are also accepted. */
  lines: (string | MagicTextLine)[];
  /**
   * An existing scroll/scrub progress value to reveal words against — pass
   * one mirrored from a GSAP ScrollTrigger (or any other driver) to stay
   * perfectly in sync with a scrubbed animation elsewhere on the page.
   * When omitted, falls back to tracking this element's own position in
   * the viewport (Motion's useScroll), for standalone use outside a
   * pinned/scrubbed section.
   */
  progress?: MotionValue<number>;
  /** [start, end] domain of `progress` across which the words reveal, in
   * whatever units `progress` is expressed in. Defaults to [0, 1]. */
  range?: [number, number];
  className?: string;
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  // Opacity only, by design — no rise, no blur. The "inactive" word floor
  // has to stay clearly legible on its own (this text sits over a
  // photograph with only a gradient scrim behind it, not a flat
  // high-contrast background), so a low floor reads as broken/illegible
  // rather than "subtly de-emphasized" whenever the scroll stalls partway
  // through a beat.
  const opacity = useTransform(progress, range, [0.7, 1]);

  return (
    <motion.span style={{ opacity }} className="inline-block">
      {children}
    </motion.span>
  );
}

/**
 * Word-by-word cinematic reveal. Each word's opacity is a direct function
 * of `progress` over its own slice of `range` — driven by a MotionValue via
 * useTransform, not React state, so scrolling never triggers a re-render
 * here.
 */
export function MagicText({
  lines,
  progress: externalProgress,
  range: externalRange = [0, 1],
  className = "",
}: MagicTextProps) {
  const containerRef = React.useRef<HTMLSpanElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const fallbackProgress = useMotionValue(1);
  const isStandalone = externalProgress === undefined;

  // Only meaningful when no external progress is supplied — avoids paying
  // for a viewport-scroll subscription this component won't use.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "start 0.25"],
  });
  const progress = externalProgress ?? scrollYProgress ?? fallbackProgress;

  // Standalone mode also gets a fade-out as the block scrolls back out the
  // top — tracked separately from the word-level reveal above (which only
  // covers the entrance) and applied to the whole block, so the words
  // still light up left-to-right on the way in without the last ones
  // waiting on an exit that hasn't started yet. When an external progress
  // is supplied (e.g. the Hero), the caller already owns exit/entry via
  // mount/unmount, so this stays a no-op there.
  const { scrollYProgress: transitProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const envelopeOpacity = useTransform(transitProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  const normalized: MagicTextLine[] = React.useMemo(
    () => lines.map((l) => (typeof l === "string" ? { text: l } : l)),
    [lines]
  );
  const totalWords = React.useMemo(
    () =>
      Math.max(
        1,
        normalized.reduce((sum, l) => sum + l.text.split(" ").filter(Boolean).length, 0)
      ),
    [normalized]
  );
  const plainText = React.useMemo(() => normalized.map((l) => l.text).join(" "), [normalized]);

  // Reduced motion: render the complete, real text with no animation and no
  // dependency on scroll — content must be understandable without motion.
  if (prefersReducedMotion) {
    return (
      <span ref={containerRef} className={className}>
        {normalized.map((line, i) => (
          <span key={i} className={`block ${line.className ?? ""}`}>
            {line.text}
          </span>
        ))}
      </span>
    );
  }

  const [rangeStart, rangeEnd] = externalRange;
  let wordIndex = 0;

  return (
    <motion.span
      ref={containerRef}
      style={isStandalone ? { opacity: envelopeOpacity } : undefined}
      className={className}
      aria-label={plainText}
    >
      {normalized.map((line, lineIdx) => (
        <span
          key={lineIdx}
          aria-hidden="true"
          className={`flex flex-wrap gap-y-1 ${line.className ?? ""}`}
        >
          {line.text
            .split(" ")
            .filter(Boolean)
            .map((word, i) => {
              const idx = wordIndex++;
              const start = rangeStart + (idx / totalWords) * (rangeEnd - rangeStart);
              const end = rangeStart + ((idx + 1) / totalWords) * (rangeEnd - rangeStart);
              return (
                <span key={i} className="mr-[0.28em]">
                  <Word progress={progress} range={[start, end]}>
                    {word}
                  </Word>
                </span>
              );
            })}
        </span>
      ))}
    </motion.span>
  );
}
