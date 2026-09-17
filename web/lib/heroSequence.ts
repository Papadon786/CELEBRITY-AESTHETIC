/**
 * Config for the hero's scroll-driven canvas image sequence.
 *
 * Frames live in /public/hero-sequence/frame-001.webp … frame-0{TOTAL}.webp
 * (real render sequence — face → skin cross-section → laser → back to
 * face). To swap in a revised sequence, replace files with the same
 * zero-padded names/count; everything below keeps working unchanged.
 * scripts/gen-placeholder-frames.mjs can regenerate throwaway placeholders
 * if you ever need to test the mechanism without the real frames.
 */
export const TOTAL_FRAMES = 30;

export function frameSrc(n: number): string {
  return `/hero-sequence/frame-${String(n).padStart(3, "0")}.webp`;
}

/** How many frames at the tail of the sequence should race by instead of
 * scrubbing at the same rate as the rest. */
const FAST_TAIL_FRAMES = 2;
/** How much faster that tail segment advances per unit of scroll progress. */
const FAST_TAIL_SPEED = 4;

/**
 * Maps ScrollTrigger's linear progress (0..1) to a frame position (1..
 * TOTAL_FRAMES). Uniform across most of the sequence, but the final
 * FAST_TAIL_FRAMES frames burn through FAST_TAIL_SPEED× faster — reaching
 * frame TOTAL_FRAMES well before scroll progress hits 1, then holding
 * there for the remainder (right up to the pin releasing).
 */
export function progressToFramePosition(progress: number): number {
  const breakFrame = TOTAL_FRAMES - FAST_TAIL_FRAMES;
  const breakProgress = (breakFrame - 1) / (TOTAL_FRAMES - 1);

  if (progress <= breakProgress) {
    return 1 + progress * (TOTAL_FRAMES - 1);
  }

  const tailProgress = progress - breakProgress;
  const tailSpan = 1 - breakProgress;
  const scaledTailProgress = Math.min(tailSpan, tailProgress * FAST_TAIL_SPEED);

  return breakFrame + (scaledTailProgress / tailSpan) * FAST_TAIL_FRAMES;
}

/** Total scroll distance the sequence scrubs over, as a % of the pinned
 * element's own height (GSAP ScrollTrigger "+=N%" syntax) — scales with
 * viewport automatically instead of a hardcoded pixel value. */
export const SCROLL_DISTANCE = "+=380%";
