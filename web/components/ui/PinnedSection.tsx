"use client";

import { useLayoutEffect, useRef } from "react";
import { ensureGsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Pins its content for one viewport height while direct descendants
 * marked `data-pin-item` progressively fade/rise in as the user scrolls
 * through — reserved for a single "showcase" moment per page at most, per
 * the site's motion spec ("use this sparingly"). Simplified on small
 * screens (below 1024px): renders as a normal, un-pinned scroll-reveal
 * instead, since a pinned scrub reads as janky on short mobile viewports.
 */
export default function PinnedSection({
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

    const items = el.querySelectorAll<HTMLElement>("[data-pin-item]");
    if (items.length === 0) return;

    const { gsap, ScrollTrigger } = ensureGsap();
    gsap.set(items, { opacity: 0, y: 30 });

    const isPinnable = window.innerWidth >= 1024;

    if (!isPinnable) {
      // Mobile/tablet: a normal staggered reveal instead of a pin+scrub.
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        once: true,
        onEnter: () =>
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
          }),
      });
      return () => trigger.kill();
    }

    const total = items.length;
    const scrollTrigger = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "+=100%",
      pin: true,
      pinSpacing: true,
      scrub: true,
      onUpdate: (self) => {
        items.forEach((item, i) => {
          const itemStart = i / total;
          const itemEnd = (i + 1) / total;
          const p = gsap.utils.clamp(0, 1, (self.progress - itemStart) / (itemEnd - itemStart));
          gsap.set(item, { opacity: p, y: 30 * (1 - p) });
        });
      },
    });

    return () => scrollTrigger.kill();
  }, [reduceMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
