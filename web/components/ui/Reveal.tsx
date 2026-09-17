"use client";

import { useLayoutEffect, useRef } from "react";
import { ensureGsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Site-wide scroll-reveal primitives, built on GSAP + ScrollTrigger:
 * opacity 0→1, y 40px→0 (24px for staggered list items), a long gentle
 * power4.out deceleration, 1.2s, firing once the element crosses ~80%
 * up the viewport — the same "global scroll reveal" every section
 * after the hero uses, centralized here so no component duplicates
 * the GSAP setup itself.
 *
 * A server page that exports `metadata` must stay a server component, so
 * GSAP can't live in the page file itself — these thin client wrappers
 * let a server page compose scroll animation around otherwise-static JSX.
 */
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    const { gsap, ScrollTrigger } = ensureGsap();
    gsap.set(el, { opacity: 0, y: 40 });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      once: true,
      onEnter: () =>
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power4.out",
        }),
    });

    return () => trigger.kill();
  }, [reduceMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Wraps a grid/list container; each direct child should be a <RevealItem>
 * so they fade/rise in with a stagger together as the container enters
 * view. */
export function RevealStagger({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    const { gsap, ScrollTrigger } = ensureGsap();
    const items = el.querySelectorAll<HTMLElement>("[data-reveal-item]");
    if (items.length === 0) return;

    gsap.set(items, { opacity: 0, y: 24 });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      once: true,
      onEnter: () =>
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power4.out",
          stagger: 0.12,
        }),
    });

    return () => trigger.kill();
  }, [reduceMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** One item inside a <RevealStagger> — has no trigger of its own; the
 * parent stagger drives its timing. Renders visible immediately when
 * reduced motion is preferred (the parent skips setting it hidden too). */
export function RevealItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-reveal-item className={className}>
      {children}
    </div>
  );
}
