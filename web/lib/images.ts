import type { Treatment, TreatmentCategory } from "./treatments";

/**
 * Editorial stock photography (Unsplash, free license) standing in for real
 * clinic/treatment photography. Swap any of these for genuine photos by
 * replacing the `src` — every consumer (PhotoPanel) takes a plain URL.
 *
 * IMPORTANT: this file intentionally does NOT cover Testimonials — that
 * section explicitly promises not to show fabricated client photos, so it
 * stays text-only until real client material is available.
 */

function unsplash(id: string, w = 1200) {
  return `https://images.unsplash.com/${id}?fm=jpg&q=80&w=${w}&auto=format&fit=crop`;
}

export const categoryImages: Record<
  TreatmentCategory,
  { src: string; alt: string }
> = {
  skin: {
    src: "/treatments/skin-pillar.jpg",
    alt: "Close-up of skin pigmentation and texture on the cheek",
  },
  hair: {
    src: "/treatments/hair-pillar.jpg",
    alt: "Collage of scalp and hair treatment devices in use",
  },
  aesthetics: {
    src: "/treatments/aesthetics-pillar.jpg",
    alt: "Facial injection treatment being administered",
  },
  pmu: {
    src: "/treatments/pmu-pillar.jpg",
    alt: "Lip tinting pigment being applied",
  },
};

/**
 * Real per-treatment photography, keyed by treatment slug — covers the
 * treatments we have genuine photos for. Anything not listed here falls
 * back to its category's stock image via getTreatmentImage() below.
 */
const treatmentImages: Partial<Record<string, { src: string; alt: string }>> = {
  "laser-hair-removal": {
    src: "/treatments/laser-hair-removal.jpg",
    alt: "Laser hair removal treatment on the neck",
  },
  "carbon-laser-facial": {
    src: "/treatments/carbon-laser-facial.jpg",
    alt: "Carbon laser facial treatment with charcoal mask",
  },
  "carbon-laser-facial-aesthetics": {
    src: "/treatments/carbon-laser-facial-aesthetics.jpg",
    alt: "Carbon laser facial treatment with charcoal mask",
  },
  "hydra-facial": {
    src: "/treatments/hydra-facial.jpg",
    alt: "HydraFacial device treatment in progress",
  },
  "pigmentation-treatment": {
    src: "/treatments/pigmentation-treatment.jpg",
    alt: "Pigmentation treatment with brush and serum",
  },
  "underarm-pigmentation": {
    src: "/treatments/underarm-pigmentation.jpg",
    alt: "Close-up of underarm skin with pigmentation",
  },
  "iv-glutathione": {
    src: "/treatments/iv-glutathione.jpg",
    alt: "IV glutathione infusion being administered alongside a facial treatment",
  },
  "skin-lightening": {
    src: "/treatments/skin-lightening.jpg",
    alt: "Close-up comparison of skin tones showing an even, brightened glow",
  },
  "acne-treatment": {
    src: "/treatments/acne-treatment.jpg",
    alt: "Close-up of acne-affected skin being assessed",
  },
  "acne-scar-treatment": {
    src: "/treatments/acne-scar-treatment.jpg",
    alt: "Before and after of acne scar improvement",
  },
  "chemical-peels": {
    src: "/treatments/chemical-peels.jpg",
    alt: "Chemical peel solution being applied to the forehead",
  },
  "post-pregnancy-stretch-mark-removal": {
    src: "/treatments/post-pregnancy-stretch-mark-removal.jpg",
    alt: "Close-up of stretch marks before treatment",
  },
  "vampire-facial": {
    src: "/treatments/vampire-facial.jpg",
    alt: "Vampire facial device treatment being applied to the cheek",
  },
  "melasma-treatment": {
    src: "/treatments/melasma-treatment.jpg",
    alt: "Melasma treatment being applied to the cheek",
  },
  "bb-glow-facial": {
    src: "/treatments/bb-glow-facial.jpg",
    alt: "BB Glow facial treatment device on the cheek",
  },
  mnrf: {
    src: "/treatments/mnrf.jpg",
    alt: "Micro-needling radiofrequency device on the cheek",
  },
  "mnrf-aesthetics": {
    src: "/treatments/mnrf-aesthetics.jpg",
    alt: "Radiofrequency skin tightening treatment",
  },
  "under-eye-dark-circles": {
    src: "/treatments/under-eye-dark-circles.jpg",
    alt: "Close-up of under-eye dark circles",
  },
  "hairfall-treatment": {
    src: "/treatments/hairfall-treatment.jpg",
    alt: "Scalp treatment for hairfall being applied",
  },
  "advanced-prp": {
    src: "/treatments/advanced-prp.jpg",
    alt: "PRP scalp treatment being applied",
  },
  "hair-transplant": {
    src: "/treatments/hair-transplant.jpg",
    alt: "Close-up of a hair transplant procedure using a DHI implanter pen",
  },
  "hair-patch": {
    src: "/treatments/hair-patch.jpg",
    alt: "Before and after side profile of a hair patch result",
  },
  "smp-hair": {
    src: "/treatments/smp-hair.jpg",
    alt: "Before and after top-down view of scalp micropigmentation results",
  },
  "advanced-gfc": {
    src: "/treatments/advanced-gfc.jpg",
    alt: "GFC scalp treatment being applied",
  },
  "dandruff-treatment": {
    src: "/treatments/dandruff-treatment.jpg",
    alt: "Close-up of dandruff flakes in hair viewed through a magnifier",
  },
  exosomes: {
    src: "/treatments/exosomes.jpg",
    alt: "Exosome scalp treatment being applied with a mesotherapy device",
  },
  botox: {
    src: "/treatments/botox.jpg",
    alt: "Botox injection being administered",
  },
  fillers: {
    src: "/treatments/fillers.jpg",
    alt: "Lip filler injection being administered",
  },
  "hifu-double-chin": {
    src: "/treatments/hifu-double-chin.jpg",
    alt: "HIFU device treating the jawline and chin",
  },
  "thread-lift": {
    src: "/treatments/thread-lift.jpg",
    alt: "Thread lift treatment being marked on the face",
  },
  "skin-rejuvenation": {
    src: "/treatments/skin-rejuvenation.jpg",
    alt: "Laser skin rejuvenation treatment in progress",
  },
  "lip-tinting": {
    src: "/treatments/lip-tinting.jpg",
    alt: "Lip tinting pigment being applied",
  },
};

