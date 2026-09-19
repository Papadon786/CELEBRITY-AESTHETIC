// Aligns Service pricing and InventoryItem stock with Crown Celebrity Aesthetic's
// real treatment lines (Hair Restoration, Hair Transplant, Skin & Laser, PMU, Academy),
// then creates itemized bills (treatment + consumables) so Billing, POS, and Finance
// reflect authentic aesthetic clinic operations. Idempotent: upserts by unique key.
//
// Run with: npx tsx prisma/seed-catalog-billing.ts
import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function withRetry<T>(fn: () => Promise<T>, attempts = 5): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      await new Promise((r) => setTimeout(r, 150 * (i + 1)))
    }
  }
  throw lastErr
}

// ── Crown Celebrity Aesthetic treatment catalog with realistic INR pricing ──
const serviceDefs: Array<{ slug: string; name: string; shortDescription: string; displayOrder: number; price: number }> = [
  // Hair Restoration
  { slug: "advanced-gfc", name: "GFC — Growth Factor Concentrate Therapy", shortDescription: "Next-generation autologous biological growth factor therapy to activate dormant follicles.", displayOrder: 1, price: 5500 },
  { slug: "advanced-prp", name: "Advanced PRP — Platelet-Rich Plasma Therapy", shortDescription: "Enriched autologous plasma rich in biological platelets to stimulate micro-vascular circulation.", displayOrder: 2, price: 4000 },
  { slug: "exosomes", name: "Exosome Hair Restoration Therapy", shortDescription: "Cutting-edge cellular vesicle therapy delivering thousands of bio-active signaling molecules.", displayOrder: 3, price: 12000 },
  { slug: "stem-cell-therapy", name: "Follicular Stem Cell Therapy", shortDescription: "Micro-graft cellular suspension to regenerate thinning areas with autologous progenitor cells.", displayOrder: 4, price: 15000 },
  { slug: "anti-dandruff-scalp-detox", name: "Anti-Dandruff Scalp Detox & Trichology", shortDescription: "Clinical scalp peeling, deep follicle clarification, and antifungal infusion therapy.", displayOrder: 5, price: 2500 },

  // Hair Transplant Specialities (Satyam Centre)
  { slug: "male-hair-transplant", name: "Male Hair Transplant (FUE / Bio-FUE)", shortDescription: "Artisan hairline and crown restoration using high-density micro-FUE tailored to male facial proportions.", displayOrder: 6, price: 45000 },
  { slug: "female-hair-transplant", name: "Female Hair Transplant (Diffuse / Parting)", shortDescription: "No-shave or discrete donor transplantation designed for female hairline lowering and parting density.", displayOrder: 7, price: 45000 },
  { slug: "fue-hair-transplant", name: "FUE Hair Transplant", shortDescription: "Advanced Follicular Unit Extraction with micro-punches for zero linear scars and supreme graft survival.", displayOrder: 8, price: 40000 },
  { slug: "beard-hair-transplant", name: "Beard & Moustache Hair Transplant", shortDescription: "Contoured beard, goatee, and mustache restoration with natural acute-angle follicular implantation.", displayOrder: 9, price: 35000 },
  { slug: "eyebrow-hair-transplant", name: "Eyebrow Reconstruction Transplant", shortDescription: "Precision single-hair delicate transplantation to restore full, sculpted architectural eyebrows.", displayOrder: 10, price: 30000 },
  { slug: "dhi-hair-transplant", name: "Direct Hair Implantation (DHI)", shortDescription: "Direct implanter pen technique offering 100% control over depth, angle, and density.", displayOrder: 11, price: 55000 },

  // Acne, Scars & Resurfacing
  { slug: "mnrf", name: "MNRF — Microneedling Radiofrequency", shortDescription: "Gold-plated insulated micro-needling with fractional RF energy to rebuild deep dermal collagen.", displayOrder: 12, price: 6500 },
  { slug: "subcision-tca-cross", name: "Subcision & TCA Cross for Deep Scars", shortDescription: "Targeted mechanical scar release combined with focal high-strength trichloroacetic acid.", displayOrder: 13, price: 4500 },
  { slug: "chemical-peels", name: "Advanced Clinical Chemical Peels", shortDescription: "Dermatological acid resurfacing customized for acne, active congestion, and texture.", displayOrder: 14, price: 2500 },

  // Pigmentation, Medi-Facials & Lasers
  { slug: "q-switch-laser", name: "Q-Switch Nd:YAG Laser for Pigmentation", shortDescription: "Photoacoustic nanosecond laser shattering melanin deposits for stubborn melasma and hyperpigmentation.", displayOrder: 15, price: 4500 },
  { slug: "carbon-laser-peel", name: "Carbon Laser Hollywood Glow Peel", shortDescription: "Liquid carbon paste activated by Q-Switch laser for pore tightening, blackhead removal, and instant radiance.", displayOrder: 16, price: 3500 },
  { slug: "hydrafacial-md", name: "HydraFacial MD Medical Grade", shortDescription: "Patented vortex-fusion cleansing, acid peel exfoliation, painless extraction, and antioxidant hydration.", displayOrder: 17, price: 3500 },
  { slug: "laser-hair-removal-full-body", name: "US FDA Laser Hair Removal — Full Body", shortDescription: "Triple-wavelength diode, alexandrite & Nd:YAG painless permanent hair reduction.", displayOrder: 18, price: 12000 },

  // Permanent Makeup (PMU) & Aesthetics
  { slug: "microblading-brows", name: "Eyebrow Microblading Precision PMU", shortDescription: "Ultra-fine manual hair strokes mimicking natural brow hairs with organic Swiss pigments.", displayOrder: 19, price: 8500 },
  { slug: "ombre-powder-brows", name: "Ombre Powder Brows PMU", shortDescription: "Soft, misty powder makeup gradient brow enhancement providing long-lasting defined elegance.", displayOrder: 20, price: 9500 },
  { slug: "lip-blush", name: "Lip Blush & Neutralization PMU", shortDescription: "Semi-permanent lip tinting and melanin neutralization for youthful shape, color, and symmetry.", displayOrder: 21, price: 8000 },
  { slug: "scalp-micropigmentation", name: "Scalp Micropigmentation (SMP)", shortDescription: "Medical hairline tattooing creating the look of a full buzz-cut or high-density hair illusion.", displayOrder: 22, price: 18000 },
  { slug: "botox-anti-wrinkle", name: "Botox & Anti-Wrinkle Injections", shortDescription: "US FDA approved neuromodulators for crow's feet, forehead lines, frown lines, and jaw slimming.", displayOrder: 23, price: 9000 },
  { slug: "dermal-fillers", name: "Dermal Fillers (Lips / Cheeks / Jawline)", shortDescription: "Premium cross-linked hyaluronic acid contouring for natural volume restoration.", displayOrder: 24, price: 16000 },

  // Academy
  { slug: "academy-pmu-certification", name: "PMU Professional Certification Course", shortDescription: "Comprehensive hands-on training covering microblading, ombre brows, lip blush, and pigment science.", displayOrder: 25, price: 45000 },
]
const servicePrices: Record<string, number> = Object.fromEntries(serviceDefs.map((s) => [s.slug, s.price]))

