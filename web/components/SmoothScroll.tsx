"use client";

import { useEffect } from "react";
import { ensureGsap } from "@/lib/gsap";

/**
 * Site-wide smooth scrolling (Lenis), synced to GSAP's ticker/ScrollTrigger
 * — needed now that most sections use ScrollTrigger-driven reveals, so
 * their trigger positions stay in sync with whatever actually moved the
 * page, and the homepage hero's scroll-scrubbed sequence reads as fluid
 * rather than jumping between a mouse wheel's discrete deltas.
 *
 * A previous version of this component was removed after users reported
 * the whole site feeling laggy — that came from too-slow easing
 * (duration 0.8) stacking with per-frame overhead. This version keeps the
 * easing short enough that input still feels close to 1:1, while still
 * smoothing out wheel jitter for ScrollTrigger.
 *
 * Renders nothing itself; it's a side-effect-only component mounted once
 * near the root layout. Respects prefers-reduced-motion out of the box
 * (Lenis's own `respectReducedMotion`, on by default).
 */
export default function SmoothScroll() {
  useEffect(() => {
    let cancelled = false;
    let lenis: import("lenis").default | undefined;
    let tickerFn: ((time: number) => void) | undefined;

    (async () => {
      const [{ default: Lenis }] = await Promise.all([import("lenis")]);
      if (cancelled) return;

      const { gsap, ScrollTrigger } = ensureGsap();

      lenis = new Lenis({
        // Short duration: the eased scroll position catches up to real
        // input almost immediately, so it smooths wheel jitter without
        // reading as sluggish/laggy input.
        duration: 0.6,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1,
      });

      lenis.on("scroll", ScrollTrigger.update);

      tickerFn = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      // Lenis already smooths the scroll itself — let GSAP's ticker fire
      // every frame without its own lag-smoothing correction fighting it.
      gsap.ticker.lagSmoothing(0);
    })();

    return () => {
      cancelled = true;
      if (tickerFn) {
        const fn = tickerFn;
        ensureGsap().gsap.ticker.remove(fn);
      }
      lenis?.destroy();
    };
  }, []);

  return null;
}
