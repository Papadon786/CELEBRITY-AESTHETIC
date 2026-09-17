"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Vertical timeline whose connecting line draws itself in as the section
 * scrolls through the viewport (scroll-linked, not just a one-shot
 * viewport fade like the rest of the site's Reveal components) — the line's
 * scaleY tracks scrollYProgress directly, so it grows and shrinks in step
 * with the scrollbar rather than firing once and staying put.
 */
export default function ScrollTimeline({
  steps,
}: {
  steps: { number: string; title: string; text: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="flex flex-col gap-6">
      {steps.map((step, i) => (
        <div key={step.number} className="flex gap-5">
          <div className="relative flex w-11 shrink-0 flex-col items-center">
            <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-dark bg-ivory font-grotesk text-sm font-semibold text-gold-dark">
              {step.number}
            </span>
            {i < steps.length - 1 && (
              <div className="relative mt-1 w-px flex-1 overflow-hidden bg-gold/20">
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 w-px bg-gold-dark"
                  style={
                    reduceMotion
                      ? { height: "100%" }
                      : {
                          height: "100%",
                          scaleY: lineScale,
                          transformOrigin: "top",
                        }
                  }
                />
              </div>
            )}
          </div>
          <div className="flex-1 rounded-xl bg-sage p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-gold hover:shadow-lg">
            <h3 className="font-display text-lg font-bold uppercase text-charcoal">
              {step.title}
            </h3>
            <p className="mt-1 font-grotesk text-base leading-relaxed text-charcoal/70">
              {step.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
