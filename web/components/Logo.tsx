"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

/**
 * <Logo />
 * --------
 * Real artwork lives at `public/logo.jpg` — a circular gold badge with
 * "Crown Celebrity Aesthetic / Hair & Skin Clinic / PMU Services & Academy".
 * Sized generously (h-14/h-16/h-20, up to h-28 in footer) so the outer circular
 * lettering and central crown emblem are crystal clear and prominent.
 */
export default function Logo({
  variant = "dark",
  size = "default",
  showText = true,
  className = "",
}: {
  variant?: "dark" | "light";
  size?: "default" | "large";
  showText?: boolean;
  className?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const textColor = variant === "light" ? "text-ivory" : "text-charcoal";
  const subColor = variant === "light" ? "text-ivory/70" : "text-charcoal/65";

  const imgDimensions =
    size === "large"
      ? "h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28"
      : "h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20";

  return (
    <Link
      href="/"
      aria-label="Crown Celebrity Aesthetic — Home"
      className={`group inline-flex items-center gap-3.5 transition-transform duration-200 hover:opacity-95 ${className}`}
    >
      {!imgFailed ? (
        <div className="relative shrink-0">
          <Image
            src="/logo.jpg"
            alt="Crown Celebrity Aesthetic — Hair & Skin Clinic, PMU Services & Academy"
            width={1024}
            height={1024}
            priority
            className={`${imgDimensions} rounded-full object-contain ring-1.5 ring-gold/50 shadow-[0_3px_14px_rgba(212,175,55,0.22)] transition-all duration-300 group-hover:ring-gold-light group-hover:shadow-[0_4px_18px_rgba(212,175,55,0.35)]`}
            onError={() => setImgFailed(true)}
          />
        </div>
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/60 bg-gold/10">
          <svg
            width="34"
            height="34"
            viewBox="0 0 34 34"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <circle
              cx="17"
              cy="17"
              r="15.5"
              stroke="#D4AF37"
              strokeWidth="1.5"
            />
            <path
              d="M10 20.5L11.6 13.5L15 17.2L17 12L19 17.2L22.4 13.5L24 20.5H10Z"
              stroke="#D4AF37"
              strokeWidth="1.5"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      )}

      {showText && (
        <span className="flex flex-col leading-tight font-grotesk">
          <span
            className={`font-display text-base font-bold tracking-wider uppercase sm:text-lg lg:text-xl ${textColor}`}
          >
            Crown Celebrity
          </span>
          <span className="text-[10px] font-bold tracking-[0.28em] uppercase text-gold-dark sm:text-[11px]">
            Aesthetic
          </span>
          <span
            className={`hidden text-[9px] font-medium tracking-widest uppercase sm:block ${subColor}`}
          >
            Hair &amp; Skin Clinic · PMU Academy
          </span>
        </span>
      )}
    </Link>
  );
}