/** The best available image for a treatment: its real photo if we have
 * one, otherwise its category's stock image. */
export function getTreatmentImage(treatment: Treatment): {
  src: string;
  alt: string;
} {
  return treatmentImages[treatment.slug] ?? categoryImages[treatment.category];
}

export const interiorImage = {
  src: "/about/clinic-room.jpeg",
  alt: "A treatment room at Celebrity Aesthetic with a reclining treatment chair and laser equipment",
};

/** Real clinic interior photography for the About page's gallery. Width/
 * height are each photo's real intrinsic size, in pixels — required by
 * next/image whenever it isn't rendered with `fill` (used here in a CSS
 * multi-column masonry layout, where each tile keeps its natural aspect
 * ratio rather than being forced into a fixed-height box). */
export const clinicSpaceImages = [
  {
    src: "/about/clinic-space-1.jpeg",
    alt: "Reception and waiting area at Celebrity Aesthetic with skin concern posters and clinic accreditations on display",
    width: 1364,
    height: 768,
  },
  {
    src: "/about/clinic-space-2.jpeg",
    alt: "A treatment room at Celebrity Aesthetic with a reclining chair and laser and skin devices",
    width: 1364,
    height: 768,
  },
  {
    src: "/about/clinic-space-3.jpeg",
    alt: "A consultation and treatment room with a whiteboard, mirror and clinic equipment",
    width: 1364,
    height: 768,
  },
  {
    src: "/about/clinic-space-4.jpeg",
    alt: "A treatment room with a reclining chair, laser devices and seating area",
    width: 1254,
    height: 1254,
  },
  {
    src: "/about/clinic-space-5.jpeg",
    alt: "Reception hallway at Celebrity Aesthetic with framed accreditations, a Buddha statue nook and treatment room doors",
    width: 1376,
    height: 768,
  },
];

/** Real team member photography for the About page's "Meet The Team"
 * cards, ordered to match `teamMembers` in app/about/page.tsx. */
export const teamPhotos = [
  { src: "/about/team-member-1.png", alt: "Portrait of Naziya Baig" },
  { src: "/about/team-member-2.jpeg", alt: "Portrait of Reehal Baig" },
];

export const academyImage = {
  src: unsplash("photo-1691502494589-fc389bd017a5"),
  alt: "A practitioner applying makeup as part of hands-on training",
};
