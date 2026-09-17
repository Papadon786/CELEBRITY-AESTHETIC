import type { Config } from "tailwindcss";

/**
 * Celebrity Aesthetic — design tokens
 * -----------------------------------
 * Strict 3-colour system — nothing outside these three hues appears
 * anywhere in the palette, only tints/shades of them (kept under the same
 * token names the whole codebase already uses, so every component repaints
 * automatically):
 *  - ivory    : Warm Ivory #FFF8F1 — dominant background and negative space.
 *  - charcoal : Deep Burgundy #5A1F32 — primary typography, headings, logo
 *    and important elements (charcoal.light = a darker burgundy shade, for
 *    hover states and dark feature panels).
 *  - gold     : Pastel Blue #AFCBD8 — secondary text, icons, tags, subtle
 *    borders and accents (gold.light = a paler tint, for use on dark
 *    burgundy backgrounds). gold.dark is burgundy again, not blue — it's
 *    used for "important" accented text (active nav, hover states, CTA
 *    labels), which per the brief stays burgundy, not pastel blue.
 *  - sage     : large pale-blue section washes (a light tint of the same
 *    Pastel Blue, not a separate hue) — sage.dark is burgundy, for the
 *    dark feature panels/CTAs.
 *
 * Typography — editorial pairing (see app/fonts.ts):
 *  - Oswald ("--font-display" / `font-display`) — condensed display font,
 *    used ONLY on h1/h2/h3 headings, uppercase + bold.
 *  - Inter ("--font-grotesk" / `font-grotesk`) — Swiss sans for everything
 *    structural: nav, body copy, buttons, forms, numerals.
 *  - Cormorant Garamond ("--font-accent") is the serif accent font — used
 *    only for short decorative/emphasis phrases (often italic), never body
 *    text, forms or nav.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#FFF8F1",
          100: "#FFFDFA",
          200: "#FFF8F1",
          300: "#F7EBDD",
        },
        gold: {
          DEFAULT: "#AFCBD8",
          light: "#D3E4EA",
          dark: "#5A1F32",
        },
        sage: {
          DEFAULT: "#E3EEF2",
          light: "#EDF4F6",
          dark: "#40182A",
        },
        charcoal: {
          DEFAULT: "#5A1F32",
          light: "#40182A",
        },
        // Explicit aliases for components that reference the brief's own
        // vocabulary directly — same three hues, no new colours.
        burgundy: {
          DEFAULT: "#5A1F32",
          dark: "#40182A",
        },
        pastelBlue: {
          DEFAULT: "#AFCBD8",
          light: "#D3E4EA",
        },
        ink: {
          body: "#5A1F32",
          muted: "#5A1F32",
        },
        line: "#AFCBD8",
      },
      fontFamily: {
        grotesk: ["var(--font-grotesk)"],
        display: ["var(--font-display)"],
        accent: ["var(--font-accent)"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
      maxWidth: {
        "8xl": "90rem",
      },
    },
  },
  plugins: [],
};

export default config;
