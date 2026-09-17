"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

/**
 * <Logo />
 * --------
 * Real artwork lives at `public/logo.jpg` — a circular gold badge with
 * "Celebrity Aesthetic / Hair & Skin Clinic / PMU Services & Academy" baked
 * into the image itself. Sized larger than a plain wordmark would be
 * (h-12/h-14) since the crown and text need the extra height to stay
 * legible. Falls back to a text wordmark if the file is ever missing.
 */
export default function Logo({
  variant = "dark",
  className = "",
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const textColor = variant === "light" ? "text-ivory" : "text-charcoal";
  const subColor = variant === "light" ? "text-ivory/70" : "text-charcoal/60";

  return (
    <Link
      href="/"
      aria-label="Celebrity Aesthetic — home"
      className={`inline-flex items-center gap-3 ${className}`}
    >
      {!imgFailed ? (
        <Image
          src="/logo.jpg"
          alt="Celebrity Aesthetic — Hair & Skin Clinic, PMU Services & Academy"
          width={1254}
          height={1254}
          priority
          className="h-12 w-12 shrink-0 rounded-full object-contain sm:h-14 sm:w-14"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <>
          {/* Minimal gold ring + crown-mark emblem (fallback only) */}
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
              stroke="#AFCBD8"
              strokeWidth="1"
            />
            <path
              d="M10 20.5L11.6 13.5L15 17.2L17 12L19 17.2L22.4 13.5L24 20.5H10Z"
              stroke="#AFCBD8"
              strokeWidth="1"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span className="flex flex-col leading-none font-grotesk">
            <span
              className={`text-lg tracking-widest2 uppercase font-semibold ${textColor}`}
            >
              Celebrity
            </span>
            <span
              className={`text-[10px] tracking-[0.35em] uppercase ${subColor}`}
            >
              Aesthetic
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
