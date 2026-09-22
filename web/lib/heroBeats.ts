/**
 * The hero's scroll-synced narrative — one "beat" of copy per stretch of
 * the 30-frame sequence, matching the story the frames themselves tell
 * (face → macro skin → beneath the surface → laser/treatment → calm
 * result → face again). Hero.tsx swaps the visible beat as the scroll
 * position crosses into each frame range; HeroFrameCanvas keeps scrubbing
 * frames independently of this.
 *
 * Text sits in one stable anchor for the whole sequence — flex alignment
 * (justify/items) can't be transitioned smoothly, so swapping it per beat
 * reads as a hard jump rather than a camera move. Movement within that
 * anchor is instead handled by the fade/blur/rise on the text itself.
 */
export interface HeroBeat {
  /** Inclusive 1-based frame range this beat is shown for. */
  range: [number, number];
  eyebrow?: string;
  /** Headline lines, rendered stacked. */
  headline: string[];
  /** Optional short italic/script accent line under the headline. */
  script?: string;
  body: string;
  ctas: boolean;
}

export const HERO_BEATS: HeroBeat[] = [
  {
    range: [1, 10],
    eyebrow: "Crown Celebrity Aesthetic · Hair & Skin Clinic · PMU Academy",
    headline: ["Refined care,"],
    script: "considered results.",
    body: "A consultation-led approach to skin, hair and permanent makeup, brought together under one roof.",
    ctas: true,
  },
  {
    range: [11, 13],
    headline: ["Look closer."],
    body: "Because every skin concern deserves to be understood.",
    ctas: false,
  },
  {
    range: [14, 18],
    headline: ["Beyond"],
    script: "the surface.",
    body: "We look deeper to understand your skin and create care that is personal to you.",
    ctas: false,
  },
  {
    range: [19, 24],
    headline: ["Precision", "meets technology."],
    body: "Advanced technology meets a consultation-led approach for targeted, considered treatment.",
    ctas: false,
  },
  {
    range: [25, 27],
    headline: ["A clearer", "way forward."],
    body: "Thoughtful treatments designed to address concerns while supporting healthier-looking skin.",
    ctas: false,
  },
  {
    range: [28, 30],
    eyebrow: "Crown Celebrity Aesthetic · Hair & Skin Clinic · PMU Academy",
    headline: ["Your skin.", "Your confidence."],
    body: "Personalised care for skin, hair and permanent makeup — all under one roof.",
    ctas: true,
  },
];

export function beatForFrame(frame: number): HeroBeat {
  const rounded = Math.round(frame);
  for (const beat of HERO_BEATS) {
    if (rounded >= beat.range[0] && rounded <= beat.range[1]) return beat;
  }
  return HERO_BEATS[0];
}

export function beatIndexForFrame(frame: number): number {
  const rounded = Math.round(frame);
  for (let i = 0; i < HERO_BEATS.length; i++) {
    const [start, end] = HERO_BEATS[i].range;
    if (rounded >= start && rounded <= end) return i;
  }
  return 0;
}