// ── Expanded aesthetic consumable & retail inventory ──────────────────────
const inventoryDefs = [
  { sku: "INV-GFC-KIT", name: "GFC Biological Extraction Kit", category: "Biological / Regenerative", manufacturer: "Wockhardt / Regen", unit: "Kit", currentStock: 18, referenceStock: 25, unitPrice: 2200 },
  { sku: "INV-PRP-TUBE", name: "PRP Vacuum Separation Tubes", category: "Consumable", manufacturer: "BD Vacutainer", unit: "Box of 20", currentStock: 22, referenceStock: 30, unitPrice: 1800 },
  { sku: "INV-MNRF-25", name: "MNRF Insulated 25-Pin Cartridges", category: "Equipment Consumable", manufacturer: "Lutronic Medical", unit: "Box of 10", currentStock: 8, referenceStock: 20, unitPrice: 3500 },
  { sku: "INV-CRB-LOT", name: "Activated Carbon Cream Lotion (50ml)", category: "Topical / Laser", manufacturer: "Spectra Carbon", unit: "Bottle", currentStock: 11, referenceStock: 15, unitPrice: 950 },
  { sku: "INV-HYD-SET", name: "HydraFacial Active Serums Set", category: "Consumable", manufacturer: "HydraFacial MD", unit: "Set of 3", currentStock: 8, referenceStock: 15, unitPrice: 4200 },
  { sku: "INV-PMU-BROW", name: "Swiss Color Micro-Pigments for Brows", category: "PMU Supplies", manufacturer: "Swiss Color", unit: "Set", currentStock: 7, referenceStock: 10, unitPrice: 6500 },
  { sku: "INV-PMU-LIP", name: "PMU Lip Blush Organic Pigment Vials", category: "PMU Supplies", manufacturer: "PhiBrows", unit: "Vial 30ml", currentStock: 9, referenceStock: 12, unitPrice: 2800 },
  { sku: "INV-MBL-18U", name: "Microblading 18-U Nano Sterile Blades", category: "PMU Supplies", manufacturer: "Sterile Medical", unit: "Box of 50", currentStock: 19, referenceStock: 25, unitPrice: 1500 },
  { sku: "INV-NUM-5", name: "Topical Numbing Cream (Lidocaine 5%)", category: "Topical / Anesthetic", manufacturer: "Neon Labs", unit: "Tube 30g", currentStock: 32, referenceStock: 40, unitPrice: 380 },
  { sku: "INV-GEL-5L", name: "Laser Ultrasound Cooling Gel (5-Liter)", category: "Consumable", manufacturer: "Medical Gel Ltd", unit: "Canister", currentStock: 5, referenceStock: 8, unitPrice: 650 },
  { sku: "INV-MIN-5FIN", name: "Minoxidil 5% + Finasteride 0.1% Scalp Solution", category: "Topical / Medicine", manufacturer: "Dr. Reddy's", unit: "Bottle 60ml", currentStock: 42, referenceStock: 50, unitPrice: 620 },
  { sku: "INV-BIO-SUP", name: "Trichology Hair Follicle Biotin & Zinc", category: "Supplements", manufacturer: "Cipla Health", unit: "Bottle 60 Tabs", currentStock: 35, referenceStock: 40, unitPrice: 780 },
  { sku: "INV-SUN-50", name: "Post-Procedure Tinted Mineral Sunscreen SPF 50+", category: "Skincare / Post-Care", manufacturer: "La Roche-Posay", unit: "Tube 50ml", currentStock: 24, referenceStock: 30, unitPrice: 1150 },
  { sku: "INV-FUE-P08", name: "FUE Micro-Punches 0.8mm for Hair Transplant", category: "Surgical / Transplant", manufacturer: "Cole Instruments", unit: "Box of 20", currentStock: 12, referenceStock: 15, unitPrice: 4800 },
  { sku: "INV-FIL-HA1", name: "Cross-Linked Hyaluronic Acid Dermal Filler (1ml)", category: "Injectable", manufacturer: "Teoxane / Juvederm", unit: "Syringe", currentStock: 8, referenceStock: 12, unitPrice: 8500 },
]

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

