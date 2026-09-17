"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { ensureGsap, pickResponsive, RESPONSIVE } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ButtonLink } from "./ui/Button";
import WhatsAppButton from "./WhatsAppButton";
import { interiorImage } from "@/lib/images";

export default function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg || reduceMotion) return;

    const { gsap, ScrollTrigger } = ensureGsap();
    const distance = pickResponsive(RESPONSIVE.parallax);

    const eyebrow = section.querySelector<HTMLElement>("[data-cta-eyebrow]");
    const heading = section.querySelector<HTMLElement>("[data-cta-heading]");
    const description = section.querySelector<HTMLElement>("[data-cta-description]");
    const actions = section.querySelector<HTMLElement>("[data-cta-actions]");
    const targets = [eyebrow, heading, description, actions].filter(Boolean) as HTMLElement[];

    let revealTrigger: ReturnType<typeof ScrollTrigger.create> | undefined;
    if (targets.length > 0) {
      gsap.set(targets, { opacity: 0, y: 20 });
      revealTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        once: true,
        onEnter: () =>
          gsap.to(targets, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power4.out",
            stagger: 0.15,
          }),
      });
    }

    // Scale (not a CSS class) provides the oversize buffer the parallax
    // drift moves within — GSAP writes the whole inline `transform`, so
    // a class-based scale would be wiped out the moment `y` is set here.
    gsap.set(bg, { scale: 1.14, y: -distance });
    const parallaxTween = gsap.to(bg, {
      y: distance,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      revealTrigger?.kill();
      parallaxTween.scrollTrigger?.kill();
      parallaxTween.kill();
    };
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      aria-label="Book a consultation"
      className="relative overflow-hidden border-y-4 border-gold bg-sage-dark py-12 sm:py-16"
    >
      <div ref={bgRef} className="absolute inset-0 h-full w-full">
        <Image
          src={interiorImage.src}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-charcoal/80" />

      <div className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8">
        <p
          data-cta-eyebrow
          className="font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-gold-light"
        >
          Ready when you are
        </p>
        <h2
          data-cta-heading
          className="mt-4 font-display text-3xl font-bold uppercase leading-tight text-ivory sm:text-4xl"
        >
          Your transformation starts here
        </h2>
        <p data-cta-description className="mt-4 font-grotesk text-[17px] leading-relaxed text-ivory/80">
          Tell us a little about your concern and preferred time, and we will
          take it from there.
        </p>
        <div data-cta-actions className="mt-9 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/contact" variant="ivoryOnDark">
            Book Your Consultation →
          </ButtonLink>
          <WhatsAppButton variant="light" />
        </div>
      </div>
    </section>
  );
}
