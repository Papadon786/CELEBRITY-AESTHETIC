// Crown Celebrity Aesthetic CRM — comprehensive seed script.
// Idempotent seed script to initialize staff, aesthetic services, doctor availability,
// reviews, FAQs, settings, inventory catalog, alerts, and aesthetic pipeline leads.
import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { scryptSync, randomBytes } from "node:crypto"

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

async function main() {
  console.log("Seeding Crown Celebrity Aesthetic clinic data…")

  // ── Staff ────────────────────────────────────────────────────────────
  // Production / Standard Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@celebrityaesthetic.com" },
    update: {
      name: "Clinic Administrator",
      phone: "9591047171",
      passwordHash: hashPassword("Admin@123"),
      role: "ADMIN",
      active: true,
    },
    create: {
      name: "Clinic Administrator",
      email: "admin@celebrityaesthetic.com",
      phone: "9591047171",
      passwordHash: hashPassword("Admin@123"),
      role: "ADMIN",
      active: true,
    },
  })

  // Lead Specialist & Founder: Naziya Baig
  const naziyaDoctor = await prisma.user.upsert({
    where: { email: "naziya@celebrityaesthetic.com" },
    update: {
      name: "Naziya Baig",
      phone: "9591047171",
      passwordHash: hashPassword("Doctor@123"),
      role: "DOCTOR",
      specialization: "Cosmetologist & Trichologist",
      consultationFee: 800,
      active: true,
    },
    create: {
      name: "Naziya Baig",
      email: "naziya@celebrityaesthetic.com",
      phone: "9591047171",
      passwordHash: hashPassword("Doctor@123"),
      role: "DOCTOR",
      specialization: "Cosmetologist & Trichologist",
      consultationFee: 800,
      active: true,
    },
  })

  // Consultant: Reehal Baig
  const reehalDoctor = await prisma.user.upsert({
    where: { email: "reehal@celebrityaesthetic.com" },
    update: {
      name: "Reehal Baig",
      phone: "9591047171",
      passwordHash: hashPassword("Consult@123"),
      role: "DOCTOR",
      specialization: "Trichology & Aesthetic Consultant",
      consultationFee: 600,
      active: true,
    },
    create: {
      name: "Reehal Baig",
      email: "reehal@celebrityaesthetic.com",
      phone: "9591047171",
      passwordHash: hashPassword("Consult@123"),
      role: "DOCTOR",
      specialization: "Trichology & Aesthetic Consultant",
      consultationFee: 600,
      active: true,
    },
  })

  // Surgical Hair Transplant Team (Satyam Centre)
  const transplantDoctor = await prisma.user.upsert({
    where: { email: "transplant@celebrityaesthetic.com" },
    update: {
      name: "Hair Transplant Team (Satyam Centre)",
      phone: "9591047171",
      passwordHash: hashPassword("Surgeon@123"),
      role: "DOCTOR",
      specialization: "FUE & Bio-FUE Hair Transplant Surgeons",
      consultationFee: 1000,
      active: true,
    },
    create: {
      name: "Hair Transplant Team (Satyam Centre)",
      email: "transplant@celebrityaesthetic.com",
      phone: "9591047171",
      passwordHash: hashPassword("Surgeon@123"),
      role: "DOCTOR",
      specialization: "FUE & Bio-FUE Hair Transplant Surgeons",
      consultationFee: 1000,
      active: true,
    },
  })

  // Receptionist Desk
  await prisma.user.upsert({
    where: { email: "reception@celebrityaesthetic.com" },
    update: {
      name: "Front Desk Receptionist",
      phone: "9591047171",
      passwordHash: hashPassword("Reception@123"),
      role: "RECEPTIONIST",
      active: true,
    },
    create: {
      name: "Front Desk Receptionist",
      email: "reception@celebrityaesthetic.com",
      phone: "9591047171",
      passwordHash: hashPassword("Reception@123"),
      role: "RECEPTIONIST",
      active: true,
    },
  })

  console.log(`  Staff accounts ready: Admin, Naziya Baig, Reehal Baig, Hair Transplant Team, Reception`)

  // ── Doctor availability — Mon-Sat 10:00 AM - 8:00 PM ────────────────
  const practitioners = [naziyaDoctor, reehalDoctor, transplantDoctor]
  for (const doc of practitioners) {
    await prisma.doctorAvailability.deleteMany({ where: { doctorId: doc.id } })
    for (let day = 1; day <= 6; day++) {
      await prisma.doctorAvailability.create({
        data: {
          doctorId: doc.id,
          dayOfWeek: day,
          startTime: "10:00",
          endTime: "20:00",
          slotDurationMinutes: 30,
        },
      })
    }
  }
  console.log("  Doctor availability configured (Mon-Sat 10 AM - 8 PM)")

  // ── Services — Crown Celebrity Aesthetic treatment catalog ─────────
  const serviceDefs = [
    // Hair Restoration
    {
      slug: "advanced-gfc",
      name: "GFC — Growth Factor Concentrate Therapy",
      shortDescription: "Next-generation autologous biological growth factor therapy to activate dormant follicles.",
      price: 5500,
      durationMinutes: 45,
    },
    {
      slug: "advanced-prp",
      name: "Advanced PRP — Platelet-Rich Plasma Therapy",
      shortDescription: "Enriched autologous plasma rich in biological platelets to stimulate micro-vascular circulation.",
      price: 4000,
      durationMinutes: 45,
    },
    {
      slug: "exosomes",
      name: "Exosome Hair Restoration Therapy",
      shortDescription: "Cutting-edge cellular vesicle therapy delivering thousands of bio-active signaling molecules.",
      price: 12000,
      durationMinutes: 45,
    },
    {
      slug: "stem-cell-therapy",
      name: "Follicular Stem Cell Therapy",
      shortDescription: "Micro-graft cellular suspension to regenerate thinning areas with autologous progenitor cells.",
      price: 15000,
      durationMinutes: 60,
    },
    {
      slug: "anti-dandruff-scalp-detox",
      name: "Anti-Dandruff Scalp Detox & Trichology",
      shortDescription: "Clinical scalp peeling, deep follicle clarification, and antifungal infusion therapy.",
      price: 2500,
      durationMinutes: 40,
    },

    // Hair Transplant Specialities (Satyam Centre)
    {
      slug: "male-hair-transplant",
      name: "Male Hair Transplant (FUE / Bio-FUE)",
      shortDescription: "Artisan hairline and crown restoration using high-density micro-FUE tailored to male facial proportions.",
      price: 45000,
      durationMinutes: 360,
    },
    {
      slug: "female-hair-transplant",
      name: "Female Hair Transplant (Diffuse / Parting)",
      shortDescription: "No-shave or discrete donor transplantation designed for female hairline lowering and parting density.",
      price: 45000,
      durationMinutes: 360,
    },
    {
      slug: "fue-hair-transplant",
      name: "FUE Hair Transplant",
      shortDescription: "Advanced Follicular Unit Extraction with micro-punches for zero linear scars and supreme graft survival.",
      price: 40000,
      durationMinutes: 360,
    },
    {
      slug: "beard-hair-transplant",
      name: "Beard & Moustache Hair Transplant",
      shortDescription: "Contoured beard, goatee, and mustache restoration with natural acute-angle follicular implantation.",
      price: 35000,
      durationMinutes: 240,
    },
    {
      slug: "eyebrow-hair-transplant",
      name: "Eyebrow Reconstruction Transplant",
      shortDescription: "Precision single-hair delicate transplantation to restore full, sculpted architectural eyebrows.",
      price: 30000,
      durationMinutes: 180,
    },
    {
      slug: "dhi-hair-transplant",
      name: "Direct Hair Implantation (DHI)",
      shortDescription: "Direct implanter pen technique offering 100% control over depth, angle, and density.",
      price: 55000,
      durationMinutes: 360,
    },
    {
      slug: "unshaven-celebrity-hair-transplant",
      name: "Unshaven / Celebrity Density Hair Transplant",
      shortDescription: "Zero-downtime transplant without shaving donor or recipient zones for undetectable immediate return.",
      price: 65000,
      durationMinutes: 360,
    },
    {
      slug: "scalp-scar-camouflage",
      name: "Scalp Scar Camouflage Transplant",
      shortDescription: "Restoring follicular growth into trauma, burn, or surgical scars.",
      price: 25000,
      durationMinutes: 180,
    },

    // Acne, Scars & Resurfacing
    {
      slug: "mnrf",
      name: "MNRF — Microneedling Radiofrequency",
      shortDescription: "Gold-plated insulated micro-needling with fractional RF energy to rebuild deep dermal collagen.",
      price: 6500,
      durationMinutes: 60,
    },
    {
      slug: "subcision-tca-cross",
      name: "Subcision & TCA Cross for Deep Scars",
      shortDescription: "Targeted mechanical scar release combined with focal high-strength trichloroacetic acid.",
      price: 4500,
      durationMinutes: 45,
    },
    {
      slug: "acne-laser-protocols",
      name: "Acne Laser Resurfacing Protocols",
      shortDescription: "Clinical laser therapy targeting active acne bacteria, sebaceous overactivity, and redness.",
      price: 4000,
      durationMinutes: 45,
    },
    {
      slug: "chemical-peels",
      name: "Advanced Clinical Chemical Peels",
      shortDescription: "Dermatological acid resurfacing customized for acne, active congestion, and texture.",
      price: 2500,
      durationMinutes: 30,
    },

    // Pigmentation, Medi-Facials & Lasers
    {
      slug: "q-switch-laser",
      name: "Q-Switch Nd:YAG Laser for Pigmentation",
      shortDescription: "Photoacoustic nanosecond laser shattering melanin deposits for stubborn melasma and hyperpigmentation.",
      price: 4500,
      durationMinutes: 45,
    },
    {
      slug: "carbon-laser-peel",
      name: "Carbon Laser Hollywood Glow Peel",
      shortDescription: "Liquid carbon paste activated by Q-Switch laser for pore tightening, blackhead removal, and instant radiance.",
      price: 3500,
      durationMinutes: 45,
    },
    {
      slug: "hydrafacial-md",
      name: "HydraFacial MD Medical Grade",
      shortDescription: "Patented vortex-fusion cleansing, acid peel exfoliation, painless extraction, and antioxidant hydration.",
      price: 3500,
      durationMinutes: 60,
    },
    {
      slug: "glutathione-iv",
      name: "IV Glutathione & Antioxidant Infusion",
      shortDescription: "Systemic antioxidant brightening infusion for cellular detoxification and radiant complexion.",
      price: 4000,
      durationMinutes: 45,
    },
    {
      slug: "dark-circles-therapy",
      name: "Under-Eye Dark Circles Protocol",
      shortDescription: "Multi-modality protocol combining gentle laser, carboxy, and peptide infusion for under-eye brightening.",
      price: 3000,
      durationMinutes: 45,
    },
    {
      slug: "laser-hair-removal-full-body",
      name: "US FDA Laser Hair Removal — Full Body",
      shortDescription: "Triple-wavelength diode, alexandrite & Nd:YAG painless permanent hair reduction.",
      price: 12000,
      durationMinutes: 90,
    },
    {
      slug: "laser-hair-removal-face",
      name: "US FDA Laser Hair Removal — Face & Neck",
      shortDescription: "Painless precision laser hair reduction for chin, upper lip, sideburns, and neck.",
      price: 3000,
      durationMinutes: 30,
    },

    // Permanent Makeup (PMU) & Aesthetics
    {
      slug: "microblading-brows",
      name: "Eyebrow Microblading Precision PMU",
      shortDescription: "Ultra-fine manual hair strokes mimicking natural brow hairs with organic Swiss pigments.",
      price: 8500,
      durationMinutes: 90,
    },
    {
      slug: "ombre-powder-brows",
      name: "Ombre Powder Brows PMU",
      shortDescription: "Soft, misty powder makeup gradient brow enhancement providing long-lasting defined elegance.",
      price: 9500,
      durationMinutes: 90,
    },
    {
      slug: "lip-blush",
      name: "Lip Blush & Neutralization PMU",
      shortDescription: "Semi-permanent lip tinting and melanin neutralization for youthful shape, color, and symmetry.",
      price: 8000,
      durationMinutes: 90,
    },
    {
      slug: "scalp-micropigmentation",
      name: "Scalp Micropigmentation (SMP)",
      shortDescription: "Medical hairline tattooing creating the look of a full buzz-cut or high-density hair illusion.",
      price: 18000,
      durationMinutes: 120,
    },
    {
      slug: "botox-anti-wrinkle",
      name: "Botox & Anti-Wrinkle Injections",
      shortDescription: "US FDA approved neuromodulators for crow's feet, forehead lines, frown lines, and jaw slimming.",
      price: 9000,
      durationMinutes: 30,
    },
    {
      slug: "dermal-fillers",
      name: "Dermal Fillers (Lips / Cheeks / Jawline)",
      shortDescription: "Premium cross-linked hyaluronic acid contouring for natural volume restoration.",
      price: 16000,
      durationMinutes: 45,
    },
    {
      slug: "hifu-facelift",
      name: "HIFU Non-Surgical Face & Neck Lift",
      shortDescription: "High-Intensity Focused Ultrasound lifting the SMAS layer for tight, defined jawlines and neck contours.",
      price: 14000,
      durationMinutes: 60,
    },

    // Academy Courses
    {
      slug: "academy-pmu-certification",
      name: "PMU Professional Certification Course",
      shortDescription: "Comprehensive hands-on training covering microblading, ombre brows, lip blush, and pigment science.",
      price: 45000,
      durationMinutes: 480,
    },
    {
      slug: "academy-smp-masterclass",
      name: "SMP Masterclass Certification",
      shortDescription: "Advanced scalp micropigmentation technique, needle depth control, and hairline design masterclass.",
      price: 35000,
      durationMinutes: 480,
    },
    {
      slug: "academy-clinical-aesthetician",
      name: "Clinical Aesthetician Diploma",
      shortDescription: "In-depth training on chemical peels, HydraFacial protocols, laser operation, and patient safety.",
      price: 40000,
      durationMinutes: 480,
    },
  ]

  const services = []
  for (const [i, def] of serviceDefs.entries()) {
    const s = await prisma.service.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        shortDescription: def.shortDescription,
        durationMinutes: def.durationMinutes,
        price: def.price,
        displayOrder: i,
        active: true,
      },
      create: {
        slug: def.slug,
        name: def.name,
        shortDescription: def.shortDescription,
        durationMinutes: def.durationMinutes,
        price: def.price,
        displayOrder: i,
        active: true,
      },
    })
    services.push(s)
  }
  console.log(`  ${services.length} Crown Celebrity Aesthetic services ready`)

  // ── Aesthetic Consumables & Inventory Catalog ───────────────────────
  const medicineDefs = [
    {
      name: "GFC Biological Extraction Kit",
      sku: "INV-GFC-KIT",
      category: "Biological / Regenerative",
      manufacturer: "Wockhardt / Regen",
      unit: "Kit",
      description: "Dedicated vacuum tubes and growth factor activation tubes for autologous GFC preparation.",
      referenceStock: 25,
      lowStockThresholdPercent: 20,
      currentStock: 18,
      unitPrice: 2200.0,
    },
    {
      name: "PRP Vacuum Separation Tubes (Box of 20)",
      sku: "INV-PRP-TUBE",
      category: "Consumable",
      manufacturer: "BD Vacutainer",
      unit: "Box",
      description: "Sodium citrate + gel separator tubes for clinical platelet concentration.",
      referenceStock: 30,
      lowStockThresholdPercent: 20,
      currentStock: 22,
      unitPrice: 1800.0,
    },
    {
      name: "MNRF Insulated 25-Pin Cartridges",
      sku: "INV-MNRF-25",
      category: "Equipment Consumable",
      manufacturer: "Lutronic Medical",
      unit: "Box of 10",
      description: "Sterile gold-plated micro-needle cartridges for RF skin resurfacing.",
      referenceStock: 20,
      lowStockThresholdPercent: 20,
      currentStock: 3, // Low stock alert!
      unitPrice: 3500.0,
    },
    {
      name: "Activated Carbon Cream Lotion (50ml)",
      sku: "INV-CRB-LOT",
      category: "Topical / Laser",
      manufacturer: "Spectra Carbon",
      unit: "Bottle",
      description: "Photo-absorbing nano-carbon paste for Hollywood Laser Peel procedures.",
      referenceStock: 15,
      lowStockThresholdPercent: 20,
      currentStock: 11,
      unitPrice: 950.0,
    },
    {
      name: "HydraFacial Active Serums Set (1, 2 & 3)",
      sku: "INV-HYD-SET",
      category: "Consumable",
      manufacturer: "HydraFacial MD",
      unit: "Set",
      description: "Complete 3-vial set: Activ-4 exfoliation, Beta-HD extraction, and Antiox-6 hydration.",
      referenceStock: 15,
      lowStockThresholdPercent: 20,
      currentStock: 8,
      unitPrice: 4200.0,
    },
    {
      name: "Swiss Color Micro-Pigments for Brows (5-Color Set)",
      sku: "INV-PMU-BROW",
      category: "PMU Supplies",
      manufacturer: "Swiss Color",
      unit: "Set",
      description: "Medical-grade organic iron oxide-free pigments for microblading & ombre brows.",
      referenceStock: 10,
      lowStockThresholdPercent: 20,
      currentStock: 7,
      unitPrice: 6500.0,
    },
    {
      name: "PMU Lip Blush Organic Pigment Vials (30ml)",
      sku: "INV-PMU-LIP",
      category: "PMU Supplies",
      manufacturer: "PhiBrows / Swiss",
      unit: "Vial",
      description: "High retention organic pigment for lip blush and dark lip neutralization.",
      referenceStock: 12,
      lowStockThresholdPercent: 20,
      currentStock: 9,
      unitPrice: 2800.0,
    },
    {
      name: "Microblading 18-U Nano Sterile Blades (Box of 50)",
      sku: "INV-MBL-18U",
      category: "PMU Supplies",
      manufacturer: "Sterile Medical",
      unit: "Box",
      description: "Ultra-fine medical surgical steel 0.18mm U-shaped blades.",
      referenceStock: 25,
      lowStockThresholdPercent: 20,
      currentStock: 19,
      unitPrice: 1500.0,
    },
    {
      name: "Topical Numbing Cream (Lidocaine + Prilocaine 5% 30g)",
      sku: "INV-NUM-5",
      category: "Topical / Anesthetic",
      manufacturer: "Neon Labs",
      unit: "Tube",
      description: "Fast-acting topical dermal numbing for comfortable laser, PMU, and injection sessions.",
      referenceStock: 40,
      lowStockThresholdPercent: 20,
      currentStock: 32,
      unitPrice: 380.0,
    },
    {
      name: "Laser Ultrasound Cooling Gel (5-Liter Jar)",
      sku: "INV-GEL-5L",
      category: "Consumable",
      manufacturer: "Medical Gel Ltd",
      unit: "Canister",
      description: "High-transmissibility hypoallergenic cooling contact gel for laser hair removal.",
      referenceStock: 8,
      lowStockThresholdPercent: 20,
      currentStock: 1, // Critical low stock alert!
      unitPrice: 650.0,
    },
    {
      name: "Minoxidil 5% + Finasteride 0.1% Scalp Solution (60ml)",
      sku: "INV-MIN-5FIN",
      category: "Topical / Medicine",
      manufacturer: "Dr. Reddy's",
      unit: "Bottle",
      description: "Physician-prescribed dual-action topical regrowth solution for androgenetic hair loss.",
      referenceStock: 50,
      lowStockThresholdPercent: 20,
      currentStock: 42,
      unitPrice: 620.0,
    },
    {
      name: "Trichology Hair Follicle Biotin & Multivitamin (60 Tabs)",
      sku: "INV-BIO-SUP",
      category: "Supplements",
      manufacturer: "Cipla Health",
      unit: "Bottle",
      description: "Therapeutic formulation of biotin, saw palmetto, zinc, and amino acids for root strength.",
      referenceStock: 40,
      lowStockThresholdPercent: 20,
      currentStock: 35,
      unitPrice: 780.0,
    },
    {
      name: "Post-Procedure Tinted Mineral Sunscreen SPF 50+ (50ml)",
      sku: "INV-SUN-50",
      category: "Skincare / Post-Care",
      manufacturer: "La Roche-Posay",
      unit: "Tube",
      description: "Broad-spectrum 100% mineral UVA/UVB shield for post-laser and chemical peel healing.",
      referenceStock: 30,
      lowStockThresholdPercent: 20,
      currentStock: 24,
      unitPrice: 1150.0,
    },
    {
      name: "FUE Micro-Punches 0.8mm for Hair Transplant (Box of 20)",
      sku: "INV-FUE-P08",
      category: "Surgical / Transplant",
      manufacturer: "Cole Instruments",
      unit: "Box",
      description: "Serrated surgical grade punches for sharp, atraumatic follicular unit extraction.",
      referenceStock: 15,
      lowStockThresholdPercent: 20,
      currentStock: 12,
      unitPrice: 4800.0,
    },
    {
      name: "Cross-Linked Hyaluronic Acid Dermal Filler (1ml)",
      sku: "INV-FIL-HA1",
      category: "Injectable",
      manufacturer: "Teoxane / Juvederm",
      unit: "Syringe",
      description: "Premium cohesive HA filler for lip definition, nasolabial folds, and cheek volumization.",
      referenceStock: 12,
      lowStockThresholdPercent: 20,
      currentStock: 8,
      unitPrice: 8500.0,
    },
  ]

  for (const med of medicineDefs) {
    const thresholdQty = Math.max(1, Math.floor(med.referenceStock * (med.lowStockThresholdPercent / 100)))
    const item = await prisma.inventoryItem.upsert({
      where: { sku: med.sku },
      update: {
        name: med.name,
        category: med.category,
        manufacturer: med.manufacturer,
        unit: med.unit,
        description: med.description,
        referenceStock: med.referenceStock,
        lowStockThresholdPercent: med.lowStockThresholdPercent,
        lowStockThresholdQty: thresholdQty,
        currentStock: med.currentStock,
        unitPrice: med.unitPrice,
        active: true,
      },
      create: {
        name: med.name,
        sku: med.sku,
        category: med.category,
        manufacturer: med.manufacturer,
        unit: med.unit,
        description: med.description,
        referenceStock: med.referenceStock,
        lowStockThresholdPercent: med.lowStockThresholdPercent,
        lowStockThresholdQty: thresholdQty,
        currentStock: med.currentStock,
        unitPrice: med.unitPrice,
        active: true,
      },
    })

    // Seed alert if stock is low or out
    if (med.currentStock <= thresholdQty) {
      const existingAlert = await prisma.inventoryAlert.findFirst({
        where: { itemId: item.id, status: { in: ["ACTIVE", "ACKNOWLEDGED"] } },
      })
      if (!existingAlert) {
        await prisma.inventoryAlert.create({
          data: {
            itemId: item.id,
            alertType: "LOW_STOCK",
            severity: med.currentStock === 0 ? "CRITICAL" : "HIGH",
            currentQuantity: med.currentStock,
            thresholdQuantity: thresholdQty,
            status: "ACTIVE",
          },
        })
      }
    }
  }
  console.log(`  ${medicineDefs.length} aesthetic inventory consumables & low-stock alerts initialized`)

  // ── Reviews — authentic aesthetic patient reviews ───────────────────
  await prisma.review.deleteMany()
  const reviewDefs = [
    {
      patientName: "Aaliya Parvin",
      rating: 5,
      comment:
        "I had a great experience with Naziya Baig. She quickly identified the root cause of my hair fall and explained the issue very clearly. Her approach with GFC was precise and without unnecessary procedures. I started noticing positive results within 3 sessions! Highly recommended.",
      serviceSlug: "advanced-gfc",
    },
    {
      patientName: "Sneha Vuppala",
      rating: 5,
      comment:
        "Came here for HydraFacial and skin brightening. The clinical hygiene and patient care were exceptional. My skin felt glowing and deeply cleansed. Very pleasant clinic environment.",
      serviceSlug: "hydrafacial-md",
    },
    {
      patientName: "Karthik Gowda",
      rating: 5,
      comment:
        "Underwent FUE Hair Transplant at Satyam Hair Transplant Centre with Crown Celebrity Aesthetic. The surgical precision, hairline mapping, and post-op support were top notch. Natural density has started growing in.",
      serviceSlug: "male-hair-transplant",
    },
    {
      patientName: "Monisha S.",
      rating: 5,
      comment:
        "Done Eyebrow Microblading here. The strokes look so realistic and natural! Naziya mapped my brows to my exact facial bone structure. Absolutely love the results!",
      serviceSlug: "microblading-brows",
    },
    {
      patientName: "Farhan Ahmed",
      rating: 5,
      comment:
        "Treated deep acne scars with MNRF and subcision. The textural improvement after 3 sessions is remarkable. Very professional team.",
      serviceSlug: "mnrf",
    },
    {
      patientName: "Pooja Reddy",
      rating: 5,
      comment:
        "Took the US FDA Laser Hair Removal package. Zero burns, completely comfortable cooling tip, and immense reduction in hair growth. Best laser clinic in Bangalore.",
      serviceSlug: "laser-hair-removal-full-body",
    },
  ]

  for (const [i, def] of reviewDefs.entries()) {
    const service = services.find((s) => s.slug === def.serviceSlug)
    await prisma.review.create({
      data: {
        patientName: def.patientName,
        rating: def.rating,
        comment: def.comment,
        serviceId: service ? service.id : null,
        published: true,
        displayOrder: i,
      },
    })
  }
  console.log(`  ${reviewDefs.length} aesthetic reviews seeded (published)`)

  // ── Clinic settings (website content) ───────────────────────────────
  await prisma.clinicSettings.upsert({
    where: { id: "clinic" },
    create: {
      id: "clinic",
      name: "Crown Celebrity Aesthetic",
      addressLine:
        "The Celebrity Aesthetics, Hair PRP, Permanent Makeup - Satyam Hair Transplant Centre, Bangalore - 560078, Karnataka, India",
      landmark: "Near J.P. Nagar / Satyam Centre",
      phone: "9591047171",
      email: "celebrityaestheticcrown@gmail.com",
      mapQuery:
        "The Celebrity Aesthetics, Hair PRP, Permanent Makeup - Satyam Hair Transplant Centre, Bangalore",
      weekdayOpen: "10:00",
      weekdayClose: "20:00",
      sundayClosed: false,
      heroHeadline: "Advanced Hair Restoration, Clinical Skin Aesthetics & Permanent Makeup.",
      aboutText:
        "Crown Celebrity Aesthetic brings skin, hair, aesthetics and PMU services together within one consultation-led practice in Bangalore.",
    },
    update: {
      name: "Crown Celebrity Aesthetic",
      addressLine:
        "The Celebrity Aesthetics, Hair PRP, Permanent Makeup - Satyam Hair Transplant Centre, Bangalore - 560078, Karnataka, India",
      landmark: "Near J.P. Nagar / Satyam Centre",
      phone: "9591047171",
      email: "celebrityaestheticcrown@gmail.com",
      mapQuery:
        "The Celebrity Aesthetics, Hair PRP, Permanent Makeup - Satyam Hair Transplant Centre, Bangalore",
      weekdayOpen: "10:00",
      weekdayClose: "20:00",
      sundayClosed: false,
      heroHeadline: "Advanced Hair Restoration, Clinical Skin Aesthetics & Permanent Makeup.",
      aboutText:
        "Crown Celebrity Aesthetic brings skin, hair, aesthetics and PMU services together within one consultation-led practice in Bangalore.",
    },
  })
  console.log("  Clinic settings initialized with Crown Celebrity Aesthetic")

  // ── FAQs (exact data from web/components/FAQAccordion.tsx) ──────────
  await prisma.fAQ.deleteMany()
  const faqDefs = [
    {
      question: "How do I book a consultation?",
      answer:
        "You can book a consultation through our contact form, which redirects to WhatsApp, or by messaging us directly on WhatsApp at +91 9591047171.",
    },
    {
      question: "How do I know which treatment is suitable for me?",
      answer:
        "Suitability is best discussed in a consultation, where our cosmetologist and trichologist can review your concerns, scalp/skin analysis, and aesthetic goals before recommending an approach.",
    },
    {
      question: "Do I need a consultation before treatment?",
      answer:
        "Yes — a thorough consultation is recommended before any treatment so that your suitability, procedural expectations, and aftercare can be properly discussed.",
    },
    {
      question: "Are treatments available for both men and women?",
      answer:
        "Yes, all our treatments—including Hair Restoration, Hair Transplant, Laser Hair Removal, Skin Peels, and PMU—are offered for both men and women with protocols tailored to individual biology.",
    },
    {
      question: "How long does a treatment take?",
      answer:
        "Duration varies by treatment. Medi-facials and laser sessions take 45–60 minutes, GFC/PRP takes 45 minutes, PMU sessions take 90–120 minutes, while hair transplants are completed in a single dedicated day.",
    },
    {
      question: "What should I expect after treatment?",
      answer:
        "Aftercare guidance is customized for each procedure. Non-invasive treatments have zero downtime, while procedures like microblading or transplants include full aftercare kits and structured post-care follow-up.",
    },
  ]
  for (const [i, def] of faqDefs.entries()) {
    await prisma.fAQ.create({ data: { ...def, displayOrder: i } })
  }
  console.log(`  ${faqDefs.length} FAQs created from website content`)

  // ── Leads & Sales Pipeline (Aesthetic client leads) ─────────────────
  const existingLead = await prisma.lead.findFirst()
  if (!existingLead) {
    const now = new Date()
    const sampleLeads = [
      {
        name: "Priya Sharma",
        company: "Bangalore Tech Corp",
        email: "priya.sharma@example.com",
        phone: "+91 95910 23451",
        status: "NEW",
        source: "WEBSITE",
        value: 18000,
        icpScore: 8,
        followUpDate: new Date(now.getTime() - 24 * 24 * 60 * 60 * 1000), // overdue
        assignedToId: admin.id,
        notes: "Inquired about GFC Hair Restoration and HydraFacial package.",
      },
      {
        name: "Arjun Rao",
        company: "Rao Enterprises",
        email: "arjun.rao@example.com",
        phone: "+91 95910 23452",
        status: "CONTACTED",
        source: "WHATSAPP",
        value: 55000,
        icpScore: 9,
        followUpDate: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000), // overdue
        assignedToId: admin.id,
        notes: "Inquired about FUE Hair Transplant for receding hairline and crown density.",
      },
      {
        name: "Deepika Nair",
        company: "Fashion & Lifestyle Studio",
        email: "deepika.nair@example.com",
        phone: "+91 95910 23453",
        status: "QUALIFIED",
        source: "INSTAGRAM",
        value: 16500,
        icpScore: 7,
        followUpDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // overdue
        assignedToId: admin.id,
        notes: "Qualified for Eyebrow Microblading + Lip Blush PMU combo.",
      },
      {
        name: "Karthik Varma",
        company: "Varma Consultancy",
        email: "karthik.varma@example.com",
        phone: "+91 95910 23454",
        status: "PROPOSAL",
        source: "GOOGLE",
        value: 26000,
        icpScore: 8,
        followUpDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // overdue
        assignedToId: admin.id,
        notes: "Proposal shared for 4-session MNRF + TCA Cross acne scar resurfacing.",
      },
      {
        name: "Ananya Sen",
        company: "Independent Practitioner",
        email: "ananya.sen@example.com",
        phone: "+91 95910 23455",
        status: "DEMO",
        source: "WEBSITE",
        value: 45000,
        icpScore: 9,
        followUpDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // overdue
        assignedToId: admin.id,
        notes: "Enrolled for Crown Celebrity Aesthetic Academy PMU certification course.",
      },
      {
        name: "Meera Krishnan",
        company: "Bridal Couture Bangalore",
        email: "meera.bridal@example.com",
        phone: "+91 95910 23456",
        status: "NEGOTIATION",
        source: "REFERRAL",
        value: 65000,
        icpScore: 10,
        followUpDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        assignedToId: admin.id,
        notes: "Pre-bridal comprehensive aesthetic package: Laser hair removal, peels & HydraFacials.",
      },
      {
        name: "Rohan Kulkarni",
        company: "Kulkarni Digital",
        email: "rohan.k@example.com",
        phone: "+91 95910 23457",
        status: "WON",
        source: "WALK_IN",
        value: 45000,
        icpScore: 10,
        followUpDate: null,
        assignedToId: admin.id,
        notes: "Converted to patient. Commenced FUE Hair Transplant procedure.",
      },
    ]

    for (const leadData of sampleLeads) {
      await prisma.lead.create({
        data: {
          name: leadData.name,
          company: leadData.company,
          email: leadData.email,
          phone: leadData.phone,
          status: leadData.status as any,
          source: leadData.source as any,
          value: leadData.value,
          icpScore: leadData.icpScore,
          followUpDate: leadData.followUpDate,
          assignedToId: leadData.assignedToId,
          notes: leadData.notes,
          activities: {
            create: {
              type: "STATUS_CHANGE",
              title: "Lead Initialized",
              details: `Seeded into stage ${leadData.status}`,
              authorId: leadData.assignedToId,
            },
          },
        },
      })
    }
    console.log(`  ${sampleLeads.length} aesthetic pipeline leads created`)
  }

  // ── Seed Clinical Aesthetic Retainers / Clients (Crown Celebrity Aesthetic VIP Memberships) ──
  console.log("Seeding VIP Aesthetic Clients & Retainers for Crown Celebrity Aesthetic…")
  await prisma.prospectActivity.deleteMany()
  await prisma.prospect.deleteMany()
  await prisma.clientActivity.deleteMany()
  await prisma.clientAccount.deleteMany()

  const sampleClients = [
    {
      name: "Dr. Naaziya",
      company: "The Celebrity Skincare Aesthetics",
      email: "dr.naaziya@celebrityaesthetic.com",
      phone: "+91 95910 47171",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Dr. Naziya Baig",
      contractValue: 45000,
      renewalDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4d overdue
      renewalStage: "IN_DISCUSSION",
      membershipTier: "Celebrity Black VIP",
      treatmentFocus: "Full Spectrum Cosmetology & Trichology",
      boosterFrequency: "Monthly HydraFacial MD & GFC",
    },
    {
      name: "Meera Krishnan",
      company: "Celebrity Black VIP Skin Passport",
      email: "meera.krishnan@outlook.com",
      phone: "+91 98450 11221",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Dr. Naziya Baig",
      contractValue: 120000,
      renewalDate: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000), // 26d remaining
      renewalStage: "CONFIRMED",
      membershipTier: "Celebrity Black VIP",
      treatmentFocus: "Anti-Aging & Laser Resurfacing",
      boosterFrequency: "Bi-Monthly Carbon Laser & Peels",
    },
    {
      name: "Aarav Kapoor",
      company: "Annual Hair Rejuvenation Retainer",
      email: "aarav.kapoor@gmail.com",
      phone: "+91 98860 33445",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Reehal Baig",
      contractValue: 75000,
      renewalDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      renewalStage: "CONFIRMED",
      membershipTier: "Annual Hair Rejuvenation Retainer",
      treatmentFocus: "Trichology (FUE Post-Op & GFC)",
      boosterFrequency: "Quarterly GFC Booster",
    },
    {
      name: "Bridal Couture Bangalore",
      company: "Bridal Elite Concierge Retainer",
      email: "concierge@bridalcoutureblr.com",
      phone: "+91 94480 55667",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Dr. Naziya Baig",
      contractValue: 85000,
      renewalDate: null,
      renewalStage: "NOT_STARTED",
      membershipTier: "Bridal Elite Concierge",
      treatmentFocus: "Pre-Bridal Radiance Glow & Carbon Peel",
      boosterFrequency: "Bi-Weekly Bridal Protocol",
    },
    {
      name: "Sahara Luxury Wellness",
      company: "Corporate Aesthetic Wellness Partner",
      email: "wellness@saharagroup.in",
      phone: "+91 98440 77889",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Bhumika R",
      contractValue: 60000,
      renewalDate: null,
      renewalStage: "NOT_STARTED",
      membershipTier: "Corporate Wellness Elite",
      treatmentFocus: "Executive Medi-Facials & Peels",
      boosterFrequency: "Monthly Corporate Clinic Days",
    },
    {
      name: "Hotel Chandreshwar Executive Wellness",
      company: "Hotel Chandreshwar Hospitality Spa",
      email: "spa@hotelchandreshwar.com",
      phone: "+91 99001 22334",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Touhid Ahmed",
      contractValue: 40000,
      renewalDate: null,
      renewalStage: "CONFIRMED",
      membershipTier: "Corporate Wellness Elite",
      treatmentFocus: "Hospitality Executive Grooming & Peels",
      boosterFrequency: "Quarterly Aesthetic Sessions",
    },
    {
      name: "Priya Sen",
      company: "Acne Scar Remodeling & Peel Club",
      email: "priya.sen@infy.com",
      phone: "+91 97410 44556",
      status: "ACTIVE",
      healthScore: 55,
      accountManagerName: "Dr. Naziya Baig",
      contractValue: 30000,
      renewalDate: null,
      renewalStage: "CONFIRMED",
      membershipTier: "Skin Passport Glow Club",
      treatmentFocus: "MNRF + Subcision & Yellow Peels",
      boosterFrequency: "Bi-Monthly Scar Therapy",
    },
    {
      name: "Rohan Kulkarni",
      company: "Quarterly GFC Regrowth Club",
      email: "rohan.kulkarni@wipro.com",
      phone: "+91 98455 66778",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Reehal Baig",
      contractValue: 36000,
      renewalDate: null,
      renewalStage: "CONFIRMED",
      membershipTier: "Annual Hair Rejuvenation Retainer",
      treatmentFocus: "GFC Scalp Therapy & Microneedling",
      boosterFrequency: "Quarterly GFC Booster",
    },
    {
      name: "Ananya Luxury Wellness",
      company: "Ananya Aesthetic Sanctuary",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Bhumika R",
      contractValue: 28000,
      renewalStage: "CONFIRMED",
      membershipTier: "Skin Passport Glow Club",
      treatmentFocus: "OxyGeneo & Medi-Facials",
      boosterFrequency: "Monthly Medi-Facial",
    },
    {
      name: "Prestige Aesthetic Club",
      company: "Prestige Society Wellness",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Rayyan Zainullabidin",
      contractValue: 32000,
      renewalStage: "NOT_STARTED",
      membershipTier: "Celebrity Black VIP",
      treatmentFocus: "Anti-Aging & Skin Tightening (HIFU)",
      boosterFrequency: "Quarterly Session",
    },
    {
      name: "Glamour Zone Studio",
      company: "Glamour Zone Hair & Skin Hub",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Touhid Ahmed",
      contractValue: 22000,
      renewalStage: "CONFIRMED",
      membershipTier: "Skin Passport Glow Club",
      treatmentFocus: "Chemical Peels & Derma Polish",
      boosterFrequency: "Bi-Monthly Session",
    },
    {
      name: "Apex Medi-Aesthetics",
      company: "Apex Aesthetic Syndicate",
      status: "ACTIVE",
      healthScore: 55,
      accountManagerName: "Bhumika R",
      contractValue: 48000,
      renewalStage: "CONFIRMED",
      membershipTier: "Corporate Wellness Elite",
      treatmentFocus: "Trichology & Laser Resurfacing",
      boosterFrequency: "Monthly Rotation",
    },
    {
      name: "Elegance Bridal Studio",
      company: "Elegance Bridal Atelier",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Rayyan Zainullabidin",
      contractValue: 34000,
      renewalStage: "NOT_STARTED",
      membershipTier: "Bridal Elite Concierge",
      treatmentFocus: "Pre-Bridal Radiance & Body Polishing",
      boosterFrequency: "Weekly 6-Week Package",
    },
    {
      name: "Radiance Trichology Group",
      company: "Radiance Hair Restoration",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Touhid Ahmed",
      contractValue: 50000,
      renewalStage: "CONFIRMED",
      membershipTier: "Annual Hair Rejuvenation Retainer",
      treatmentFocus: "Advanced PRP & Exosome Therapy",
      boosterFrequency: "Bi-Monthly Therapy",
    },
    {
      name: "Lotus Dermatology Hub",
      company: "Lotus Clinical Aesthetics",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Bhumika R",
      contractValue: 29000,
      renewalStage: "NOT_STARTED",
      membershipTier: "Skin Passport Glow Club",
      treatmentFocus: "Laser Toning & Melasma Protocol",
      boosterFrequency: "Monthly Laser Toning",
    },
    {
      name: "Vogue Hair & Skin Clinic",
      company: "Vogue Aesthetic Suites",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Rayyan Zainullabidin",
      contractValue: 36000,
      renewalStage: "CONFIRMED",
      membershipTier: "Celebrity Black VIP",
      treatmentFocus: "Dermal Fillers & Botox Touch-Ups",
      boosterFrequency: "Semi-Annual Review",
    },
    {
      name: "Urban Glow Retreat",
      company: "Urban Glow Skin Lounge",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Touhid Ahmed",
      contractValue: 19000,
      renewalStage: "NOT_STARTED",
      membershipTier: "Skin Passport Glow Club",
      treatmentFocus: "HydraFacial Deluxe MD",
      boosterFrequency: "Monthly HydraFacial MD",
    },
    {
      name: "Serene Cosmetology",
      company: "Serene Skin Therapies",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Bhumika R",
      contractValue: 21000,
      renewalStage: "CONFIRMED",
      membershipTier: "Skin Passport Glow Club",
      treatmentFocus: "Acne Control & TCA Cross",
      boosterFrequency: "Monthly Clinic Check",
    },
    {
      name: "Monarch Grooming Lounge",
      company: "Monarch Men's Scalp & Skin",
      status: "ACTIVE",
      healthScore: 50,
      accountManagerName: "Rayyan Zainullabidin",
      contractValue: 33000,
      renewalStage: "CONFIRMED",
      membershipTier: "Annual Hair Rejuvenation Retainer",
      treatmentFocus: "Beard Transplant & Scalp Densification",
      boosterFrequency: "Quarterly GFC Booster",
    },
    // 1 Churned client
    {
      name: "Zenith Body Spa",
      company: "Zenith Medi-Spa",
      status: "CHURNED",
      healthScore: 20,
      accountManagerName: "Bhumika R",
      contractValue: 15000,
      renewalStage: "NOT_STARTED",
      membershipTier: "Skin Passport Glow Club",
      treatmentFocus: "Body Polishing & Wraps",
      boosterFrequency: "Expired",
    },
    // 2 Paused clients
    {
      name: "Aura Lifestyle Center",
      company: "Aura Wellness Club",
      status: "PAUSED",
      healthScore: 40,
      accountManagerName: "Touhid Ahmed",
      contractValue: 18000,
      renewalStage: "NOT_STARTED",
      membershipTier: "Corporate Wellness Elite",
      treatmentFocus: "Corporate Laser Packages",
      boosterFrequency: "Paused for Renovation",
    },
    {
      name: "Silk Touch Aesthetics",
      company: "Silk Touch Skin Studio",
      status: "PAUSED",
      healthScore: 45,
      accountManagerName: "Rayyan Zainullabidin",
      contractValue: 20000,
      renewalStage: "NOT_STARTED",
      membershipTier: "Celebrity Black VIP",
      treatmentFocus: "Anti-Aging & Micro-Current",
      boosterFrequency: "Temporarily On Hold",
    },
  ]

  for (const c of sampleClients) {
    await prisma.clientAccount.create({
      data: {
        name: c.name,
        company: c.company,
        email: (c as any).email || null,
        phone: (c as any).phone || null,
        status: c.status as any,
        healthScore: c.healthScore,
        accountManagerName: c.accountManagerName,
        accountManagerId: admin.id,
        contractValue: c.contractValue,
        renewalDate: (c as any).renewalDate || null,
        renewalStage: c.renewalStage as any,
        membershipTier: c.membershipTier,
        treatmentFocus: c.treatmentFocus,
        boosterFrequency: c.boosterFrequency,
        notes: `Crown Celebrity VIP Aesthetic Retainer — ${c.membershipTier} (${c.treatmentFocus})`,
      },
    })
  }
  console.log(`  ${sampleClients.length} VIP client retainers created`)

  // ── Seed Prospects (matches CRM Prospects: 46 Total, 0 Demo, 7 Proposal Sent, 9 Negotiation, 20 Won) ──
  console.log("Seeding Clinical Hair & Skin Prospects for Crown Celebrity Aesthetic…")
  const sampleProspects = [
    // Qualified (10 items - Scalp & Skin Analysis Scheduled)
    {
      name: "Kartik",
      company: "Crown Hair Restoration Inquiry",
      treatmentCategory: "HAIR_TRANSPLANT",
      treatmentInterest: "FUE Hair Transplant (3,200 Grafts)",
      candidateConcern: "Norwood Grade 3 Male Pattern Baldness - Temple Receding",
      doctorPreference: "Dr. Naziya Baig",
      stage: "QUALIFIED",
      value: 0,
      icpScore: 9,
      engagement: 35,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Pradeep",
      company: "GFC Scalp Regrowth Inquiry",
      treatmentCategory: "HAIR_RESTORATION",
      treatmentInterest: "GFC Growth Factor Concentrate (4 Sessions)",
      candidateConcern: "Severe Diffuse Thinning & Crown Hair Shedding",
      doctorPreference: "Reehal Baig",
      stage: "QUALIFIED",
      value: 0,
      icpScore: 8,
      engagement: 30,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Rush Carz VIP Candidate",
      company: "Executive Aesthetic Consultation",
      treatmentCategory: "SKIN_AESTHETICS",
      treatmentInterest: "HydraFacial Deluxe MD + Carbon Peel",
      candidateConcern: "Congested Pores, Hyperpigmentation & Dull Texture",
      doctorPreference: "Dr. Naziya Baig",
      stage: "QUALIFIED",
      value: 0,
      icpScore: 7,
      engagement: 28,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Bangalore Luxury Drives Executive",
      company: "Executive Skin & Hair Consultation",
      treatmentCategory: "HAIR_TRANSPLANT",
      treatmentInterest: "Bio-FUE Unshaven Hair Transplant (2,500 Grafts)",
      candidateConcern: "Frontal Hairline Recession - No Shave Required",
      doctorPreference: "Hair Transplant Team (Satyam Centre)",
      stage: "QUALIFIED",
      value: 0,
      icpScore: 9,
      engagement: 38,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Kavitha Sharma",
      company: "Bridal Radiance Glow Client",
      treatmentCategory: "BRIDAL",
      treatmentInterest: "Pre-Bridal Luxury Radiance Package (8 Weeks)",
      candidateConcern: "Wedding in 2 Months - Pigmentation & Uneven Skin Tone",
      doctorPreference: "Dr. Naziya Baig",
      stage: "QUALIFIED",
      value: 0,
      icpScore: 10,
      engagement: 42,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Aditya Hegde",
      company: "Acne Scar Remodeling Consultation",
      treatmentCategory: "ACNE_SCARS",
      treatmentInterest: "MNRF + Subcision + TCA Cross (3 Sessions)",
      candidateConcern: "Grade 3 Icepick & Rolling Acne Scars on Cheeks",
      doctorPreference: "Dr. Naziya Baig",
      stage: "QUALIFIED",
      value: 0,
      icpScore: 8,
      engagement: 30,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Neha Verma",
      company: "Anti-Aging Facial Sculpting",
      treatmentCategory: "ANTI_AGING",
      treatmentInterest: "Botox Forehead & Juvederm Lip Fillers",
      candidateConcern: "Dynamic Forehead Lines & Nasolabial Creases",
      doctorPreference: "Dr. Naziya Baig",
      stage: "QUALIFIED",
      value: 0,
      icpScore: 8,
      engagement: 32,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Rajesh Nair",
      company: "Trichology Scalp Densification",
      treatmentCategory: "HAIR_RESTORATION",
      treatmentInterest: "Advanced PRP + Exosome Scalp Infusion",
      candidateConcern: "Post-COVID Telogen Effluvium & Crown Thinning",
      doctorPreference: "Reehal Baig",
      stage: "QUALIFIED",
      value: 0,
      icpScore: 7,
      engagement: 26,
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Suresh Babu",
      company: "Beard & Moustache Restoration",
      treatmentCategory: "HAIR_TRANSPLANT",
      treatmentInterest: "FUE Beard Transplant (1,400 Grafts)",
      candidateConcern: "Patchy Beard Growth & Cheek Thinning",
      doctorPreference: "Hair Transplant Team (Satyam Centre)",
      stage: "QUALIFIED",
      value: 0,
      icpScore: 7,
      engagement: 25,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Deepak Rao",
      company: "Microblading & PMU Eyebrow",
      treatmentCategory: "PMU",
      treatmentInterest: "Semi-Permanent Eyebrow Microblading & Scalp SMP",
      candidateConcern: "Sparse Eyebrow Arches & Hairline Concealment",
      doctorPreference: "Dr. Naziya Baig",
      stage: "QUALIFIED",
      value: 0,
      icpScore: 8,
      engagement: 31,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },

    // Proposal Sent (7 total - Clinical Treatment Plans Sent)
    {
      name: "R K Travels VIP Candidate",
      company: "Pre-Bridal Aesthetic Package",
      treatmentCategory: "BRIDAL",
      treatmentInterest: "Bridal Glow Concierge (OxyGeneo + Vampire Facial)",
      candidateConcern: "Pre-Wedding Skin Rejuvenation & Tan Removal",
      doctorPreference: "Dr. Naziya Baig",
      stage: "PROPOSAL_SENT",
      value: 20000,
      icpScore: 8,
      engagement: 45,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Amit Patel",
      company: "FUE Hair Transplant Consultation",
      treatmentCategory: "HAIR_TRANSPLANT",
      treatmentInterest: "FUE Hair Transplant (2,800 Grafts)",
      candidateConcern: "Norwood 3 Vertex Baldness",
      doctorPreference: "Hair Transplant Team (Satyam Centre)",
      stage: "PROPOSAL_SENT",
      value: 35000,
      icpScore: 9,
      engagement: 40,
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Hemanth Gowda",
      company: "GFC Scalp Therapy Series",
      treatmentCategory: "HAIR_RESTORATION",
      treatmentInterest: "GFC Growth Factor Concentrate (6 Sessions)",
      candidateConcern: "Receding Temples & Hair Density Reduction",
      doctorPreference: "Reehal Baig",
      stage: "PROPOSAL_SENT",
      value: 25000,
      icpScore: 7,
      engagement: 35,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Elite Events Executive",
      company: "Executive Skin Resurfacing",
      treatmentCategory: "SKIN_AESTHETICS",
      treatmentInterest: "Carbon Laser Peel & HydraFacial MD (4 Sessions)",
      candidateConcern: "Enlarged Pores, Blackheads & Pigmentation",
      doctorPreference: "Dr. Naziya Baig",
      stage: "PROPOSAL_SENT",
      value: 18000,
      icpScore: 8,
      engagement: 38,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      name: "City Cab Executive Client",
      company: "Scalp PRP & Exosome Regrowth",
      treatmentCategory: "HAIR_RESTORATION",
      treatmentInterest: "PRP + Exosome Therapy (3 Sessions)",
      candidateConcern: "Early Crown Balding",
      doctorPreference: "Reehal Baig",
      stage: "PROPOSAL_SENT",
      value: 22000,
      icpScore: 7,
      engagement: 32,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Golden Star Hospitality VIP",
      company: "Anti-Aging Facial Sculpting",
      treatmentCategory: "ANTI_AGING",
      treatmentInterest: "Botox (50 Units) + Under-Eye Tear Trough Fillers",
      candidateConcern: "Deep Eye Hollows & Crow's Feet Wrinkles",
      doctorPreference: "Dr. Naziya Baig",
      stage: "PROPOSAL_SENT",
      value: 28000,
      icpScore: 9,
      engagement: 48,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Orchid Wellness Candidate",
      company: "Acne Scar MNRF Protocol",
      treatmentCategory: "ACNE_SCARS",
      treatmentInterest: "MNRF + Subcision Protocol (4 Sessions)",
      candidateConcern: "Stubborn Rolling Scars & Post-Inflammatory Erythema",
      doctorPreference: "Dr. Naziya Baig",
      stage: "PROPOSAL_SENT",
      value: 24000,
      icpScore: 8,
      engagement: 36,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },

    // Negotiation (9 total - Procedure Negotiation & Date Selection)
    {
      name: "Oceansky Tours VIP Client",
      company: "Hair Transplant Mega Session",
      treatmentCategory: "HAIR_TRANSPLANT",
      treatmentInterest: "FUE Hair Transplant (3,500 Grafts) + PRP",
      candidateConcern: "Norwood Grade 4 Frontal & Mid-Scalp Balding",
      doctorPreference: "Hair Transplant Team (Satyam Centre)",
      stage: "NEGOTIATION",
      value: 20000,
      icpScore: 9,
      engagement: 55,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Mohammed Farooq",
      company: "Bio-FUE Hair Restoration Mega Plan",
      treatmentCategory: "HAIR_TRANSPLANT",
      treatmentInterest: "Bio-FUE Mega Session (4,000 Grafts)",
      candidateConcern: "Norwood Grade 5 Hair Loss - Crown & Frontal Coverage",
      doctorPreference: "Hair Transplant Team (Satyam Centre)",
      stage: "NEGOTIATION",
      value: 50000,
      icpScore: 10,
      engagement: 65,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Crown Skyline Executive",
      company: "Complete Anti-Aging & Skin Transformation",
      treatmentCategory: "ANTI_AGING",
      treatmentInterest: "HIFU Non-Surgical Facelift + Botox Full Face",
      candidateConcern: "Jowl Sagging, Loose Neck Skin & Forehead Lines",
      doctorPreference: "Dr. Naziya Baig",
      stage: "NEGOTIATION",
      value: 35000,
      icpScore: 9,
      engagement: 58,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Premier Executive Care",
      company: "GFC Scalp Regrowth & Maintenance",
      treatmentCategory: "HAIR_RESTORATION",
      treatmentInterest: "GFC Growth Factor Concentrate (8 Sessions Annual)",
      candidateConcern: "Severe Hair Shedding & Low Follicular Density",
      doctorPreference: "Reehal Baig",
      stage: "NEGOTIATION",
      value: 25000,
      icpScore: 9,
      engagement: 62,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Royal Vista Suites VIP",
      company: "Celebrity Skin Glow & Peel Package",
      treatmentCategory: "SKIN_AESTHETICS",
      treatmentInterest: "HydraFacial Deluxe + Vampire Facial (PRP)",
      candidateConcern: "Dehydrated Skin, Sun Damage & Fine Lines",
      doctorPreference: "Dr. Naziya Baig",
      stage: "NEGOTIATION",
      value: 20000,
      icpScore: 8,
      engagement: 50,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Celebrity Touch Studio VIP",
      company: "Full Pre-Bridal Aesthetic Concierge",
      treatmentCategory: "BRIDAL",
      treatmentInterest: "Bridal Platinum Glow Protocol (12 Weeks)",
      candidateConcern: "Complete Skin Brightening, Back Acne & Medi-Facials",
      doctorPreference: "Dr. Naziya Baig",
      stage: "NEGOTIATION",
      value: 20000,
      icpScore: 9,
      engagement: 54,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Starlight Banquet Ventures VIP",
      company: "Acne Scar Resurfacing Protocol",
      treatmentCategory: "ACNE_SCARS",
      treatmentInterest: "CO2 Fractional Laser + MNRF (3 Sessions)",
      candidateConcern: "Deep Pitted Icepick Scars on Cheeks & Forehead",
      doctorPreference: "Dr. Naziya Baig",
      stage: "NEGOTIATION",
      value: 15000,
      icpScore: 8,
      engagement: 48,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Grand Vista Tours VIP",
      company: "Microblading & SMP Scalp Densification",
      treatmentCategory: "PMU",
      treatmentInterest: "Scalp Micropigmentation (SMP 3 Sessions)",
      candidateConcern: "Crown Thinning & Scalp Shine Concealment",
      doctorPreference: "Reehal Baig",
      stage: "NEGOTIATION",
      value: 10000,
      icpScore: 8,
      engagement: 52,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Imperial Club & Spa VIP",
      company: "GFC Scalp Maintenance",
      treatmentCategory: "HAIR_RESTORATION",
      treatmentInterest: "GFC Scalp Injections (2 Sessions Trial)",
      candidateConcern: "Early Hair Thinning & Volume Loss",
      doctorPreference: "Reehal Baig",
      stage: "NEGOTIATION",
      value: 5000,
      icpScore: 8,
      engagement: 46,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },

    // Closed Won (20 total - Booked Procedures & Treatment Packages)
    ...Array.from({ length: 20 }).map((_, i) => {
      const treatments = [
        { cat: "HAIR_TRANSPLANT", name: "FUE Hair Transplant (2,500 Grafts)", concern: "Grade 3 Balding", doc: "Hair Transplant Team (Satyam Centre)" },
        { cat: "HAIR_RESTORATION", name: "GFC Regrowth Protocol (6 Sessions)", concern: "Diffuse Thinning", doc: "Reehal Baig" },
        { cat: "SKIN_AESTHETICS", name: "HydraFacial Deluxe MD Annual Plan", concern: "Pore Congestion", doc: "Dr. Naziya Baig" },
        { cat: "ANTI_AGING", name: "Botox Full Face & Dermal Fillers", concern: "Facial Wrinkles", doc: "Dr. Naziya Baig" },
        { cat: "ACNE_SCARS", name: "MNRF + Subcision Scar Remodeling", concern: "Boxcar Scars", doc: "Dr. Naziya Baig" },
      ]
      const t = treatments[i % treatments.length]
      return {
        name: `Aesthetic Client ${i + 1}`,
        company: `Crown Aesthetic VIP ${i + 1}`,
        treatmentCategory: t.cat,
        treatmentInterest: t.name,
        candidateConcern: t.concern,
        doctorPreference: t.doc,
        stage: "CLOSED_WON" as const,
        value: 15000 + (i % 5) * 5000,
        icpScore: 9,
        engagement: 80,
        dueDate: null,
      }
    }),
  ]

  for (const p of sampleProspects) {
    await prisma.prospect.create({
      data: {
        name: p.name,
        company: p.company,
        stage: p.stage as any,
        value: p.value,
        icpScore: p.icpScore,
        engagement: p.engagement,
        dueDate: p.dueDate,
        assignedToId: admin.id,
        treatmentCategory: p.treatmentCategory,
        treatmentInterest: p.treatmentInterest,
        candidateConcern: p.candidateConcern,
        doctorPreference: p.doctorPreference,
        notes: `Clinical Aesthetic Candidate for ${p.treatmentInterest} — Primary Concern: ${p.candidateConcern}`,
        activities: {
          create: {
            type: "STAGE_CHANGE",
            title: "Clinical Consultation Intake",
            details: `Scheduled in ${p.stage} with ${p.doctorPreference || "Dr. Naziya Baig"} for ${p.treatmentInterest}`,
            authorId: admin.id,
          },
        },
      },
    })
  }
  console.log(`  ${sampleProspects.length} clinical prospects created`)

  console.log("\n=======================================================")
  console.log(" ✨ Crown Celebrity Aesthetic CRM Data Seeded Successfully!")
  console.log("=======================================================")
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
