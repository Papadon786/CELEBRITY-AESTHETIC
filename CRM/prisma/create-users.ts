import "dotenv/config"
import { createClient } from "@supabase/supabase-js"
import { scryptSync, randomBytes } from "node:crypto"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  ""

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

async function main() {
  console.log("=========================================================")
  console.log(" Crown Celebrity Aesthetic CRM — Supabase Admin & Staff Account Setup")
  console.log("=========================================================\n")

  const accounts = [
    // Primary / Crown Celebrity Aesthetic Logins
    {
      name: "Clinic Administrator",
      email: "admin@celebrityaesthetic.com",
      phone: "9591047171",
      password: "Admin@123",
      role: "ADMIN" as const,
      specialization: "Aesthetic Clinic Management",
    },
    {
      name: "Naziya Baig",
      email: "naziya@celebrityaesthetic.com",
      phone: "9591047171",
      password: "Doctor@123",
      role: "DOCTOR" as const,
      specialization: "Cosmetologist & Trichologist",
      consultationFee: 800,
    },
    {
      name: "Reehal Baig",
      email: "reehal@celebrityaesthetic.com",
      phone: "9591047171",
      password: "Consult@123",
      role: "DOCTOR" as const,
      specialization: "Trichology & Aesthetic Consultant",
      consultationFee: 600,
    },
    {
      name: "Hair Transplant Team",
      email: "transplant@celebrityaesthetic.com",
      phone: "9591047171",
      password: "Surgeon@123",
      role: "DOCTOR" as const,
      specialization: "FUE & Bio-FUE Hair Transplant Surgeons",
      consultationFee: 1000,
    },
    {
      name: "Front Desk Receptionist",
      email: "reception@celebrityaesthetic.com",
      phone: "9591047171",
      password: "Reception@123",
      role: "RECEPTIONIST" as const,
    },
  ]

  for (const account of accounts) {
    const passwordHash = hashPassword(account.password)
    const { data: existing } = await supabase
      .from("User")
      .select("id")
      .eq("email", account.email)
      .maybeSingle()

    let userId = existing?.id

    if (existing) {
      const { error } = await supabase
        .from("User")
        .update({
          name: account.name,
          phone: account.phone,
          passwordHash,
          role: account.role,
          active: true,
          specialization: (account as any).specialization || null,
          consultationFee: (account as any).consultationFee || null,
        })
        .eq("id", existing.id)

      if (error) console.error(`Error updating ${account.email}:`, error)
    } else {
      userId = "usr_" + randomBytes(10).toString("hex")
      const { error } = await supabase.from("User").insert({
        id: userId,
        name: account.name,
        email: account.email,
        phone: account.phone,
        passwordHash,
        role: account.role,
        active: true,
        specialization: (account as any).specialization || null,
        consultationFee: (account as any).consultationFee || null,
      })

      if (error) console.error(`Error inserting ${account.email}:`, error)
    }

    console.log(`✅ [${account.role}] ${account.name}`)
    console.log(`   📧 Email:    ${account.email}`)
    console.log(`   🔑 Password: ${account.password}`)
    console.log(`   🆔 User ID:  ${userId}\n`)
  }

  console.log("✨ All Supabase login accounts created / verified successfully!")
}

main().catch((err) => {
  console.error("❌ Error setting up accounts:", err.message || err)
  process.exit(1)
})
