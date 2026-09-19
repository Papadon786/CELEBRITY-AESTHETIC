import { cache } from "react"
import { cookies } from "next/headers"
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"
import { nanoid } from "nanoid"
import { prisma } from "@/lib/prisma"
import { serializeDecimal } from "@/lib/serialize"
import type { StaffRole, User } from "@/types/database"

const SESSION_COOKIE = "celebrity_session"
const FALLBACK_COOKIE = "zafoor_session"
const SESSION_TTL_DAYS = 30

export const DEFAULT_ADMIN: User = {
  id: "usr_admin_default",
  name: "Clinic Administrator",
  email: "admin@celebrityaesthetic.com",
  phone: "9591047171",
  passwordHash: "",
  role: "ADMIN" as StaffRole,
  specialization: "Aesthetic Clinic Management",
  consultationFee: null as any,
  active: true,
  permissions: null,
  createdAt: new Date(),
}

// ── Password hashing (scrypt, salted, constant-time compare) ─────────────

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

// ── Sessions ───────────────────────────────────────────────────────────

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
  const sessionId = "sess_" + nanoid(24)

  try {
    await prisma.session.create({
      data: {
        id: sessionId,
        userId,
        expiresAt,
      },
    })
  } catch (err) {
    console.warn("[createSession] session table insert skipped or failed:", err)
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })
}

export async function destroySession() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value
    if (sessionId) {
      await prisma.session.delete({ where: { id: sessionId } }).catch(() => {})
    }
    cookieStore.delete(SESSION_COOKIE)
  } catch {
    // ignore
  }
}

/**
 * Returns the currently signed-in user or the default Clinic Administrator.
 * Authentication is bypassed so the CRM can be accessed without a login screen.
 */
export const getCurrentUserOrNull = cache(async (): Promise<User> => {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value || cookieStore.get(FALLBACK_COOKIE)?.value

    if (sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
      })

      if (session?.user && session.user.active && new Date(session.expiresAt) >= new Date()) {
        return serializeDecimal(session.user as User, ["consultationFee"]) as User
      }
    }

    // Default to the first active admin user from the database
    const dbAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN", active: true },
      orderBy: { createdAt: "asc" },
    })

    if (dbAdmin) {
      return serializeDecimal(dbAdmin as User, ["consultationFee"]) as User
    }

    return DEFAULT_ADMIN
  } catch {
    return DEFAULT_ADMIN
  }
})

/**
 * Returns the current staff user. Does not redirect to login.
 */
export async function getCurrentUser(): Promise<User> {
  return await getCurrentUserOrNull()
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
