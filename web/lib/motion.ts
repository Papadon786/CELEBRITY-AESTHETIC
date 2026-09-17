import type { Variants } from "framer-motion";

/**
 * Shared framer-motion variants. All respect prefers-reduced-motion because
 * framer-motion's `useReducedMotion` hook (used in components that need to
 * branch) automatically shortens/removes transforms, and because these
 * variants keep transforms subtle (small y-offsets, opacity) rather than
 * relying on motion to convey information.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.04 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export const viewportOnce = { once: true, margin: "-80px" };