async function main() {
  console.log("Upserting Crown Celebrity Aesthetic treatment catalog…")
  for (const s of serviceDefs) {
    await withRetry(() =>
      prisma.service.upsert({
        where: { slug: s.slug },
        create: { slug: s.slug, name: s.name, shortDescription: s.shortDescription, displayOrder: s.displayOrder, price: s.price, active: true },
        update: { name: s.name, shortDescription: s.shortDescription, displayOrder: s.displayOrder, price: s.price, active: true },
      })
    )
  }
  console.log(`  ${serviceDefs.length} aesthetic services upserted successfully`)

  console.log("Adding aesthetic consumable & retail inventory…")
  const admin = await withRetry(() => prisma.user.findFirstOrThrow({ where: { role: "ADMIN" } }))
  let created = 0
  const items = []
  for (const def of inventoryDefs) {
    const existing = await withRetry(() => prisma.inventoryItem.findUnique({ where: { sku: def.sku } }))
    if (existing) {
      items.push(existing)
      continue
    }
    const item = await withRetry(() =>
      prisma.inventoryItem.create({
        data: {
          sku: def.sku,
          name: def.name,
          category: def.category,
          manufacturer: def.manufacturer,
          unit: def.unit,
          currentStock: def.currentStock,
          referenceStock: def.referenceStock,
          unitPrice: def.unitPrice,
        },
      })
    )
    await withRetry(() =>
      prisma.inventoryTransaction.create({
        data: {
          itemId: item.id,
          type: "STOCK_IN",
          quantity: def.currentStock,
          previousStock: 0,
          newStock: def.currentStock,
          reason: "Initial stock — aesthetic catalog seed",
          performedById: admin.id,
        },
      })
    )
    items.push(item)
    created++
  }
  console.log(`  ${created} new inventory items created (${inventoryDefs.length - created} already existed)`)

  console.log("Creating itemized bills (treatment + dispensed items)…")
  const patients = await withRetry(() => prisma.patient.findMany({ take: 12, orderBy: { createdAt: "asc" } }))
  const receptionist = await withRetry(() => prisma.user.findFirstOrThrow({ where: { role: "RECEPTIONIST" } }).catch(() => admin))
  const services = await withRetry(() => prisma.service.findMany({ where: { slug: { in: Object.keys(servicePrices) } } }))
  const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]))
  const medBySku = Object.fromEntries(items.map((i) => [i.sku, i]))

  const billPlans = [
    { slug: "advanced-gfc", meds: ["INV-GFC-KIT", "INV-MIN-5FIN", "INV-BIO-SUP"], status: "PAID" as const },
    { slug: "advanced-prp", meds: ["INV-PRP-TUBE", "INV-NUM-5"], status: "PAID" as const },
    { slug: "hydrafacial-md", meds: ["INV-HYD-SET", "INV-SUN-50"], status: "PAID" as const },
    { slug: "mnrf", meds: ["INV-MNRF-25", "INV-NUM-5"], status: "PARTIALLY_PAID" as const },
    { slug: "carbon-laser-peel", meds: ["INV-CRB-LOT", "INV-SUN-50"], status: "PAID" as const },
    { slug: "microblading-brows", meds: ["INV-PMU-BROW", "INV-MBL-18U", "INV-NUM-5"], status: "PAID" as const },
    { slug: "lip-blush", meds: ["INV-PMU-LIP", "INV-NUM-5"], status: "PAID" as const },
    { slug: "laser-hair-removal-full-body", meds: ["INV-GEL-5L"], status: "PENDING" as const },
    { slug: "male-hair-transplant", meds: ["INV-FUE-P08", "INV-MIN-5FIN"], status: "PAID" as const },
    { slug: "dermal-fillers", meds: ["INV-FIL-HA1", "INV-NUM-5"], status: "PAID" as const },
  ]

  const existingBillCount = await withRetry(() =>
    prisma.bill.count({ where: { billNumber: { startsWith: "INV-AESTH-" } } })
  )
  if (existingBillCount > 0) {
    console.log(`  Skipping — ${existingBillCount} aesthetic bills already exist (idempotent).`)
  } else if (patients.length > 0) {
    let billCount = 0
    let paymentCount = 0
    for (const [i, plan] of billPlans.entries()) {
      const patient = patients[i % patients.length]
      const service = serviceBySlug[plan.slug]
      if (!patient || !service) continue

      const servicePrice = Number(service.price ?? 0)
      const medItems = plan.meds
        .map((sku) => medBySku[sku])
        .filter(Boolean)
        .map((m) => ({
          description: m!.name,
          quantity: 1,
          unitPrice: Number(m!.unitPrice ?? 0),
          amount: Number(m!.unitPrice ?? 0),
        }))
      const medTotal = medItems.reduce((sum, m) => sum + m.amount, 0)
      const total = servicePrice + medTotal
      const discount = i === 3 ? Math.round(total * 0.1) : 0
      const net = total - discount
      const paid =
        plan.status === "PAID" ? net : plan.status === "PARTIALLY_PAID" ? Math.round(net / 2) : 0

      const bill = await withRetry(() =>
        prisma.bill.create({
          data: {
            billNumber: `INV-AESTH-${String(i + 1).padStart(4, "0")}`,
            patientId: patient.id,
            serviceId: service.id,
            totalAmount: total,
            discountAmount: discount,
            netAmount: net,
            amountPaid: paid,
            balanceDue: net - paid,
            status: plan.status,
            issuedAt: daysAgo(billPlans.length - i),
            items: {
              create: [
                {
                  description: `${service.name} (Procedure)`,
                  quantity: 1,
                  unitPrice: servicePrice,
                  taxRatePercent: 0,
                  taxAmount: 0,
                  amount: servicePrice,
                },
                ...medItems.map((m) => ({
                  description: m.description,
                  quantity: m.quantity,
                  unitPrice: m.unitPrice,
                  taxRatePercent: 0,
                  taxAmount: 0,
                  amount: m.amount,
                })),
              ],
            },
          },
        })
      )
      billCount++

      if (paid > 0) {
        await withRetry(() =>
          prisma.payment.create({
            data: {
              receiptNumber: `REC-AESTH-${String(i + 1).padStart(4, "0")}`,
              patientId: patient.id,
              billId: bill.id,
              amount: paid,
              method: i % 2 === 0 ? "UPI" : "CARD",
              status: "SUCCESS",
              referenceNumber: `TXN${Date.now()}${i}`,
              receivedById: receptionist.id,
              paidAt: daysAgo(billPlans.length - i),
            },
          })
        )
        paymentCount++
      }
    }
    console.log(`  ${billCount} itemized aesthetic bills created (${paymentCount} payments recorded)`)
  }

  console.log("\nCrown Celebrity Aesthetic catalog, inventory & billing alignment complete.")
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
