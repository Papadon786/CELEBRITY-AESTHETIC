"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, requireRole } from "@/lib/auth"
import { serializeDecimal, toPlain } from "@/lib/serialize"
import { logAudit } from "@/lib/audit"
import {
  treatmentPackageSchema,
  assignPackageSchema,
  usePackageSessionSchema,
  type TreatmentPackageInput,
  type AssignPackageInput,
  type UsePackageSessionInput,
} from "@/lib/validations/packages"

// ── Catalog (admin-managed) ────────────────────────────────────────────

export async function listTreatmentPackages(activeOnly = false) {
  const packages = await prisma.treatmentPackage.findMany({
    where: activeOnly ? { active: true } : undefined,
    include: { service: true },
    orderBy: { name: "asc" },
  })
  return packages.map((p) => serializeDecimal(p, ["price"]))
}

export async function createTreatmentPackage(input: TreatmentPackageInput) {
  await requireRole("ADMIN")
  const data = treatmentPackageSchema.parse(input)
  const pkg = await prisma.treatmentPackage.create({ data })
  await logAudit({ action: "PACKAGE_CREATED", entityType: "TreatmentPackage", entityId: pkg.id, metadata: { name: pkg.name } })
  revalidatePath("/services/packages")
  return serializeDecimal(pkg, ["price"])
}

export async function updateTreatmentPackage(id: string, input: TreatmentPackageInput) {
  await requireRole("ADMIN")
  const data = treatmentPackageSchema.parse(input)
  const pkg = await prisma.treatmentPackage.update({ where: { id }, data })
  revalidatePath("/services/packages")
  return serializeDecimal(pkg, ["price"])
}

export async function toggleTreatmentPackageActive(id: string, active: boolean) {
  await requireRole("ADMIN")
  await prisma.treatmentPackage.update({ where: { id }, data: { active } })
  revalidatePath("/services/packages")
}

// ── Patient packages (what a patient actually bought) ─────────────────

export async function getPatientPackages(patientId: string) {
  const packages = await prisma.patientPackage.findMany({
    where: { patientId },
    include: {
      package: true,
      sessionLogs: { orderBy: { usedAt: "desc" }, include: { performedBy: true, appointment: true } },
    },
    orderBy: { purchasedAt: "desc" },
  })
  return toPlain(packages)
}

export async function assignPackageToPatient(input: AssignPackageInput) {
  const user = await requireRole("ADMIN", "RECEPTIONIST", "BILLING")
  const data = assignPackageSchema.parse(input)

  const pkg = await prisma.treatmentPackage.findUnique({ where: { id: data.packageId } })
  if (!pkg) throw new Error("Package not found")

  const expiresAt =
    data.expiresAt ?? (pkg.validityDays ? new Date(Date.now() + pkg.validityDays * 86400000) : null)

  const patientPackage = await prisma.patientPackage.create({
    data: {
      patientId: data.patientId,
      packageId: data.packageId,
      billId: data.billId || null,
      sessionsTotal: data.sessionsTotal ?? pkg.totalSessions,
      expiresAt,
      notes: data.notes,
    },
  })

  await logAudit({
    action: "PACKAGE_ASSIGNED",
    entityType: "PatientPackage",
    entityId: patientPackage.id,
    metadata: { packageId: pkg.id, packageName: pkg.name, patientId: data.patientId },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath(`/patients/${data.patientId}`)
  return toPlain(patientPackage)
}

export async function usePackageSession(input: UsePackageSessionInput) {
  const user = await requireRole("ADMIN", "DOCTOR", "RECEPTIONIST")
  const data = usePackageSessionSchema.parse(input)

  const result = await prisma.$transaction(async (tx) => {
    const patientPackage = await tx.patientPackage.findUnique({ where: { id: data.patientPackageId } })
    if (!patientPackage) throw new Error("Package not found")
    if (patientPackage.status !== "ACTIVE") throw new Error(`This package is ${patientPackage.status.toLowerCase()}, no sessions can be used`)
    if (patientPackage.sessionsUsed >= patientPackage.sessionsTotal) {
      throw new Error("All sessions in this package have already been used")
    }
    if (patientPackage.expiresAt && patientPackage.expiresAt < new Date()) {
      await tx.patientPackage.update({ where: { id: patientPackage.id }, data: { status: "EXPIRED" } })
      throw new Error("This package has expired")
    }

    const sessionsUsed = patientPackage.sessionsUsed + 1
    const isComplete = sessionsUsed >= patientPackage.sessionsTotal

    await tx.patientPackage.update({
      where: { id: patientPackage.id },
      data: { sessionsUsed, status: isComplete ? "COMPLETED" : "ACTIVE" },
    })

    const log = await tx.packageSessionLog.create({
      data: {
        patientPackageId: patientPackage.id,
        appointmentId: data.appointmentId || null,
        performedById: user.id,
        notes: data.notes,
      },
    })

    return { patientPackage, log, sessionsUsed }
  })

  await logAudit({
    action: "PACKAGE_SESSION_USED",
    entityType: "PatientPackage",
    entityId: result.patientPackage.id,
    metadata: { sessionsUsed: result.sessionsUsed, sessionsTotal: result.patientPackage.sessionsTotal },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath(`/patients/${result.patientPackage.patientId}`)
  return toPlain(result)
}

export async function cancelPatientPackage(id: string, reason?: string) {
  const user = await requireRole("ADMIN")
  const patientPackage = await prisma.patientPackage.update({
    where: { id },
    data: { status: "CANCELLED", notes: reason },
  })
  await logAudit({
    action: "PACKAGE_CANCELLED",
    entityType: "PatientPackage",
    entityId: id,
    metadata: { reason },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })
  revalidatePath(`/patients/${patientPackage.patientId}`)
  return toPlain(patientPackage)
}
