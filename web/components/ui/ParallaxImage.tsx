"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { ensureGsap, pickResponsive, RESPONSIVE } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * A photo with a subtle scroll-linked parallax drift, reserved for a few
 * standout images rather than applied everywhere. Shares <PhotoPanel>'s
 * framing (aspect box, border, rounded corners).
 *
 * The inner layer is sized with plain `inset-0` (exactly matching the
 * frame, guaranteed non-zero since the frame's own aspect-ratio gives it
 * a definite height) and permanently scaled up ~14% via CSS — that spare
 * size is what the ±30px parallax drift moves within, so it never
 * exposes an empty edge. No runtime height measurement needed, unlike an
 * earlier version of this component that sized the inner layer via
 * inset offsets and turned out to depend on the frame being a reliable
 * containing block — fragile once a GSAP-transformed ancestor (like
 * <DirectionalCard>) was involved.
 */
export default function ParallaxImage({
  src,
  alt,
  aspect = "aspect-[4/5]",
  sizes = "(min-width: 1024px) 45vw, 90vw",
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  aspect?: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner || reduceMotion) return;

    const { gsap, ScrollTrigger } = ensureGsap();
    const distance = pickResponsive(RESPONSIVE.parallax);

    gsap.set(frame, { opacity: 0 });
    const revealTrigger = ScrollTrigger.create({
      trigger: frame,
      start: "top 80%",
      once: true,
      onEnter: () => gsap.to(frame, { opacity: 1, duration: 0.9, ease: "power3.out" }),
    });

    // Scale is set here (not via a CSS class) because GSAP writes the
    // whole inline `transform` — a separate class-based scale would be
    // silently wiped out the moment GSAP sets `y` on the same element.
    gsap.set(inner, { scale: 1.14, y: -distance });
    const parallaxTween = gsap.to(inner, {
      y: distance,
      ease: "none",
      scrollTrigger: {
        trigger: frame,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      revealTrigger.kill();
      parallaxTween.scrollTrigger?.kill();
      parallaxTween.kill();
    };
  }, [reduceMotion]);

  return (
    <div
      ref={frameRef}
      className={`relative ${aspect} w-full overflow-hidden rounded-md border border-gold/30 ${className}`}
    >
      <div ref={innerRef} className="absolute inset-0 h-full w-full">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    </div>
  );
}
