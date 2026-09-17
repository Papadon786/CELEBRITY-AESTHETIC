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
  console.log(" Zafoor Clinic CRM — Supabase Admin & Staff Account Setup")
  console.log("=========================================================\n")

  const accounts = [
    // Primary / Production Logins
    {
      name: "Dr. Mufeeda Roohi",
      email: "mufeeda@zafoorclinic.com",
      phone: "8940399403",
      password: "ZafoorClinic#Mufeeda",
      role: "ADMIN" as const,
      specialization: "Aesthetic Physician, Diabetologist & Family Physician",
      consultationFee: 500,
    },
    {
      name: "Clinic Administrator",
      email: "admin@zafoorclinic.com",
      phone: "8940399403",
      password: "Admin@123456",
      role: "ADMIN" as const,
    },
    {
      name: "Dr. Mufeeda Roohi",
      email: "doctor@zafoorclinic.com",
      phone: "8940399403",
      password: "Doctor@123",
      role: "DOCTOR" as const,
      specialization: "Aesthetic Physician, Diabetologist & Family Physician",
      consultationFee: 500,
    },
    {
      name: "Front Desk Receptionist",
      email: "reception@zafoorclinic.com",
      phone: "8940399403",
      password: "Reception@123456",
      role: "RECEPTIONIST" as const,
    },
    {
      name: "Front Desk Receptionist (Staff 1)",
      email: "reception1@zafoorclinic.com",
      phone: "8940399403",
      password: "Reception@123",
      role: "RECEPTIONIST" as const,
    },
    {
      name: "Patient Desk Receptionist (Staff 2)",
      email: "reception2@zafoorclinic.com",
      phone: "8940399403",
      password: "Reception@123",
      role: "RECEPTIONIST" as const,
    },
    // Standard Demo / Test Logins
    {
      name: "Demo Admin",
      email: "admin@zafoorclinic.test",
      phone: "8940399403",
      password: "ChangeMe123!",
      role: "ADMIN" as const,
    },
    {
      name: "Demo Receptionist",
      email: "reception@zafoorclinic.test",
      phone: "8940399403",
      password: "ChangeMe123!",
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
