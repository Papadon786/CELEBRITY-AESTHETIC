import type { Treatment, TreatmentCategory } from "./treatments";

function unsplash(id: string, w = 1200) {
  return `https://images.unsplash.com/${id}?fm=jpg&q=80&w=${w}&auto=format&fit=crop`;
}

export const categoryImages: Record<
  TreatmentCategory,
  { src: string; alt: string }
> = {
  skin: {
    src: "/treatments/skin-pillar.jpg",
    alt: "Skin care and clinical aesthetics treatment at Crown Celebrity Aesthetic",
  },
  hair: {
    src: "/treatments/hair-pillar.jpg",
    alt: "Scalp and hair restoration clinic equipment at Crown Celebrity Aesthetic",
  },
  aesthetics: {
    src: "/treatments/aesthetics-pillar.jpg",
    alt: "Facial aesthetic treatment and clinical contouring",
  },
  pmu: {
    src: "/treatments/pmu-pillar.jpg",
    alt: "Permanent makeup and aesthetic micropigmentation",
  },
};

/**
 * Real per-treatment photography, keyed by treatment slug.
 * Integrates authentic clinic poster crops, clinical suite photos, and procedure photography.
 */
const treatmentImages: Partial<Record<string, { src: string; alt: string }>> = {
  // --- Hair Restoration ---
  "advanced-gfc": {
    src: "/treatments/advanced-gfc.jpg",
    alt: "GFC Growth Factor Concentrate scalp therapy",
  },
  "advanced-prp": {
    src: "/treatments/advanced-prp.jpg",
    alt: "PRP Platelet-Rich Plasma hair treatment being applied",
  },
  exosomes: {
    src: "/treatments/exosomes.jpg",
    alt: "Exosome scalp restoration treatment",
  },
  // --- Hair Transplant (All Sub-Specialties) ---
  "male-hair-transplant": {
    src: "/treatments/male-hair-transplant.jpg",
    alt: "Male hair transplant precision hairline restoration",
  },
  "hair-patch": {
    src: "/treatments/hair-patch.jpg",
    alt: "Non-surgical hair patch result",
  },
  "smp-hair": {
    src: "/treatments/smp-hair.jpg",
    alt: "Scalp micropigmentation follicle replication",
  },
  "hairfall-treatment": {
    src: "/treatments/hairfall-treatment.jpg",
    alt: "Hairfall diagnosis and clinical scalp treatment",
  },
  "dandruff-treatment": {
    src: "/treatments/dandruff-treatment.jpg",
    alt: "Scalp clinical dandruff detox treatment",
  },
  // --- Skin Treatments (Acne & Scars from Clinic Wall) ---
  "chemical-peels": {
    src: "/treatments/chemical-peels.jpg",
    alt: "Chemical peel application for acne and skin renewal",
  },
  "vampire-facial": {
    src: "/treatments/vampire-facial.jpg",
    alt: "Vampire facial device treatment on the cheek",
  },
  mnrf: {
    src: "/treatments/mnrf.jpg",
    alt: "MNRF micro-needling radiofrequency device on the skin",
  },
  "post-pregnancy-stretch-mark-removal": {
    src: "/treatments/post-pregnancy-stretch-mark-removal.jpg",
    alt: "Post-pregnancy belly skin being cared for during stretch mark removal treatment",
  },
  "acne-treatment": {
    src: "/treatments/acne-treatment.jpg",
    alt: "Clinical acne treatment and dermatological evaluation",
  },
  "acne-scar-treatment": {
    src: "/treatments/acne-scar-treatment.jpg",
    alt: "No More Acne Scars clinical protocol poster at Crown Celebrity Aesthetic",
  },
  "scar-revision": {
    src: "/treatments/scar-revision.jpg",
    alt: "Scar revision and texture remodeling",
  },
  // --- Skin Treatments (Pigmentation from Clinic Wall) ---
  "pigmentation-treatment": {
    src: "/treatments/pigmentation-treatment.jpg",
    alt: "No More Pigmentation clinical protocol poster at Crown Celebrity Aesthetic",
  },
  "melasma-treatment": {
    src: "/treatments/melasma-treatment.jpg",
    alt: "Melasma treatment being applied to the cheek",
  },
  "skin-lightening": {
    src: "/treatments/skin-lightening.jpg",
    alt: "Skin lightening and radiant complexion glow",
  },
  "iv-glutathione": {
    src: "/treatments/iv-glutathione.jpg",
    alt: "IV glutathione antioxidant infusion",
  },
  "under-eye-dark-circles": {
    src: "/treatments/under-eye-dark-circles.jpg",
    alt: "Under-eye dark circles rejuvenation",
  },
  "underarm-pigmentation": {
    src: "/treatments/underarm-pigmentation.jpg",
    alt: "Underarm pigmentation correction",
  },
  // --- Skin Treatments (Medi Facials from Clinic Wall) ---
  "hydra-facial": {
    src: "/treatments/hydra-facial.jpg",
    alt: "HydraFacial featured on Medi Facials clinic poster at Crown Celebrity Aesthetic",
  },
  "carbon-laser-facial": {
    src: "/treatments/carbon-laser-facial.jpg",
    alt: "Carbon laser facial with charcoal mask",
  },
  "bb-glow-facial": {
    src: "/treatments/bb-glow-facial.jpg",
    alt: "BB Glow radiance facial treatment",
  },
  // --- Laser Hair Removal from Clinic Wall ---
  "laser-hair-removal": {
    src: "/treatments/laser-hair-removal.jpg",
    alt: "No More Unwanted Hair USA FDA Approved laser hair removal poster at Crown Celebrity Aesthetic",
  },
  // --- Aesthetics & PMU ---
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
    alt: "HIFU device treating the jawline and double chin",
  },
  "thread-lift": {
    src: "/treatments/thread-lift.jpg",
    alt: "Thread lift treatment markings on the face",
  },
  "mnrf-aesthetics": {
    src: "/treatments/mnrf-aesthetics.jpg",
    alt: "Radiofrequency skin tightening treatment",
  },
  "carbon-laser-facial-aesthetics": {
    src: "/treatments/carbon-laser-facial-aesthetics.jpg",
    alt: "Carbon laser facial treatment",
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

export function getTreatmentImage(treatment: Treatment): {
  src: string;
  alt: string;
} {
  return treatmentImages[treatment.slug] ?? categoryImages[treatment.category];
}

export const interiorImage = {
  src: "/clinic/clinic-about-treatment-room.jpg",
  alt: "State-of-the-art clinical treatment suite at Crown Celebrity Aesthetic with advanced laser consoles and treatment bed",
};

export const clinicSpaceImages = [
  {
    src: "/clinic/clinic-about-treatment-room.jpg",
    alt: "State-of-the-art clinical treatment suite at Crown Celebrity Aesthetic with advanced laser consoles and treatment bed",
    width: 1024,
    height: 576,
  },
  {
    src: "/clinic/clinic-wall-posters.jpg",
    alt: "Wall of clinical specialty posters at Crown Celebrity Aesthetic: Acne, Pigmentation, Medi Facials, Hydroxy, and Laser Hair Removal",
    width: 1600,
    height: 900,
  },
  {
    src: "/clinic/clinic-procedure-suite.jpg",
    alt: "Modern procedure suite at Crown Celebrity Aesthetic equipped with advanced laser consoles and treatment couch",
    width: 1600,
    height: 901,
  },
  {
    src: "/clinic/clinic-treatment-suite-bright.jpg",
    alt: "High-tech aesthetic treatment room with modern medical equipment and seating",
    width: 1600,
    height: 901,
  },
  {
    src: "/clinic/clinic-consultation-room.jpg",
    alt: "Consultation and training suite at Crown Celebrity Aesthetic",
    width: 1600,
    height: 901,
  },
  {
    src: "/clinic/clinic-corridor.jpg",
    alt: "Reception hallway at Crown Celebrity Aesthetic with certificates and treatment rooms",
    width: 1600,
    height: 900,
  },
  {
    src: "/clinic/clinic-hallway-tall.jpg",
    alt: "Elegantly styled clinic corridor with gold geometric design and natural lighting",
    width: 900,
    height: 1600,
  },
  {
    src: "/clinic/clinic-treatment-room-2.jpg",
    alt: "Fully equipped treatment room at Crown Celebrity Aesthetic with laser and skin-analysis devices",
    width: 1600,
    height: 900,
  },
];

export const teamPhotos = [
  { src: "/about/team-member-1.png", alt: "Portrait of Naziya Baig" },
  { src: "/about/team-member-2.jpeg", alt: "Portrait of Reehal Baig" },
];

export const academyImage = {
  src: unsplash("photo-1691502494589-fc389bd017a5"),
  alt: "A practitioner applying makeup as part of hands-on training",
};
