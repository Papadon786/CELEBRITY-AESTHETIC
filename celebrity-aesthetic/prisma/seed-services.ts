import "dotenv/config"
import { createClient } from "@supabase/supabase-js"
import { randomBytes } from "node:crypto"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  ""

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const services = [
  // Skin, Hair and Laser (13 services)
  {
    slug: "prp-therapy",
    name: "PRP Therapy",
    shortDescription: "Platelet-Rich Plasma treatment for skin rejuvenation and hair regrowth.",
    durationMinutes: 30,
    displayOrder: 1,
  },
  {
    slug: "gfc-therapy",
    name: "GFC Therapy",
    shortDescription: "Growth Factor Concentrate treatment for advanced hair and skin restoration.",
    durationMinutes: 30,
    displayOrder: 2,
  },
  {
    slug: "chemical-peels",
    name: "Chemical Peels",
    shortDescription: "Resurfacing treatment for tone, texture and pigmentation correction.",
    durationMinutes: 30,
    displayOrder: 3,
  },
  {
    slug: "skin-boosters",
    name: "Skin Boosters",
    shortDescription: "Hydration-based injectables for smoother, plumper skin.",
    durationMinutes: 30,
    displayOrder: 4,
  },
  {
    slug: "laser-treatments",
    name: "Laser Treatments",
    shortDescription: "Scar removal, tattoo removal, hair reduction and pigmentation removal.",
    durationMinutes: 30,
    displayOrder: 5,
  },
  {
    slug: "facials",
    name: "Facials",
    shortDescription: "Includes Hydra Facial and Fire & Ice Facial for glow and rejuvenation.",
    durationMinutes: 30,
    displayOrder: 6,
  },
  {
    slug: "open-pores-treatment",
    name: "Open Pores Treatment",
    shortDescription: "Targeted therapy to minimise enlarged pores.",
    durationMinutes: 30,
    displayOrder: 7,
  },
  {
    slug: "melasma-pigmentation",
    name: "Melasma / Pigmentation",
    shortDescription: "Dedicated treatment for melasma and pigmentation concerns.",
    durationMinutes: 30,
    displayOrder: 8,
  },
  {
    slug: "tanning-treatment",
    name: "Tanning Treatment",
    shortDescription: "De-tan therapy to restore natural skin tone.",
    durationMinutes: 30,
    displayOrder: 9,
  },
  {
    slug: "acne-pimples-treatment",
    name: "Acne / Pimples Treatment",
    shortDescription: "Clinical treatment to control breakouts and reduce scarring.",
    durationMinutes: 30,
    displayOrder: 10,
  },
  {
    slug: "wart-corn-removal",
    name: "Wart & Corn Removal",
    shortDescription: "Safe, minimally invasive removal procedures.",
    durationMinutes: 30,
    displayOrder: 11,
  },
  {
    slug: "hairfall-dandruff-treatment",
    name: "Hairfall & Dandruff Treatment",
    shortDescription: "Scalp therapies to control hair fall and dandruff.",
    durationMinutes: 30,
    displayOrder: 12,
  },
  {
    slug: "weight-reduction",
    name: "Weight Reduction",
    shortDescription: "Structured weight-loss treatment plans.",
    durationMinutes: 30,
    displayOrder: 13,
  },

  // Diabetology (4 services)
  {
    slug: "vitals-monitoring",
    name: "Vitals Monitoring",
    shortDescription: "Routine vitals check as part of every diabetes visit.",
    durationMinutes: 30,
    displayOrder: 14,
  },
  {
    slug: "complication-checklist",
    name: "Complication Checklist",
    shortDescription: "Systematic screening for diabetes-related complications.",
    durationMinutes: 30,
    displayOrder: 15,
  },
  {
    slug: "diabetic-foot-care",
    name: "Diabetic Foot Care",
    shortDescription: "Dedicated assessment and treatment for diabetic foot complications.",
    durationMinutes: 30,
    displayOrder: 16,
  },
  {
    slug: "neuropathy-screening",
    name: "Neuropathy Screening",
    shortDescription: "Monofilament and vibration testing to catch diabetic nerve damage early.",
    durationMinutes: 30,
    displayOrder: 17,
  },

  // General Medicine (7 services)
  {
    slug: "thyroid-care",
    name: "Thyroid Care",
    shortDescription: "Diagnosis and ongoing management of thyroid conditions.",
    durationMinutes: 30,
    displayOrder: 18,
  },
  {
    slug: "hypertension-management",
    name: "Hypertension Management",
    shortDescription: "Ongoing blood pressure monitoring and a tailored treatment plan.",
    durationMinutes: 30,
    displayOrder: 19,
  },
  {
    slug: "cholesterol-management",
    name: "Cholesterol Management",
    shortDescription: "Screening and treatment plans for cholesterol control.",
    durationMinutes: 30,
    displayOrder: 20,
  },
  {
    slug: "pediatrics",
    name: "Pediatrics",
    shortDescription: "Children's health and general care treatments.",
    durationMinutes: 30,
    displayOrder: 21,
  },
  {
    slug: "gynaecology",
    name: "Gynaecology",
    shortDescription: "Women's health care treatments and consultations.",
    durationMinutes: 30,
    displayOrder: 22,
  },
  {
    slug: "ent-care",
    name: "ENT Care",
    shortDescription: "Ear, nose and throat treatments for all ages.",
    durationMinutes: 30,
    displayOrder: 23,
  },
  {
    slug: "eye-care",
    name: "Eye Care",
    shortDescription: "General eye care consultations and treatment.",
    durationMinutes: 30,
    displayOrder: 24,
  },
]

async function seed() {
  console.log("Seeding all 24 clinic services to Supabase...")

  for (const s of services) {
    const { data: existing } = await supabase
      .from("Service")
      .select("id")
      .eq("slug", s.slug)
      .maybeSingle()

    if (existing) {
      await supabase
        .from("Service")
        .update({
          name: s.name,
          shortDescription: s.shortDescription,
          durationMinutes: s.durationMinutes,
          displayOrder: s.displayOrder,
          active: true,
        })
        .eq("id", existing.id)
      console.log(`Updated: ${s.name}`)
    } else {
      const id = "srv_" + randomBytes(10).toString("hex")
      await supabase.from("Service").insert({
        id,
        slug: s.slug,
        name: s.name,
        shortDescription: s.shortDescription,
        durationMinutes: s.durationMinutes,
        displayOrder: s.displayOrder,
        active: true,
      })
      console.log(`Created: ${s.name}`)
    }
  }

  // Deactivate any old generic services that don't match the 24 clinical services
  const validSlugs = services.map((s) => s.slug)
  const { data: allDbServices } = await supabase.from("Service").select("id, slug, name")
  if (allDbServices) {
    for (const d of allDbServices) {
      if (!validSlugs.includes(d.slug)) {
        await supabase.from("Service").update({ active: false }).eq("id", d.id)
        console.log(`Deactivated legacy service: ${d.name}`)
      }
    }
  }

  console.log("✨ All 24 clinical services synced successfully!")
}

seed().catch((err) => {
  console.error("Error seeding services:", err)
  process.exit(1)
})
