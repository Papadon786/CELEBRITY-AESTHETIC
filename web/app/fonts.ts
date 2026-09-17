import { Inter, Oswald, Cormorant_Garamond } from "next/font/google";

/**
 * Editorial type system:
 *  - Oswald ("--font-display") — condensed, bold display font for
 *    headlines (h1/h2/h3) only. Matches the brief's "PP Formula / Oswald"
 *    reference: tall, tight, uppercase-friendly.
 *  - Inter ("--font-grotesk") — the workhorse Swiss sans for everything
 *    else: nav, body copy, buttons, forms, numerals. Stands in for the
 *    brief's "Neue Montreal" (not freely licensable) — same clean,
 *    modern-grotesque character. Kept on the pre-existing "--font-grotesk"
 *    variable name/`font-grotesk` Tailwind class so the ~20 components
 *    already using it don't need touching — only the font actually loaded
 *    under that name changed, same as the earlier colour retheme.
 *  - Cormorant Garamond ("--font-accent") — unchanged; the serif accent
 *    font already matches the brief's own "subtle luxury serif" spec, used
 *    only for short script/italic accent phrases, never body or headings.
 */
export const grotesk = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

export const displayFont = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const accentFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-accent",
  display: "swap",
});
