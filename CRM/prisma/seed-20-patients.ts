import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function nextCounter(key: string, base: number = 100) {
  const existing = await prisma.counter.findUnique({ where: { key } })
  const nextVal = (existing?.value ?? base) + 1
  await prisma.counter.upsert({
    where: { key },
    create: { key, value: nextVal },
    update: { value: nextVal },
  })
  return nextVal
}

async function main() {
  console.log("=========================================================")
  console.log(" Crown Celebrity Aesthetic — Seeding 20 Real Dummy Patients")
  console.log("=========================================================\n")

  // 1. Fetch available doctors
  const doctors = await prisma.user.findMany({
    where: { role: "DOCTOR", active: true },
  })
  if (doctors.length === 0) {
    throw new Error("No active doctors found. Please run base seed first.")
  }

  const drNaziya = doctors.find((d) => d.name.includes("Naziya")) || doctors[0]
  const drReehal = doctors.find((d) => d.name.includes("Reehal")) || doctors[1] || doctors[0]
  const drSurgeon = doctors.find((d) => d.name.includes("Transplant")) || doctors[2] || doctors[0]

  // 2. Fetch services
  const services = await prisma.service.findMany({ where: { active: true } })
  const getService = (query: string) => {
    return (
      services.find((s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.slug.includes(query.toLowerCase())) ||
      services[0]
    )
  }

  // 3. Create or find standard tags
  const tagNames = [
    { name: "VIP Aesthetic", color: "#D4AF37" },
    { name: "Hair PRP", color: "#2563EB" },
    { name: "FUE Transplant", color: "#059669" },
    { name: "PMU Client", color: "#DB2777" },
    { name: "Acne Protocol", color: "#EA580C" },
    { name: "Skin Glow", color: "#7C3AED" },
  ]
  const tagsMap: Record<string, string> = {}
  for (const t of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name: t.name },
      create: t,
      update: t,
    })
    tagsMap[t.name] = tag.id
  }

  const year = new Date().getFullYear()
  const today = new Date()

  // Helper for hours on today
  const todayAt = (hours: number, minutes = 0) => {
    const d = new Date(today)
    d.setHours(hours, minutes, 0, 0)
    return d
  }
  // Helper for days offset
  const daysOffset = (days: number, hours = 11, minutes = 0) => {
    const d = new Date(today)
    d.setDate(d.getDate() + days)
    d.setHours(hours, minutes, 0, 0)
    return d
  }

  // Patient Dataset Definitions (20 rich aesthetic & clinical records)
  const patientData = [
    {
      uhidCode: 101,
      firstName: "Aarav",
      lastName: "Singhania",
      dob: new Date(1995, 4, 15),
      gender: "MALE" as const,
      bloodGroup: "O_POS" as const,
      occupation: "Software Architect",
      phone: "9845011001",
      email: "aarav.singhania@gmail.com",
      addressLine1: "12, 4th Cross, Koramangala 4th Block",
      city: "Bangalore",
      postalCode: "560034",
      careCategory: "HAIR_TRANSPLANT" as const,
      heightCm: 178,
      weightKg: 74,
      source: "WEBSITE",
      notesSummary: "Norwood Grade 3 Male Pattern Baldness with temporal recession. Pre-op bloods clear. Scheduled for FUE 3000 grafts.",
      tag: "FUE Transplant",
      doctor: drSurgeon,
      service: getService("male-hair-transplant"),
      appointmentStatus: "CONFIRMED" as const,
      appointmentDate: daysOffset(3, 10, 0),
      reason: "Pre-surgical consultation and hairline graft boundary marking for FUE 3000 grafts.",
      billAmount: 110000,
      paidAmount: 25000,
      paymentMethod: "UPI" as const,
      leadNotes: "Inquired via website for celebrity density hair transplant.",
      followUp: { days: 4, reason: "Post-transplant graft wash and saline spray protocol review" },
    },
    {
      uhidCode: 102,
      firstName: "Pooja",
      lastName: "Hegde",
      dob: new Date(1993, 7, 21),
      gender: "FEMALE" as const,
      bloodGroup: "B_POS" as const,
      occupation: "Fashion Stylist",
      phone: "9845011002",
      email: "pooja.hegde88@yahoo.com",
      addressLine1: "45, 100ft Road, Indiranagar",
      city: "Bangalore",
      postalCode: "560038",
      careCategory: "PERMANENT_MAKEUP" as const,
      heightCm: 165,
      weightKg: 55,
      source: "INSTAGRAM" as const,
      notesSummary: "Thin lateral eyebrow tails. Completed Precision Microblading session. High pigment retention.",
      tag: "PMU Client",
      doctor: drNaziya,
      service: getService("eyebrow-microblading"),
      appointmentStatus: "COMPLETED" as const,
      appointmentDate: todayAt(10, 30),
      reason: "Precision Eyebrow Microblading PMU procedure.",
      billAmount: 18000,
      paidAmount: 18000,
      paymentMethod: "CARD" as const,
      hasEncounter: true,
      diagnosis: "Hypotrichosis of eyebrows / aesthetic contouring",
      clinicalNotes: "Client requested natural arched microblade strokes with golden-brown pigment. 2-phase anaesthetic applied. Zero adverse reaction.",
      prescription: {
        meds: [
          { name: "PMU Healing Barrier Balm", dosage: "Thin layer", freq: "3 times daily", dur: "7 days", inst: "Keep dry, avoid direct sun" },
          { name: "Gentle Micellar Foam Wash", dosage: "1 pump", freq: "Morning & Night", dur: "14 days", inst: "Dab dry with lint-free tissue" },
        ],
        advice: "Avoid sauna, swimming, and workout sweating for 5 days. Touch-up in 4 weeks.",
      },
      followUp: { days: 28, reason: "Eyebrow PMU 4-week perfection touch-up session" },
    },
    {
      uhidCode: 103,
      firstName: "Vikramaditya",
      lastName: "Rao",
      dob: new Date(1990, 2, 10),
      gender: "MALE" as const,
      bloodGroup: "A_POS" as const,
      occupation: "Venture Partner",
      phone: "9845011003",
      email: "vikram.aditya.rao@outlook.com",
      addressLine1: "214, 27th Main, HSR Layout Sector 1",
      city: "Bangalore",
      postalCode: "560102",
      careCategory: "HAIR_RESTORATION" as const,
      heightCm: 182,
      weightKg: 80,
      source: "WEBSITE",
      notesSummary: "Diffuse vertex thinning. Excellent response to Session 1 GFC. Here for Session 2.",
      tag: "Hair PRP",
      doctor: drReehal,
      service: getService("gfc"),
      appointmentStatus: "IN_CONSULTATION" as const,
      appointmentDate: todayAt(11, 45),
      reason: "Growth Factor Concentrate (GFC) Therapy Session 2.",
      billAmount: 8500,
      paidAmount: 8500,
      paymentMethod: "UPI" as const,
      hasEncounter: true,
      diagnosis: "Androgenetic Alopecia Ludwig/Norwood 2V",
      clinicalNotes: "10ml blood drawn, centrifuged in GFC kit. Growth factors activated and injected via mesotherapy into crown and vertex with minimal discomfort.",
      leadNotes: "Website inquiry for GFC vs PRP therapy.",
      followUp: { days: 30, reason: "GFC Session 3 evaluation" },
    },
    {
      uhidCode: 104,
      firstName: "Meera",
      lastName: "Nambiar",
      dob: new Date(1997, 11, 5),
      gender: "FEMALE" as const,
      bloodGroup: "O_POS" as const,
      occupation: "UX Designer",
      phone: "9845011004",
      email: "meera.nambiar@gmail.com",
      addressLine1: "88, Palm Meadows, Whitefield",
      city: "Bangalore",
      postalCode: "560066",
      careCategory: "SKIN_AND_LASER" as const,
      heightCm: 160,
      weightKg: 52,
      source: "WEBSITE",
      notesSummary: "Post-inflammatory hyperpigmentation with active comedonal acne on cheekbones. Initiated on Glycolic peel protocol.",
      tag: "Acne Protocol",
      doctor: drNaziya,
      service: getService("chemical-peels"),
      appointmentStatus: "ARRIVED" as const,
      appointmentDate: todayAt(12, 30),
      reason: "Salicylic-Glycolic Resurfacing Peel (Session 1).",
      billAmount: 4000,
      paidAmount: 4000,
      paymentMethod: "UPI" as const,
      leadNotes: "Inquired about acne scar reduction and chemical peels on website.",
      followUp: { days: 21, reason: "Chemical peel session 2 progression check" },
    },
    {
      uhidCode: 105,
      firstName: "Kabir",
      lastName: "Merchant",
      dob: new Date(1982, 9, 14),
      gender: "MALE" as const,
      bloodGroup: "B_POS" as const,
      occupation: "Managing Director",
      phone: "9845011005",
      email: "kabir.merchant@rediffmail.com",
      addressLine1: "78, 14th Main, J.P. Nagar 2nd Phase",
      city: "Bangalore",
      postalCode: "560078",
      careCategory: "SKIN_AND_LASER" as const,
      heightCm: 175,
      weightKg: 78,
      source: "WALK_IN",
      notesSummary: "Facial expression lines, forehead horizontal creases, and deep glabella furrows. Scheduled for botox.",
      tag: "VIP Aesthetic",
      doctor: drNaziya,
      service: getService("botox"),
      appointmentStatus: "CONFIRMED" as const,
      appointmentDate: daysOffset(1, 14, 0),
      reason: "Upper face aesthetic botox consultation and mapping.",
      billAmount: 22000,
      paidAmount: 22000,
      paymentMethod: "CARD" as const,
      followUp: { days: 15, reason: "Post-Botox symmetry and muscle relaxation audit" },
    },
    {
      uhidCode: 106,
      firstName: "Dr. Sneha",
      lastName: "Kulkarni",
      dob: new Date(1988, 3, 29),
      gender: "FEMALE" as const,
      bloodGroup: "AB_POS" as const,
      occupation: "Pediatric Radiologist",
      phone: "9845011006",
      email: "sneha.kulkarni.md@gmail.com",
      addressLine1: "54, 15th Cross, Malleshwaram",
      city: "Bangalore",
      postalCode: "560003",
      careCategory: "HAIR_RESTORATION" as const,
      heightCm: 168,
      weightKg: 62,
      source: "REFERRAL",
      notesSummary: "Postpartum telogen effluvium for 4 months. Trichoscopy shows 20% telogen hairs. Initiated on Advanced PRP.",
      tag: "Hair PRP",
      doctor: drReehal,
      service: getService("advanced-prp"),
      appointmentStatus: "COMPLETED" as const,
      appointmentDate: todayAt(9, 30),
      reason: "PRP Session 1 with Meso Scalp Infusion.",
      billAmount: 7500,
      paidAmount: 7500,
      paymentMethod: "UPI" as const,
      hasEncounter: true,
      diagnosis: "Telogen Effluvium (Post-Partum)",
      clinicalNotes: "Platelet count high (290k). PRP extracted and delivered with 32G needle. Dermaroller 0.5mm used.",
      prescription: {
        meds: [
          { name: "Procapil & Redensyl Scalp Serum", dosage: "1 ml", freq: "Once at bedtime", dur: "60 days", inst: "Apply to dry clean scalp" },
          { name: "Biotin 10mg + Micronutrient Cap", dosage: "1 cap", freq: "Daily after lunch", dur: "90 days", inst: "Take with water" },
        ],
        advice: "Do not shampoo scalp for 24 hours. Drink 3L water daily.",
      },
      followUp: { days: 28, reason: "PRP Session 2 scheduled review" },
    },
    {
      uhidCode: 107,
      firstName: "Rohan",
      lastName: "Deshmukh",
      dob: new Date(1998, 8, 12),
      gender: "MALE" as const,
      bloodGroup: "O_POS" as const,
      occupation: "Full Stack Engineer",
      phone: "9845011007",
      email: "rohan.deshmukh@techcorp.in",
      addressLine1: "Green Glen Layout, Bellandur",
      city: "Bangalore",
      postalCode: "560103",
      careCategory: "HAIR_TRANSPLANT" as const,
      heightCm: 173,
      weightKg: 68,
      source: "WEBSITE",
      notesSummary: "Patchy cheek beard growth, desires sharper jawline frame and dense moustache connection.",
      tag: "FUE Transplant",
      doctor: drSurgeon,
      service: getService("beard"),
      appointmentStatus: "CONFIRMED" as const,
      appointmentDate: daysOffset(2, 11, 30),
      reason: "Beard & Moustache Density Reconstruction consultation.",
      billAmount: 45000,
      paidAmount: 10000,
      paymentMethod: "UPI" as const,
      leadNotes: "Website query for beard transplant graft estimation.",
      followUp: { days: 7, reason: "Donor site check and extraction plan confirmation" },
    },
    {
      uhidCode: 108,
      firstName: "Ayesha",
      lastName: "Siddiqua",
      dob: new Date(1995, 1, 18),
      gender: "FEMALE" as const,
      bloodGroup: "B_NEG" as const,
      occupation: "Marketing Director",
      phone: "9845011008",
      email: "ayesha.siddiqua@gmail.com",
      addressLine1: "19, Coles Road, Frazer Town",
      city: "Bangalore",
      postalCode: "560005",
      careCategory: "PERMANENT_MAKEUP" as const,
      heightCm: 162,
      weightKg: 58,
      source: "WEBSITE",
      notesSummary: "Dark upper lip border hyperpigmentation. Dark lip neutralization completed using warm orange tone.",
      tag: "PMU Client",
      doctor: drNaziya,
      service: getService("lip-blush"),
      appointmentStatus: "COMPLETED" as const,
      appointmentDate: todayAt(11, 0),
      reason: "Lip Blush & Dark Lip Neutralization PMU.",
      billAmount: 16000,
      paidAmount: 16000,
      paymentMethod: "CARD" as const,
      hasEncounter: true,
      diagnosis: "Perioral and labial hyperpigmentation / PMU contouring",
      clinicalNotes: "Pre-treated with lip scrub and topical lidocaine 5%. Neutralized with warm coral corrective pigment. Healed tone will soften 40%.",
      prescription: {
        meds: [
          { name: "Acyclovir 400mg Tabs", dosage: "1 tab", freq: "Twice daily", dur: "3 days", inst: "Prophylactic against cold sores" },
          { name: "Vitamin E Lip Repair Balm", dosage: "As needed", freq: "Every 2-3 hours", dur: "10 days", inst: "Keep lips moist constantly" },
        ],
        advice: "Avoid spicy, hot, and staining foods (curry, coffee) for 48 hours. Use a straw.",
      },
      followUp: { days: 35, reason: "Lip blush secondary shading and saturation pass" },
    },
    {
      uhidCode: 109,
      firstName: "Devendra",
      lastName: "Prasad",
      dob: new Date(1974, 5, 23),
      gender: "MALE" as const,
      bloodGroup: "A_POS" as const,
      occupation: "Corporate VP",
      phone: "9845011009",
      email: "dev.prasad@corporategroup.com",
      addressLine1: "9, Palace Cross Road, Sadashivanagar",
      city: "Bangalore",
      postalCode: "560080",
      careCategory: "SKIN_AND_LASER" as const,
      heightCm: 176,
      weightKg: 82,
      source: "WALK_IN",
      notesSummary: "Submental laxity and mid-face volume deflation. HIFU non-surgical lift candidate.",
      tag: "VIP Aesthetic",
      doctor: drNaziya,
      service: getService("hifu"),
      appointmentStatus: "CONFIRMED" as const,
      appointmentDate: daysOffset(1, 16, 0),
      reason: "High-Intensity Focused Ultrasound (HIFU) full face lift.",
      billAmount: 35000,
      paidAmount: 35000,
      paymentMethod: "NET_BANKING" as const,
      followUp: { days: 60, reason: "HIFU neocollagenesis 2-month lift audit" },
    },
    {
      uhidCode: 110,
      firstName: "Nisha",
      lastName: "Varghese",
      dob: new Date(2000, 10, 3),
      gender: "FEMALE" as const,
      bloodGroup: "O_POS" as const,
      occupation: "Product Manager",
      phone: "9845011010",
      email: "nisha.varghese@gmail.com",
      addressLine1: "74, 7th Main, BTM 2nd Stage",
      city: "Bangalore",
      postalCode: "560076",
      careCategory: "SKIN_AND_LASER" as const,
      heightCm: 164,
      weightKg: 54,
      source: "WEBSITE",
      notesSummary: "Ice-pick and boxcar acne scars from teenage breakouts. Undergoing MNRF protocol.",
      tag: "Acne Protocol",
      doctor: drNaziya,
      service: getService("mnrf"),
      appointmentStatus: "COMPLETED" as const,
      appointmentDate: daysOffset(-2, 14, 0),
      reason: "MNRF (Microneedling Radiofrequency) Session 2 of 4.",
      billAmount: 14000,
      paidAmount: 14000,
      paymentMethod: "UPI" as const,
      hasEncounter: true,
      diagnosis: "Atrophic Acne Scars Grade 3",
      clinicalNotes: "Depth set between 1.5mm and 2.0mm. Radiofrequency thermal coagulation delivered uniformly. Post-procedure cryo cooling applied.",
      prescription: {
        meds: [
          { name: "Centella Asiatica Cica Cream", dosage: "Generous layer", freq: "3 times daily", dur: "7 days", inst: "Soothes post-treatment erythema" },
          { name: "Mineral Sunscreen SPF 50+", dosage: "2 fingers", freq: "Every 3 hours", dur: "Daily", inst: "Mandatory UV protection" },
        ],
        advice: "Avoid makeup for 48 hours. Do not pick micro-crusts.",
      },
      followUp: { days: 28, reason: "MNRF Session 3 progression and dermal remodeling check" },
    },
    {
      uhidCode: 111,
      firstName: "Gautam",
      lastName: "Menon",
      dob: new Date(1991, 0, 14),
      gender: "MALE" as const,
      bloodGroup: "B_POS" as const,
      occupation: "Startup Founder",
      phone: "9845011011",
      email: "gautam.menon@startuphub.io",
      addressLine1: "102, Embassy Grove, Marathahalli",
      city: "Bangalore",
      postalCode: "560037",
      careCategory: "HAIR_RESTORATION" as const,
      heightCm: 180,
      weightKg: 79,
      source: "WEBSITE",
      notesSummary: "Severe scalp pruritus and greasy yellow scaling. Trichology evaluation: Seborrheic Dermatitis with follicle blockage.",
      tag: "Hair PRP",
      doctor: drReehal,
      service: getService("anti-dandruff"),
      appointmentStatus: "ARRIVED" as const,
      appointmentDate: todayAt(14, 0),
      reason: "Clinical Scalp Detox, Exfoliation & Trichology Protocol.",
      billAmount: 4500,
      paidAmount: 4500,
      paymentMethod: "UPI" as const,
      leadNotes: "Online booking for scalp detox and chronic dandruff relief.",
      followUp: { days: 14, reason: "Scalp barrier and follicular opening check" },
    },
    {
      uhidCode: 112,
      firstName: "Sunita",
      lastName: "Agarwal",
      dob: new Date(1979, 6, 17),
      gender: "FEMALE" as const,
      bloodGroup: "A_NEG" as const,
      occupation: "Interior Architect",
      phone: "9845011012",
      email: "sunita.agarwal@hotmail.com",
      addressLine1: "33, Kingston Road, Richmond Town",
      city: "Bangalore",
      postalCode: "560025",
      careCategory: "SKIN_AND_LASER" as const,
      heightCm: 158,
      weightKg: 64,
      source: "REFERRAL",
      notesSummary: "Bilateral epidermal and dermal melasma on malar region. Excellent pigment clearance with Q-Switch Nd:YAG laser.",
      tag: "Skin Glow",
      doctor: drNaziya,
      service: getService("q-switch"),
      appointmentStatus: "CONFIRMED" as const,
      appointmentDate: daysOffset(2, 15, 30),
      reason: "Q-Switch Nd:YAG Laser Toning Session 4 of 6.",
      billAmount: 18000,
      paidAmount: 18000,
      paymentMethod: "NET_BANKING" as const,
      followUp: { days: 21, reason: "Laser toning session 5 and Wood's lamp pigment check" },
    },
    {
      uhidCode: 113,
      firstName: "Tarun",
      lastName: "Bhatia",
      dob: new Date(1986, 11, 28),
      gender: "MALE" as const,
      bloodGroup: "O_POS" as const,
      occupation: "Restaurateur",
      phone: "9845011013",
      email: "tarun.bhatia@gmail.com",
      addressLine1: "15, Cunningham Road",
      city: "Bangalore",
      postalCode: "560052",
      careCategory: "PERMANENT_MAKEUP" as const,
      heightCm: 177,
      weightKg: 85,
      source: "WEBSITE",
      notesSummary: "Historical linear FUT scar from 2018 in occipital scalp. Completed SMP scar camouflage with organic carbon pigment.",
      tag: "PMU Client",
      doctor: drNaziya,
      service: getService("smp"),
      appointmentStatus: "COMPLETED" as const,
      appointmentDate: daysOffset(-3, 11, 0),
      reason: "Scalp Micropigmentation (SMP) Scar Camouflage Session 2.",
      billAmount: 22000,
      paidAmount: 22000,
      paymentMethod: "UPI" as const,
      hasEncounter: true,
      diagnosis: "Cicatricial Alopecia / Post-surgical donor scar",
      clinicalNotes: "Organic carbon pigment micro-dots placed at 1.2mm depth mimicking follicular units. Scar 85% visually concealed.",
      leadNotes: "Website inquiry about SMP for scalp scar camouflage.",
      followUp: { days: 60, reason: "SMP pigment retention and fade check" },
    },
    {
      uhidCode: 114,
      firstName: "Preethi",
      lastName: "Sundaram",
      dob: new Date(1992, 3, 4),
      gender: "FEMALE" as const,
      bloodGroup: "B_POS" as const,
      occupation: "Brand Consultant",
      phone: "9845011014",
      email: "preethi.sundaram@gmail.com",
      addressLine1: "112, 9th Main, Jayanagar 4th Block",
      city: "Bangalore",
      postalCode: "560011",
      careCategory: "SKIN_AND_LASER" as const,
      heightCm: 167,
      weightKg: 57,
      source: "WEBSITE",
      notesSummary: "Pre-wedding skin preparation. HydraFacial MD completed today. Instant cellular hydration and lymphatic drainage achieved.",
      tag: "Skin Glow",
      doctor: drNaziya,
      service: getService("hydrafacial"),
      appointmentStatus: "COMPLETED" as const,
      appointmentDate: todayAt(13, 0),
      reason: "HydraFacial MD Medical Grade Luxury Protocol.",
      billAmount: 9500,
      paidAmount: 9500,
      paymentMethod: "UPI" as const,
      hasEncounter: true,
      diagnosis: "Dehydrated stratum corneum with congested T-zone",
      clinicalNotes: "Vortex suction extracted blackheads effectively. Infused with antioxidants and hyaluronic peptide complex.",
      prescription: {
        meds: [
          { name: "Hydrating Hyaluronic Essence", dosage: "3 drops", freq: "Twice daily", dur: "30 days", inst: "Apply on damp skin" },
          { name: "Broad Spectrum Tinted Sunscreen SPF50", dosage: "2 pumps", freq: "Every morning", dur: "Continuous", inst: "Reapply if outdoors" },
        ],
        advice: "Avoid exfoliating acids for 4 days to preserve radiant glow barrier.",
      },
      followUp: { days: 21, reason: "Pre-event secondary HydraFacial booster" },
    },
    {
      uhidCode: 115,
      firstName: "Manish",
      lastName: "Chawla",
      dob: new Date(1989, 7, 30),
      gender: "MALE" as const,
      bloodGroup: "O_POS" as const,
      occupation: "General Counsel",
      phone: "9845011015",
      email: "manish.chawla@globalcounsel.com",
      addressLine1: "Tower 4, Concorde Silicon Valley, Electronic City",
      city: "Bangalore",
      postalCode: "560100",
      careCategory: "HAIR_TRANSPLANT" as const,
      heightCm: 181,
      weightKg: 77,
      source: "REFERRAL",
      notesSummary: "Bitemporal and hairline recession. DHI technique preferred for maximum celebrity graft density. Surgery booked.",
      tag: "FUE Transplant",
      doctor: drSurgeon,
      service: getService("direct-hair"),
      appointmentStatus: "CONFIRMED" as const,
      appointmentDate: daysOffset(4, 9, 0),
      reason: "Direct Hair Implantation (DHI) 2500 Grafts procedure.",
      billAmount: 135000,
      paidAmount: 35000,
      paymentMethod: "NET_BANKING" as const,
      followUp: { days: 5, reason: "Day 1 post-op bandage removal and head wash" },
    },
    {
      uhidCode: 116,
      firstName: "Kavita",
      lastName: "Reddy",
      dob: new Date(1996, 2, 8),
      gender: "FEMALE" as const,
      bloodGroup: "A_POS" as const,
      occupation: "Financial Analyst",
      phone: "9845011016",
      email: "kavita.reddy@gmail.com",
      addressLine1: "65, 80ft Road, Banashankari 3rd Stage",
      city: "Bangalore",
      postalCode: "560085",
      careCategory: "SKIN_AND_LASER" as const,
      heightCm: 163,
      weightKg: 53,
      source: "WEBSITE",
      notesSummary: "Periorbital dark rings with hollow tear troughs. Scheduled for under-eye clinical peptide mesotherapy.",
      tag: "Skin Glow",
      doctor: drNaziya,
      service: getService("under-eye"),
      appointmentStatus: "PENDING" as const,
      appointmentDate: daysOffset(1, 15, 30),
      reason: "Under-Eye Dark Circles & Tear Trough Rejuvenation Protocol.",
      billAmount: 6500,
      paidAmount: 0,
      paymentMethod: "UPI" as const,
      leadNotes: "Online booking for dark circles treatment protocol.",
      followUp: { days: 14, reason: "Under-eye pigment lightening check" },
    },
    {
      uhidCode: 117,
      firstName: "Arunachalam",
      lastName: "S.",
      dob: new Date(1984, 10, 19),
      gender: "MALE" as const,
      bloodGroup: "B_POS" as const,
      occupation: "Management Consultant",
      phone: "9845011017",
      email: "arun.s@consulting.in",
      addressLine1: "42, Chord Road, Rajajinagar",
      city: "Bangalore",
      postalCode: "560010",
      careCategory: "HAIR_RESTORATION" as const,
      heightCm: 174,
      weightKg: 73,
      source: "CRM",
      notesSummary: "Severe miniaturization on mid-scalp. Candidate for Exosome cellular regenerative therapy.",
      tag: "Hair PRP",
      doctor: drReehal,
      service: getService("exosome"),
      appointmentStatus: "CONFIRMED" as const,
      appointmentDate: daysOffset(3, 16, 0),
      reason: "Exosome Hair Follicle Regeneration Therapy.",
      billAmount: 25000,
      paidAmount: 25000,
      paymentMethod: "CARD" as const,
      followUp: { days: 45, reason: "Exosome hair diameter and density trichometry check" },
    },
    {
      uhidCode: 118,
      firstName: "Divya",
      lastName: "Bharathi",
      dob: new Date(1999, 4, 25),
      gender: "FEMALE" as const,
      bloodGroup: "O_POS" as const,
      occupation: "Content Creator",
      phone: "9845011018",
      email: "divya.bharathi@gmail.com",
      addressLine1: "81, CMR Road, Kalyan Nagar",
      city: "Bangalore",
      postalCode: "560043",
      careCategory: "SKIN_AND_LASER" as const,
      heightCm: 161,
      weightKg: 51,
      source: "INSTAGRAM" as const,
      notesSummary: "Undergoing US FDA Triple Wavelength diode laser hair reduction for face and neck. Session 3 completed.",
      tag: "Skin Glow",
      doctor: drNaziya,
      service: getService("laser-hair-removal"),
      appointmentStatus: "COMPLETED" as const,
      appointmentDate: todayAt(15, 30),
      reason: "US FDA Laser Hair Removal — Face & Neck (Session 3).",
      billAmount: 6000,
      paidAmount: 6000,
      paymentMethod: "UPI" as const,
      hasEncounter: true,
      diagnosis: "Idiopathic Hirsutism / Aesthetic Hair Reduction",
      clinicalNotes: "Spot size 12x20mm, fluence 22 J/cm2 with continuous sapphire contact cooling. 75% hair clearance observed from baseline.",
      prescription: {
        meds: [
          { name: "Post-Laser Soothing Aloe Gel", dosage: "Apply generously", freq: "Twice daily", dur: "3 days", inst: "Store in refrigerator for cool relief" },
        ],
        advice: "Avoid hot showers, steam, and direct sun exposure for 48 hours.",
      },
      followUp: { days: 42, reason: "Laser Hair Removal Session 4 due" },
    },
    {
      uhidCode: 119,
      firstName: "Harish",
      lastName: "Venkatesh",
      dob: new Date(1994, 0, 11),
      gender: "MALE" as const,
      bloodGroup: "A_POS" as const,
      occupation: "Fintech Lead",
      phone: "9845011019",
      email: "harish.v@fintech.co",
      addressLine1: "Villa 14, Rainbow Drive, Sarjapur Road",
      city: "Bangalore",
      postalCode: "560035",
      careCategory: "HAIR_TRANSPLANT" as const,
      heightCm: 179,
      weightKg: 75,
      source: "WEBSITE",
      notesSummary: "Wants celebrity-grade hairline without shaving existing hair. Booked for unshaven FUE transplant.",
      tag: "VIP Aesthetic",
      doctor: drSurgeon,
      service: getService("unshaven"),
      appointmentStatus: "CONFIRMED" as const,
      appointmentDate: daysOffset(2, 10, 0),
      reason: "Unshaven / Celebrity Density Hair Transplant consultation.",
      billAmount: 120000,
      paidAmount: 30000,
      paymentMethod: "NET_BANKING" as const,
      leadNotes: "Online booking: Inquired specifically for unshaven hair transplant procedure.",
      followUp: { days: 3, reason: "Donor density mapping and hairline stencil confirmation" },
    },
    {
      uhidCode: 120,
      firstName: "Shreya",
      lastName: "Mukherjee",
      dob: new Date(1991, 5, 27),
      gender: "FEMALE" as const,
      bloodGroup: "AB_POS" as const,
      occupation: "Curator & Gallery Owner",
      phone: "9845011020",
      email: "shreya.mukherjee@arts.org",
      addressLine1: "28, Lavelle Road",
      city: "Bangalore",
      postalCode: "560001",
      careCategory: "PERMANENT_MAKEUP" as const,
      heightCm: 166,
      weightKg: 60,
      source: "WEBSITE",
      notesSummary: "Seeking soft, makeup-free brows. Powder Ombre PMU consultation and mapping session.",
      tag: "PMU Client",
      doctor: drNaziya,
      service: getService("ombre-powder"),
      appointmentStatus: "ARRIVED" as const,
      appointmentDate: todayAt(16, 0),
      reason: "Ombre Powder Brows PMU procedure.",
      billAmount: 16000,
      paidAmount: 16000,
      paymentMethod: "CARD" as const,
      leadNotes: "Online enquiry submitted for Ombre Powder Brows.",
      followUp: { days: 30, reason: "Ombre brows healed inspection and booster" },
    },
  ]

  // Clean up any previously seeded dummy records for idempotency
  const dummyUhids = patientData.map((p) => `ZC-${year}-${String(p.uhidCode).padStart(6, "0")}`)
  const dummyPhones = patientData.map((p) => p.phone)
  await prisma.leadActivity.deleteMany({ where: { lead: { phone: { in: dummyPhones } } } })
  await prisma.lead.deleteMany({ where: { phone: { in: dummyPhones } } })
  await prisma.patient.deleteMany({ where: { uhid: { in: dummyUhids } } })

  let count = 0
  for (const p of patientData) {
    const uhid = `ZC-${year}-${String(p.uhidCode).padStart(6, "0")}`

    // Upsert Patient
    const patient = await prisma.patient.upsert({
      where: { uhid },
      update: {
        firstName: p.firstName,
        lastName: p.lastName,
        dob: p.dob,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        occupation: p.occupation,
        heightCm: p.heightCm,
        weightKg: p.weightKg,
        careCategory: p.careCategory,
        phone: p.phone,
        email: p.email,
        addressLine1: p.addressLine1,
        city: p.city,
        state: "Karnataka",
        postalCode: p.postalCode,
        country: "India",
        notesSummary: p.notesSummary,
        source: p.source,
        status: "ACTIVE",
        registrationStatus: "CONFIRMED",
      },
      create: {
        uhid,
        firstName: p.firstName,
        lastName: p.lastName,
        dob: p.dob,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        occupation: p.occupation,
        heightCm: p.heightCm,
        weightKg: p.weightKg,
        careCategory: p.careCategory,
        phone: p.phone,
        email: p.email,
        addressLine1: p.addressLine1,
        city: p.city,
        state: "Karnataka",
        postalCode: p.postalCode,
        country: "India",
        notesSummary: p.notesSummary,
        source: p.source,
        status: "ACTIVE",
        registrationStatus: "CONFIRMED",
        communicationPreference: {
          create: {
            preferredChannel: "WHATSAPP",
            allowWhatsapp: true,
            allowSms: true,
            allowEmail: true,
          },
        },
      },
    })

    // Attach Tag
    if (tagsMap[p.tag]) {
      await prisma.patientTag.upsert({
        where: {
          patientId_tagId: {
            patientId: patient.id,
            tagId: tagsMap[p.tag],
          },
        },
        create: {
          patientId: patient.id,
          tagId: tagsMap[p.tag],
        },
        update: {},
      })
    }

    // Appointment
    const aptCode = `APT-${year}-${String(p.uhidCode).padStart(6, "0")}`
    const appointment = await prisma.appointment.upsert({
      where: { appointmentCode: aptCode },
      update: {
        scheduledAt: p.appointmentDate,
        status: p.appointmentStatus,
        reason: p.reason,
        serviceId: p.service.id,
        doctorId: p.doctor.id,
        checkedInAt: ["ARRIVED", "IN_CONSULTATION", "COMPLETED"].includes(p.appointmentStatus)
          ? p.appointmentDate
          : null,
        startedAt: ["IN_CONSULTATION", "COMPLETED"].includes(p.appointmentStatus)
          ? p.appointmentDate
          : null,
        completedAt: p.appointmentStatus === "COMPLETED"
          ? new Date(p.appointmentDate.getTime() + 45 * 60 * 1000)
          : null,
      },
      create: {
        appointmentCode: aptCode,
        patientId: patient.id,
        doctorId: p.doctor.id,
        serviceId: p.service.id,
        scheduledAt: p.appointmentDate,
        durationMinutes: p.service.durationMinutes ?? 30,
        type: p.source === "WALK_IN" ? "WALK_IN" : "IN_PERSON",
        status: p.appointmentStatus,
        source: p.source === "WEBSITE" ? "WEBSITE" : "CRM",
        reason: p.reason,
        checkedInAt: ["ARRIVED", "IN_CONSULTATION", "COMPLETED"].includes(p.appointmentStatus)
          ? p.appointmentDate
          : null,
        startedAt: ["IN_CONSULTATION", "COMPLETED"].includes(p.appointmentStatus)
          ? p.appointmentDate
          : null,
        completedAt: p.appointmentStatus === "COMPLETED"
          ? new Date(p.appointmentDate.getTime() + 45 * 60 * 1000)
          : null,
      },
    })

    // Encounter + Clinical Notes + Prescription (if completed)
    if (p.hasEncounter) {
      const encounter = await prisma.encounter.create({
        data: {
          patientId: patient.id,
          doctorId: p.doctor.id,
          appointmentId: appointment.id,
          encounterDate: p.appointmentDate,
          chiefComplaints: [p.reason],
          status: "FINALIZED",
          signedAt: new Date(p.appointmentDate.getTime() + 40 * 60 * 1000),
          vitals: {
            create: {
              patientId: patient.id,
              heightCm: p.heightCm,
              weightKg: p.weightKg,
              bmi: +(p.weightKg / Math.pow(p.heightCm / 100, 2)).toFixed(1),
              bpSystolic: 118,
              bpDiastolic: 78,
              pulseBpm: 72,
              recordedAt: p.appointmentDate,
            },
          },
          diagnoses: {
            create: {
              patientId: patient.id,
              description: p.diagnosis || "Aesthetic clinical review",
              type: "PRIMARY",
              status: "ACTIVE",
            },
          },
          clinicalNote: {
            create: {
              patientId: patient.id,
              doctorId: p.doctor.id,
              subjective: `Patient presented with concern: ${p.reason}`,
              objective: `Skin and hair examination completed. ${p.clinicalNotes || "Normal dermatological parameters."}`,
              assessment: p.diagnosis || "Aesthetic clinical indication verified",
              plan: `Treatment protocol executed. Follow up scheduled. ${p.prescription?.advice || ""}`,
              status: "SIGNED",
              signedAt: new Date(p.appointmentDate.getTime() + 40 * 60 * 1000),
            },
          },
        },
      })

      if (p.prescription) {
        const rxNumber = `RX-${year}-${String(p.uhidCode).padStart(6, "0")}`
        await prisma.prescription.create({
          data: {
            prescriptionNumber: rxNumber,
            patientId: patient.id,
            doctorId: p.doctor.id,
            appointmentId: appointment.id,
            encounterId: encounter.id,
            diagnosis: p.diagnosis,
            advice: p.prescription.advice,
            items: {
              create: p.prescription.meds.map((m) => ({
                medicineName: m.name,
                dosage: m.dosage,
                frequency: m.freq,
                duration: m.dur,
                instructions: m.inst,
              })),
            },
          },
        })
      }
    }

    // Billing & Payment
    const billNumber = `INV-${year}-${String(p.uhidCode).padStart(6, "0")}`
    const existingBill = await prisma.bill.findUnique({ where: { billNumber } })
    if (!existingBill) {
      const billStatus =
        p.paidAmount >= p.billAmount
          ? "PAID"
          : p.paidAmount > 0
          ? "PARTIALLY_PAID"
          : "PENDING"

      const bill = await prisma.bill.create({
        data: {
          billNumber,
          patientId: patient.id,
          appointmentId: appointment.id,
          serviceId: p.service.id,
          totalAmount: p.billAmount,
          discountAmount: 0,
          taxAmount: Math.round(p.billAmount * 0.18),
          netAmount: p.billAmount,
          amountPaid: p.paidAmount,
          balanceDue: Math.max(0, p.billAmount - p.paidAmount),
          status: billStatus,
          items: {
            create: [
              {
                description: p.service.name,
                quantity: 1,
                unitPrice: p.billAmount,
                amount: p.billAmount,
              },
            ],
          },
        },
      })

      if (p.paidAmount > 0) {
        await prisma.payment.create({
          data: {
            receiptNumber: `RCPT-${year}-${String(p.uhidCode).padStart(6, "0")}`,
            patientId: patient.id,
            billId: bill.id,
            amount: p.paidAmount,
            method: p.paymentMethod,
            status: "SUCCESS",
            paidAt: p.appointmentDate,
            receivedById: p.doctor.id,
          },
        })
      }
    }

    // Follow-up
    if (p.followUp) {
      await prisma.followUp.create({
        data: {
          patientId: patient.id,
          appointmentId: appointment.id,
          assignedToId: p.doctor.id,
          dueDate: daysOffset(p.followUp.days, 11, 0),
          reason: p.followUp.reason,
          status: "PENDING",
        },
      })
    }

    // Lead (for website/enquiry patients)
    if (p.source === "WEBSITE" || p.leadNotes) {
      await prisma.lead.create({
        data: {
          name: `${p.firstName} ${p.lastName}`,
          phone: p.phone,
          email: p.email,
          status: p.appointmentStatus === "COMPLETED" ? "WON" : "CONTACTED",
          source: p.source === "WEBSITE" ? "WEBSITE" : "WALK_IN",
          sourceDetail: `Website Enquiry: ${p.service.name}`,
          notes: `${p.notesSummary}\nAppointment: ${aptCode}`,
          value: p.billAmount,
          icpScore: 9,
          assignedToId: p.doctor.id,
          convertedPatientId: patient.id,
          activities: {
            create: [
              {
                type: "NOTE",
                title: "Website Booking Received",
                details: `Patient booked online for ${p.service.name}. Preferred date: ${p.appointmentDate.toLocaleDateString("en-IN")}`,
              },
              {
                type: "CALL",
                title: "Reception Confirmation Call",
                details: "Contacted patient, confirmed appointment slot and medical intake details.",
              },
            ],
          },
        },
      })
    }

    count++
    console.log(`✅ [${count}/20] ${p.firstName} ${p.lastName} (${uhid})`)
    console.log(`   🏥 Care Category: ${p.careCategory} | Doctor: ${p.doctor.name}`)
    console.log(`   📅 Appointment:   ${aptCode} (${p.appointmentStatus})`)
    console.log(`   💳 Billing:       ₹${p.billAmount.toLocaleString()} (${p.paidAmount >= p.billAmount ? "PAID" : "PARTIAL"})\n`)
  }

  console.log("=========================================================")
  console.log(` ✨ Successfully seeded all ${count} Crown Celebrity Aesthetic Patients!`)
  console.log("=========================================================")
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
