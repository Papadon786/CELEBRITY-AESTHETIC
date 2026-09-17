"use client";

import { useLayoutEffect, useRef } from "react";
import { ensureGsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Eyebrow → heading (word by word) → description, revealed in that order
 * with a small stagger (GSAP + ScrollTrigger) — the site's standard
 * text-entrance sequence, used by virtually every section, so this one
 * component carries that behavior everywhere automatically. The reveal
 * fires once, when the section crosses ~80% up the viewport, and always
 * plays through to a fully-faded-in resting state rather than tracking
 * scroll position directly — so it settles cleanly even if the visitor
 * stops scrolling mid-reveal.
 */
export default function SectionHeading({
  kicker,
  title,
  description,
  align = "left",
  light = false,
  script,
}: {
  kicker?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
  /** Optional short decorative script-font accent word/phrase. */
  script?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const words = title.split(" ");

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduceMotion) return;

    const { gsap, ScrollTrigger } = ensureGsap();
    const kickerEl = root.querySelector<HTMLElement>("[data-heading-kicker]");
    const titleWords = root.querySelectorAll<HTMLElement>("[data-heading-word]");
    const scriptEl = root.querySelector<HTMLElement>("[data-heading-script]");
    const descEl = root.querySelector<HTMLElement>("[data-heading-description]");
    const titleTargets = [...titleWords, scriptEl].filter(Boolean) as HTMLElement[];
    if (!kickerEl && titleTargets.length === 0 && !descEl) return;

    if (kickerEl) gsap.set(kickerEl, { opacity: 0, y: 15 });
    if (titleTargets.length) gsap.set(titleTargets, { opacity: 0, y: 18 });
    if (descEl) gsap.set(descEl, { opacity: 0, y: 20 });

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top 80%",
      once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        if (kickerEl) {
          tl.to(kickerEl, { opacity: 1, y: 0, duration: 0.9, ease: "power4.out" }, 0);
        }
        if (titleTargets.length) {
          tl.to(
            titleTargets,
            { opacity: 1, y: 0, duration: 0.9, ease: "power4.out", stagger: 0.08 },
            kickerEl ? 0.15 : 0
          );
        }
        if (descEl) {
          tl.to(descEl, { opacity: 1, y: 0, duration: 1, ease: "power4.out" }, "-=0.4");
        }
      },
    });

    return () => trigger.kill();
  }, [reduceMotion]);

  return (
    <div
      ref={rootRef}
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      {kicker && (
        <p
          data-heading-kicker
          className={`mb-3 flex items-center gap-3 font-grotesk text-[13px] font-semibold uppercase tracking-widest2 ${
            align === "center" ? "justify-center" : ""
          } ${light ? "text-gold-light" : "text-gold-dark"}`}
        >
          <span aria-hidden="true" className="h-px w-6 bg-current" />
          {kicker}
        </p>
      )}
      <h2
        className={`font-display text-[32px] font-bold uppercase leading-[1.1] tracking-tight sm:text-[38px] lg:text-[48px] ${
          light ? "text-ivory" : "text-charcoal"
        }`}
        aria-label={script ? `${title} ${script}` : title}
      >
        <span aria-hidden="true">
          {words.map((word, i) => (
            <span key={i} data-heading-word className="inline-block">
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
          {script && (
            <span
              data-heading-script
              className={`font-accent ml-3 block text-2xl font-normal italic tracking-normal sm:inline sm:text-3xl ${
                light ? "text-gold-light" : "text-gold-dark"
              }`}
            >
              {script}
            </span>
          )}
        </span>
      </h2>
      {description && (
        <p
          data-heading-description
          className={`mt-4 font-grotesk text-[17px] leading-relaxed ${
            light ? "text-ivory/80" : "text-charcoal/70"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
