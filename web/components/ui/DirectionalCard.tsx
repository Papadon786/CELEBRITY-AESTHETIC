"use client";

import { useLayoutEffect, useRef } from "react";
import { ensureGsap, pickResponsive, RESPONSIVE } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Alternating left/right card entrance — the site's standard for card
 * grids and service tiles. Pass `index` and it alternates left/right
 * automatically (even = left, odd = right); pass an explicit `direction`
 * for a two-column image/text section instead.
 *
 * Distance is picked once at trigger time from the current viewport width
 * (mobile/tablet/desktop) — same motion concept everywhere, just smaller
 * on smaller screens, never disabled. Uses `x`/`opacity` transforms only
 * (no layout properties), so it never causes horizontal overflow as long
 * as an ancestor clips it — see the global `overflow-x: hidden` safety
 * net in globals.css.
 */
export default function DirectionalCard({
  children,
  index = 0,
  direction,
  delay = 0,
  className = "",
  id,
}: {
  children: React.ReactNode;
  index?: number;
  direction?: "left" | "right";
  /** Extra stagger delay in seconds, for manually-sequenced groups. */
  delay?: number;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    const { gsap, ScrollTrigger } = ensureGsap();
    const dir = direction ?? (index % 2 === 0 ? "left" : "right");
    const distance = pickResponsive(RESPONSIVE.directional);
    const fromX = dir === "left" ? -distance : distance;

    gsap.set(el, { opacity: 0, x: fromX, y: 16 });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      once: true,
      onEnter: () =>
        gsap.to(el, {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 1.2,
          delay,
          ease: "power4.out",
        }),
    });

    return () => trigger.kill();
  }, [index, direction, delay, reduceMotion]);

  return (
    <div ref={ref} id={id} className={className}>
      {children}
    </div>
  );
}
