"use server"

import { customAlphabet } from "nanoid"
import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, requireRole } from "@/lib/auth"
import { toPlain } from "@/lib/serialize"
import { logAudit } from "@/lib/audit"
import {
  adjustLoyaltyPointsSchema,
  redeemLoyaltyPointsSchema,
  type AdjustLoyaltyPointsInput,
  type RedeemLoyaltyPointsInput,
} from "@/lib/validations/loyalty"

const REFERRAL_BONUS_POINTS = 100
const codeAlphabet = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6)

export async function getOrCreateReferralCode(patientId: string) {
  const patient = await prisma.patient.findUniqueOrThrow({ where: { id: patientId } })
  if (patient.referralCode) return patient.referralCode

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = codeAlphabet()
    try {
      await prisma.patient.update({ where: { id: patientId }, data: { referralCode: code } })
      return code
    } catch {
      // unique collision — retry with a new code
    }
  }
  throw new Error("Could not generate a unique referral code, try again")
}

/** Applies a referrer's code to a newly-registered patient and awards the referrer bonus points. */
export async function applyReferralCode(newPatientId: string, code: string) {
  const referrer = await prisma.patient.findUnique({ where: { referralCode: code.trim().toUpperCase() } })
  if (!referrer) throw new Error("Referral code not found")
  if (referrer.id === newPatientId) throw new Error("A patient cannot refer themselves")

  const user = await getCurrentUser()

  await prisma.$transaction(async (tx) => {
    await tx.patient.update({ where: { id: newPatientId }, data: { referredById: referrer.id } })
    await tx.patient.update({ where: { id: referrer.id }, data: { loyaltyPoints: { increment: REFERRAL_BONUS_POINTS } } })
    await tx.loyaltyTransaction.create({
      data: {
        patientId: referrer.id,
        points: REFERRAL_BONUS_POINTS,
        type: "EARNED_REFERRAL",
        reason: `Referred a new patient`,
        createdById: user.id,
      },
    })
    await logAudit({
      action: "LOYALTY_REFERRAL_APPLIED",
      entityType: "LoyaltyTransaction",
      entityId: referrer.id,
      metadata: { newPatientId, referrerId: referrer.id, points: REFERRAL_BONUS_POINTS },
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      tx,
    })
  })

  revalidatePath(`/patients/${referrer.id}`)
}

export async function getPatientLoyalty(patientId: string) {
  const [patient, transactions, referrals] = await Promise.all([
    prisma.patient.findUniqueOrThrow({ where: { id: patientId } }),
    prisma.loyaltyTransaction.findMany({ where: { patientId }, orderBy: { createdAt: "desc" } }),
    prisma.patient.findMany({
      where: { referredById: patientId },
      select: { id: true, firstName: true, lastName: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return toPlain({
    referralCode: patient.referralCode,
    loyaltyPoints: patient.loyaltyPoints,
    transactions,
    referrals,
  })
}

export async function adjustLoyaltyPoints(input: AdjustLoyaltyPointsInput) {
  const user = await requireRole("ADMIN", "RECEPTIONIST", "BILLING")
  const data = adjustLoyaltyPointsSchema.parse(input)

  await prisma.$transaction(async (tx) => {
    const patient = await tx.patient.findUniqueOrThrow({ where: { id: data.patientId } })
    const newBalance = patient.loyaltyPoints + data.points
    if (newBalance < 0) throw new Error("Adjustment would take loyalty points below zero")

    await tx.patient.update({ where: { id: data.patientId }, data: { loyaltyPoints: newBalance } })
    const txn = await tx.loyaltyTransaction.create({
      data: {
        patientId: data.patientId,
        points: data.points,
        type: "ADJUSTED",
        reason: data.reason,
        createdById: user.id,
      },
    })
    await logAudit({
      action: "LOYALTY_POINTS_ADJUSTED",
      entityType: "LoyaltyTransaction",
      entityId: txn.id,
      metadata: { patientId: data.patientId, points: data.points, reason: data.reason },
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      tx,
    })
  })

  revalidatePath(`/patients/${data.patientId}`)
}

export async function redeemLoyaltyPoints(input: RedeemLoyaltyPointsInput) {
  const user = await requireRole("ADMIN", "RECEPTIONIST", "BILLING")
  const data = redeemLoyaltyPointsSchema.parse(input)

  await prisma.$transaction(async (tx) => {
    const patient = await tx.patient.findUniqueOrThrow({ where: { id: data.patientId } })
    if (patient.loyaltyPoints < data.points) throw new Error("Not enough loyalty points")

    await tx.patient.update({ where: { id: data.patientId }, data: { loyaltyPoints: { decrement: data.points } } })
    const txn = await tx.loyaltyTransaction.create({
      data: {
        patientId: data.patientId,
        points: -data.points,
        type: "REDEEMED",
        reason: data.reason,
        createdById: user.id,
      },
    })
    await logAudit({
      action: "LOYALTY_POINTS_REDEEMED",
      entityType: "LoyaltyTransaction",
      entityId: txn.id,
      metadata: { patientId: data.patientId, points: data.points, reason: data.reason },
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      tx,
    })
  })

  revalidatePath(`/patients/${data.patientId}`)
}
