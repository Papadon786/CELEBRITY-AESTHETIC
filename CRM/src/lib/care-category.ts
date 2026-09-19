import type { CareCategory } from "@/generated/prisma/enums"

/**
 * Buckets a Service name into one of Crown Celebrity Aesthetic's specialty
 * categories — used wherever revenue/activity needs to be split by department
 * instead of by the (much more granular) service name.
 */
export function classifyServiceName(name: string | null | undefined): CareCategory {
  const s = (name ?? "").toLowerCase()

  // 1. Hair Transplant Specialities (Satyam Hair Transplant Centre)
  if (
    s.includes("transplant") ||
    s.includes("fue") ||
    s.includes("dhi") ||
    s.includes("beard") ||
    s.includes("eyebrow reconstruct") ||
    s.includes("unshaven") ||
    s.includes("graft") ||
    s.includes("satyam")
  ) {
    return "HAIR_TRANSPLANT"
  }

  // 2. Hair Restoration (GFC, PRP, Exosomes, Scalp Care)
  if (
    s.includes("gfc") ||
    s.includes("prp") ||
    s.includes("exosome") ||
    s.includes("stem cell") ||
    s.includes("hairfall") ||
    s.includes("hair") ||
    s.includes("dandruff") ||
    s.includes("scalp") ||
    s.includes("alopecia") ||
    s.includes("tricho")
  ) {
    return "HAIR_RESTORATION"
  }

  // 3. Permanent Makeup (PMU) & Aesthetic Enhancements
  if (
    s.includes("microblading") ||
    s.includes("pmu") ||
    s.includes("lip blush") ||
    s.includes("powder brow") ||
    s.includes("smp") ||
    s.includes("micropigmentation") ||
    s.includes("permanent makeup") ||
    s.includes("eyeliner") ||
    s.includes("tinting")
  ) {
    return "PERMANENT_MAKEUP"
  }

  // 4. Academy & Professional Courses
  if (
    s.includes("academy") ||
    s.includes("masterclass") ||
    s.includes("training") ||
    s.includes("certification") ||
    s.includes("course")
  ) {
    return "ACADEMY"
  }

  // 5. Skin, Laser Aesthetics, Medi-Facials, Injectables (Default core aesthetic bucket)
  return "SKIN_AND_LASER"
}
