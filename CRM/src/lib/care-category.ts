import type { CareCategory } from "@/generated/prisma/enums"

/**
 * Buckets a Service name into one of Crown Celebrity Aesthetic's specialty
 * categories — used wherever revenue/activity needs to be split by department
 * instead of by the (much more granular) service name.
 */
export function classifyServiceName(name: string | null | undefined): CareCategory {
  const s = (name ?? "").toLowerCase()

  // 1. Hair (transplant specialities, restoration, scalp care)
  if (
    s.includes("transplant") ||
    s.includes("fue") ||
    s.includes("dhi") ||
    s.includes("beard") ||
    s.includes("eyebrow reconstruct") ||
    s.includes("unshaven") ||
    s.includes("graft") ||
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
    return "HAIR"
  }

  // 2. Permanent Makeup (PMU)
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
    return "PMU"
  }

  // 3. Skin, laser aesthetics, medi-facials, injectables — default core bucket
  return "SKIN"
}
