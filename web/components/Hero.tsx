"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, type Variants } from "framer-motion";
import { ButtonLink } from "./ui/Button";
import { MagicText } from "./ui/magic-text";
import HeroFrameCanvas, { type HeroFrameCanvasHandle } from "./HeroFrameCanvas";
import {
  SCROLL_DISTANCE,
  TOTAL_FRAMES,
  progressToFramePosition,
} from "@/lib/heroSequence";
import { HERO_BEATS, beatIndexForFrame } from "@/lib/heroBeats";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

// Text-group choreography: fade + subtle rise + blur-to-sharp + a very
// small scale-up. Kept restrained on purpose (no bounce, no big parallax)
// so it reads as quiet editorial motion rather than a flashy effect.
const groupVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

// Direction alternates per beat (via the `custom` prop passed at each
// motion element below): even beats sweep in from the left, odd beats
// from the right, so consecutive headlines don't all enter the same way.
const lineVariants: Variants = {
  hidden: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction * 64,
    y: 10,
    scale: 0.985,
    filter: "blur(6px)",
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    // Long, gentle deceleration (no overshoot) — the same "settles in
    // slowly" curve used elsewhere for premium text reveals — so the
    // sideways sweep reads as smooth glide rather than a quick slide.
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    x: -direction * 48,
    y: -8,
    filter: "blur(4px)",
    transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] },
  }),
};

