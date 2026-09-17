"use client";

import { useLayoutEffect, useRef } from "react";
import { ensureGsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Count-up statistic: fades/rises in and counts 0 → value once, the first
 * time it enters the viewport. Not currently used on any page — this
 * site deliberately avoids showing invented numbers (client counts,
 * ratings, etc.) it can't back up (see GoogleReviews.tsx), so this
 * component is here for whenever a real figure exists to show.
 */
export default function AnimatedStats({
  value,
  suffix = "",
  label,
  duration = 1.6,
}: {
  value: number;
  suffix?: string;
  label: string;
  duration?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    const numEl = numberRef.current;
    if (!root || !numEl) return;

    if (reduceMotion) {
      numEl.textContent = `${value}${suffix}`;
      return;
    }

    const { gsap, ScrollTrigger } = ensureGsap();
    gsap.set(root, { opacity: 0, y: 20 });

    const counter = { val: 0 };
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top 80%",
      once: true,
      onEnter: () => {
        gsap.to(root, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
        gsap.to(counter, {
          val: value,
          duration,
          ease: "power2.out",
          onUpdate: () => {
            numEl.textContent = `${Math.round(counter.val)}${suffix}`;
          },
        });
      },
    });

    return () => trigger.kill();
  }, [value, suffix, duration, reduceMotion]);

  return (
    <div ref={rootRef} className="text-center">
      <span ref={numberRef} className="block font-display text-4xl font-bold text-charcoal">
        0{suffix}
      </span>
      <span className="mt-2 block font-grotesk text-sm uppercase tracking-widest2 text-charcoal/60">
        {label}
      </span>
    </div>
  );
}
