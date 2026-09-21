"use server"

import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, requireRole } from "@/lib/auth"
import { toPlain } from "@/lib/serialize"
import { logAudit } from "@/lib/audit"

export async function getServiceChecklist(serviceId: string) {
  const items = await prisma.procedureChecklistItem.findMany({
    where: { serviceId },
    orderBy: { displayOrder: "asc" },
  })
  return toPlain(items)
}

export async function addChecklistItem(serviceId: string, label: string) {
  const user = await requireRole("ADMIN", "DOCTOR")
  if (!label.trim()) throw new Error("Label is required")

  const count = await prisma.procedureChecklistItem.count({ where: { serviceId } })
  const item = await prisma.procedureChecklistItem.create({
    data: { serviceId, label: label.trim(), displayOrder: count },
  })

  await logAudit({
    action: "CHECKLIST_ITEM_ADDED",
    entityType: "ProcedureChecklistItem",
    entityId: item.id,
    metadata: { serviceId, label },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath("/services")
  return toPlain(item)
}

export async function deleteChecklistItem(id: string) {
  const user = await requireRole("ADMIN", "DOCTOR")
  await prisma.procedureChecklistItem.delete({ where: { id } })

  await logAudit({
    action: "CHECKLIST_ITEM_DELETED",
    entityType: "ProcedureChecklistItem",
    entityId: id,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  revalidatePath("/services")
}

/** Returns the appointment's service checklist template merged with completion state. */
export async function getAppointmentChecklist(appointmentId: string) {
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
    select: { serviceId: true },
  })
  if (!appointment.serviceId) return []

  const [templateItems, completions] = await Promise.all([
    prisma.procedureChecklistItem.findMany({ where: { serviceId: appointment.serviceId }, orderBy: { displayOrder: "asc" } }),
    prisma.appointmentChecklistItem.findMany({ where: { appointmentId }, include: { checkedBy: { select: { name: true } } } }),
  ])

  const completionByItemId = new Map(completions.map((c) => [c.checklistItemId, c]))

  return toPlain(
    templateItems.map((item) => ({
      checklistItem: item,
      completion: completionByItemId.get(item.id) ?? null,
    }))
  )
}

export async function toggleChecklistItem(appointmentId: string, checklistItemId: string, checked: boolean) {
  const user = await getCurrentUser()

  const record = await prisma.appointmentChecklistItem.upsert({
    where: { appointmentId_checklistItemId: { appointmentId, checklistItemId } },
    update: { checked, checkedById: checked ? user.id : null, checkedAt: checked ? new Date() : null },
    create: { appointmentId, checklistItemId, checked, checkedById: checked ? user.id : null, checkedAt: checked ? new Date() : null },
  })

  await logAudit({
    action: "CHECKLIST_ITEM_TOGGLED",
    entityType: "AppointmentChecklistItem",
    entityId: record.id,
    metadata: { appointmentId, checklistItemId, checked },
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  })

  return toPlain(record)
}
