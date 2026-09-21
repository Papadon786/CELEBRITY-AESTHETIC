"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { resourceSchema, type ResourceInput } from "@/lib/validations/resources"

export async function getResources(activeOnly = false) {
  return prisma.resource.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: [{ type: "asc" }, { name: "asc" }],
  })
}

export async function createResource(input: ResourceInput) {
  await requireRole("ADMIN")
  const data = resourceSchema.parse(input)
  const resource = await prisma.resource.create({ data })
  revalidatePath("/resources")
  return resource
}

export async function updateResource(id: string, input: ResourceInput) {
  await requireRole("ADMIN")
  const data = resourceSchema.parse(input)
  const resource = await prisma.resource.update({ where: { id }, data })
  revalidatePath("/resources")
  return resource
}

export async function toggleResourceActive(id: string, active: boolean) {
  await requireRole("ADMIN")
  await prisma.resource.update({ where: { id }, data: { active } })
  revalidatePath("/resources")
}

/** What's booked on this resource today — the double-booking check surfaced to staff. */
export async function getResourceScheduleToday(resourceId: string) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  return prisma.appointment.findMany({
    where: {
      resourceId,
      scheduledAt: { gte: start, lte: end },
      status: { in: ["PENDING", "CONFIRMED", "ARRIVED", "IN_CONSULTATION"] },
    },
    include: { patient: true, doctor: true },
    orderBy: { scheduledAt: "asc" },
  })
}
