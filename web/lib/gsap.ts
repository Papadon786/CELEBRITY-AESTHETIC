import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/**
 * Single, idempotent GSAP + ScrollTrigger registration point — every
 * scroll-animation component in the site imports gsap/ScrollTrigger from
 * here instead of registering the plugin itself, so the setup happens
 * exactly once no matter how many components use it.
 */
export function ensureGsap() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger };

/**
 * Responsive distance presets shared by every directional/parallax
 * animation, per the site's motion spec: smaller movement on smaller
 * screens, same motion concept everywhere (never disabled on mobile).
 */
export const RESPONSIVE = {
  directional: { mobile: 24, tablet: 44, desktop: 70 },
  y: { mobile: 22, tablet: 32, desktop: 40 },
  parallax: { mobile: 12, tablet: 20, desktop: 30 },
};

export type BreakpointValues = { mobile: number; tablet: number; desktop: number };

/** Picks the right preset for the current viewport width. Called at
 * animation-setup time (not reactively) — a resize while an animation is
 * mid-flight re-measuring isn't worth the complexity this brief doesn't
 * ask for; ScrollTrigger.refresh() (wired globally) recalculates trigger
 * positions on resize regardless. */
export function pickResponsive(values: BreakpointValues): number {
  if (typeof window === "undefined") return values.desktop;
  const w = window.innerWidth;
  if (w < 640) return values.mobile;
  if (w < 1024) return values.tablet;
  return values.desktop;
}
