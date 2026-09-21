"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { toPlain } from "@/lib/serialize"
import { logAudit } from "@/lib/audit"
import {
  createCommissionSchema,
  salesTargetSchema,
  type CreateCommissionInput,
  type SalesTargetInput,
} from "@/lib/validations/commissions"

export async function getCommissions(params?: { userId?: string; status?: string }) {
  const commissions = await prisma.commission.findMany({
    where: {
      userId: params?.userId,
      status: (params?.status as any) || undefined,
    },
    include: { user: true, bill: true },
    orderBy: { createdAt: "desc" },
  })
  return toPlain(commissions)
}

export async function createCommission(input: CreateCommissionInput) {
  const user = await requireRole("ADMIN")
  const data = createCommissionSchema.parse(input)

  const commission = await prisma.commission.create({
    data: {
      userId: data.userId,
      billId: data.billId || null,
      saleAmount: data.saleAmount,
      ratePercent: data.ratePercent,
      amount: data.amount,
      notes: data.notes,
      createdById: user.id,
    },
  })

  await logAudit({
    action: "COMMISSION_CREATED",
    entityType: "Commission",
    entityId: commission.id,
    metadata: { userId: data.userId, amount: data.amount },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath("/sales/commissions")
  return toPlain(commission)
}

export async function updateCommissionStatus(id: string, status: "APPROVED" | "PAID" | "REJECTED") {
  const user = await requireRole("ADMIN")
  const commission = await prisma.commission.update({
    where: { id },
    data: { status, paidAt: status === "PAID" ? new Date() : undefined },
  })

  await logAudit({
    action: status === "PAID" ? "COMMISSION_PAID" : "COMMISSION_APPROVED",
    entityType: "Commission",
    entityId: id,
    metadata: { status },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath("/sales/commissions")
  return toPlain(commission)
}

// ── Sales targets ───────────────────────────────────────────────────────

export async function getSalesTargets(userId?: string) {
  const targets = await prisma.salesTarget.findMany({
    where: { userId },
    include: { user: true },
    orderBy: { periodStart: "desc" },
  })
  return toPlain(targets)
}

export async function createSalesTarget(input: SalesTargetInput) {
  const user = await requireRole("ADMIN")
  const data = salesTargetSchema.parse(input)
  const target = await prisma.salesTarget.create({ data })
  await logAudit({
    action: "SALES_TARGET_CREATED",
    entityType: "SalesTarget",
    entityId: target.id,
    metadata: { userId: data.userId, targetAmount: data.targetAmount },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })
  revalidatePath("/sales/commissions")
  return toPlain(target)
}

/** Commission earned so far vs. target, for the given period. */
export async function getSalesPerformance(userId: string, periodStart: Date, periodEnd: Date) {
  const [earned, target] = await Promise.all([
    prisma.commission.aggregate({
      where: { userId, status: { in: ["APPROVED", "PAID"] }, createdAt: { gte: periodStart, lte: periodEnd } },
      _sum: { amount: true, saleAmount: true },
    }),
    prisma.salesTarget.findFirst({
      where: { userId, periodStart: { lte: periodEnd }, periodEnd: { gte: periodStart } },
    }),
  ])

  return {
    commissionEarned: Number(earned._sum.amount ?? 0),
    salesTotal: Number(earned._sum.saleAmount ?? 0),
    target: target ? Number(target.targetAmount) : null,
  }
}
