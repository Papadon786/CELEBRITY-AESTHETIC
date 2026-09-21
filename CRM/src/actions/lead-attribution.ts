"use server"

import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { toPlain } from "@/lib/serialize"
import { logAudit } from "@/lib/audit"

const LEAD_SOURCES = ["LINKEDIN", "WEBSITE", "INSTAGRAM", "WHATSAPP", "GOOGLE", "REFERRAL", "WALK_IN", "PHONE", "OTHER"] as const

export async function getLeadSourceReport() {
  await requireRole("ADMIN", "SALES")

  const [leads, spends] = await Promise.all([
    prisma.lead.findMany({ select: { source: true, status: true, convertedPatientId: true } }),
    prisma.leadSourceSpend.findMany(),
  ])

  const convertedPatientIdsBySource = new Map<string, string[]>()
  for (const lead of leads) {
    if (lead.convertedPatientId) {
      const list = convertedPatientIdsBySource.get(lead.source) ?? []
      list.push(lead.convertedPatientId)
      convertedPatientIdsBySource.set(lead.source, list)
    }
  }

  const allConvertedIds = leads.map((l) => l.convertedPatientId).filter((id): id is string => !!id)
  const bills = allConvertedIds.length
    ? await prisma.bill.findMany({
        where: { patientId: { in: allConvertedIds }, status: { not: "CANCELLED" } },
        select: { patientId: true, netAmount: true },
      })
    : []

  const revenueByPatient = new Map<string, number>()
  for (const bill of bills) {
    revenueByPatient.set(bill.patientId, (revenueByPatient.get(bill.patientId) ?? 0) + Number(bill.netAmount))
  }

  const spendBySource = new Map(spends.map((s) => [s.source, Number(s.amount)]))

  const report = LEAD_SOURCES.map((source) => {
    const sourceLeads = leads.filter((l) => l.source === source)
    const converted = sourceLeads.filter((l) => l.convertedPatientId).length
    const patientIds = convertedPatientIdsBySource.get(source) ?? []
    const revenue = patientIds.reduce((sum, id) => sum + (revenueByPatient.get(id) ?? 0), 0)
    const spend = spendBySource.get(source) ?? 0

    return {
      source,
      totalLeads: sourceLeads.length,
      convertedLeads: converted,
      conversionRate: sourceLeads.length ? converted / sourceLeads.length : 0,
      revenue,
      spend,
      roi: spend > 0 ? (revenue - spend) / spend : null,
    }
  })

  return toPlain(report)
}

export async function setLeadSourceSpend(source: string, amount: number) {
  const user = await requireRole("ADMIN")
  if (!LEAD_SOURCES.includes(source as (typeof LEAD_SOURCES)[number])) throw new Error("Invalid lead source")
  if (amount < 0) throw new Error("Amount cannot be negative")

  const record = await prisma.leadSourceSpend.upsert({
    where: { source: source as (typeof LEAD_SOURCES)[number] },
    update: { amount },
    create: { source: source as (typeof LEAD_SOURCES)[number], amount },
  })

  await logAudit({
    action: "LEAD_SOURCE_SPEND_UPDATED",
    entityType: "LeadSourceSpend",
    entityId: record.id,
    metadata: { source, amount },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath("/leads/attribution")
  return toPlain(record)
}
