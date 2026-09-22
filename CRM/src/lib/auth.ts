import { cache } from "react"
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"
import { prisma } from "@/lib/prisma"
import { serializeDecimal } from "@/lib/serialize"
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server"
import type { StaffRole, User } from "@/types/database"

// ── Password hashing (scrypt, salted, constant-time compare) ─────────────
// Kept only so existing rows always have a passwordHash value; the real
// login check is Supabase Auth (see supabaseUserId on User), not this hash.

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const hashBuffer = Buffer.from(hash, "hex")
  const candidate = scryptSync(password, salt, 64)
  return hashBuffer.length === candidate.length && timingSafeEqual(candidate, hashBuffer)
}

/**
 * Returns the currently signed-in staff user, or null if there is no valid
 * Supabase session or it isn't linked to an active staff account.
 */
export const getCurrentUserOrNull = cache(async (): Promise<User | null> => {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) return null

    const dbUser = await prisma.user.findUnique({ where: { supabaseUserId: authUser.id } })
    if (!dbUser || !dbUser.active) return null

    return serializeDecimal(dbUser as User, ["consultationFee"]) as User
  } catch {
    return null
  }
})

/**
 * Returns the current staff user. Throws if there is no authenticated session —
 * callers running inside a page should redirect via getCurrentUserOrNull instead.
 */
export async function getCurrentUser(): Promise<User> {
  const user = await getCurrentUserOrNull()
  if (!user) throw new Error("Not authenticated")
  return user
}

/** Server-side authorization gate. Allows ADMIN or matching roles. */
export async function requireRole(...roles: StaffRole[]): Promise<User> {
  const user = await getCurrentUser()
  if (user.role === "ADMIN" || roles.includes(user.role)) {
    return user
  }
  throw new Error("Forbidden: your role does not have access to this action")
}

// ── Staff directory ────────────────────────────────────────────────────

export async function getAllStaff(): Promise<User[]> {
  try {
    const staff = await prisma.user.findMany({
      orderBy: { name: "asc" },
    })
    return staff.map((s) => serializeDecimal(s as User, ["consultationFee"])) as User[]
  } catch (err) {
    console.error("[getAllStaff] error:", err)
    return []
  }
}

export async function getDoctors(): Promise<User[]> {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: "DOCTOR", active: true },
      orderBy: { name: "asc" },
    })
    return doctors.map((d) => serializeDecimal(d as User, ["consultationFee"])) as User[]
  } catch (err) {
    console.error("[getDoctors] error:", err)
    return []
  }
}