export default function Hero() {
  const pinRef = useRef<HTMLDivElement>(null);
  const textWrapRef = useRef<HTMLDivElement>(null);
  const canvasHandleRef = useRef<HeroFrameCanvasHandle>(null);
  const [scrollBeatIndex, setScrollBeatIndex] = useState(0);
  const beatIndexRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  // Mirrors the same frame position the canvas paints (see onUpdate below)
  // into a MotionValue, so the headline's word-by-word reveal is driven by
  // the exact same scroll-scrub source as the 3D sequence — no second
  // scroll listener, no state, no re-renders.
  const framePosition = useMotionValue(1);

  // Respect prefers-reduced-motion: skip the pin/scrub entirely and land on
  // the journey's conclusion — the final frame with the closing headline
  // and CTA — rather than forcing the scroll-driven build-up. Derived
  // directly from the media query rather than set via an effect, so there's
  // no extra render cascade and no mismatch between server/client markup.
  const beatIndex = prefersReducedMotion ? HERO_BEATS.length - 1 : scrollBeatIndex;
  const priorityFrame = prefersReducedMotion ? TOTAL_FRAMES : undefined;

  useEffect(() => {
    if (prefersReducedMotion) {
      canvasHandleRef.current?.draw(TOTAL_FRAMES);
      framePosition.set(TOTAL_FRAMES);
      return;
    }

    if (!pinRef.current) return;

    let scrollTrigger: { kill: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const [{ default: gsap }, scrollTriggerModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !pinRef.current) return;

      const { ScrollTrigger } = scrollTriggerModule;
      gsap.registerPlugin(ScrollTrigger);

      scrollTrigger = ScrollTrigger.create({
        trigger: pinRef.current,
        start: "top top",
        end: SCROLL_DISTANCE,
        pin: true,
        pinSpacing: true,
        // Force "fixed" instead of letting ScrollTrigger fall back to
        // transform-based pinning on touch/mobile viewports — that mode
        // applies the transform to <body>, which turns it into a
        // containing block for every position:fixed element on the page
        // (the navbar, the mobile menu), making them drift with scroll
        // instead of staying pinned.
        pinType: "fixed",
        // Reads native scroll position directly (no smooth-scroll layer
        // easing it first) — keeps input-to-frame latency as low as
        // possible everywhere on the site.
        scrub: true,
        onUpdate: (self) => {
          // Fractional position (not rounded) — HeroFrameCanvas cross-
          // fades between the two nearest frames, so motion reads as
          // continuous rather than 30 discrete hard cuts.
          const position = progressToFramePosition(self.progress);
          canvasHandleRef.current?.draw(position);
          framePosition.set(position);

          // Swap the headline/copy "beat" as the scroll crosses into a new
          // frame range — only on actual change, so this isn't setting
          // state on every scroll tick.
          const idx = beatIndexForFrame(position);
          if (idx !== beatIndexRef.current) {
            beatIndexRef.current = idx;
            setScrollBeatIndex(idx);
          }

          // A small continuous drift/fade layered on top of the beat
          // swaps above — set directly via style (not framer-motion,
          // which already owns each line's own transform/opacity) so it
          // never fights the per-beat enter/exit animation, just adds a
          // subtle sense of the text moving with the scroll itself.
          if (textWrapRef.current) {
            const eased = Math.min(1, self.progress * 1.6);
            textWrapRef.current.style.transform = `translateY(${eased * -16}px)`;
            textWrapRef.current.style.opacity = `${1 - eased * 0.35}`;
          }
        },
      });
    })();

    return () => {
      cancelled = true;
      scrollTrigger?.kill();
    };
  }, [prefersReducedMotion, framePosition]);

  const beat = HERO_BEATS[beatIndex];
  // Alternates which side each beat's text sweeps in from, so consecutive
  // headlines don't all enter the same way — read by lineVariants above.
  const direction: 1 | -1 = beatIndex % 2 === 0 ? -1 : 1;

  return (
    <section
      aria-label="Introduction"
      className="relative overflow-hidden border-b border-gold/20"
    >
      <div
        ref={pinRef}
        id="hero-pin-target"
        className="relative h-[100svh] min-h-[560px] w-full bg-ivory"
      >
        {/* Full-screen scroll-driven sequence, behind everything else. No
            fade-in wrapper here on purpose: frame 1 is server-rendered and
            should be visible immediately, even before JS hydrates — an
            opacity-from-0 mount animation would hide it until then. */}
        <div className="absolute inset-0 z-0">
          <HeroFrameCanvas ref={canvasHandleRef} priorityFrame={priorityFrame} />
        </div>

        {/* Black overlay — cinematic depth over the sequence, and the
            contrast base the light text below needs to stay readable
            against any frame in the sequence. Strong enough on the left
            (where the text column sits) to hold contrast even against the
            sequence's brighter frames (e.g. the closing "calm result"
            shot), not just the darker ones. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] bg-gradient-to-r from-black/88 via-black/55 to-black/10"
        />

        <div
          ref={textWrapRef}
          className="relative z-10 mx-auto flex h-full max-w-8xl items-center px-5 sm:px-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={beatIndex}
              custom={direction}
              variants={groupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-xl"
            >
              {beat.eyebrow && (
                <motion.p
                  custom={direction}
                  variants={lineVariants}
                  className="mb-6 font-grotesk text-xs font-semibold uppercase tracking-widest2 text-ivory drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]"
                >
                  {beat.eyebrow}
                </motion.p>
              )}
              <motion.h1
                custom={direction}
                variants={lineVariants}
                className="font-display text-[32px] font-bold uppercase leading-[1.05] tracking-tight text-ivory drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] sm:text-[42px] lg:text-[52px]"
              >
                {/* Beat swap (above) still gets its own fade/rise/blur-in;
                    within that, each word additionally sharpens from a dim
                    0.25 opacity to full as the scroll continues through
                    this beat's own frame range — the block announces the
                    line, the words track the scroll. */}
                <MagicText
                  lines={[
                    ...beat.headline.map((line) => ({ text: line })),
                    ...(beat.script
                      ? [
                          {
                            text: beat.script,
                            className:
                              "text-ivory drop-shadow-[0_0_10px_rgba(255,248,241,0.45)]",
                          },
                        ]
                      : []),
                  ]}
                  progress={framePosition}
                  range={beat.range}
                />
              </motion.h1>
              <motion.p
                custom={direction}
                variants={lineVariants}
                className="mt-6 max-w-md font-grotesk text-lg leading-relaxed text-ivory drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)]"
              >
                {beat.body}
              </motion.p>
              {beat.ctas && (
                <motion.div custom={direction} variants={lineVariants} className="mt-9 flex flex-wrap gap-4">
                  <ButtonLink
                    href="/contact"
                    variant="primary"
                    className="!bg-charcoal !text-ivory hover:!bg-charcoal-light"
                  >
                    Book A Consultation →
                  </ButtonLink>
                  <ButtonLink href="/treatments" variant="outlineLight">
                    Explore Treatments →
                  </ButtonLink>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
